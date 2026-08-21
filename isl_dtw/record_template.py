import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['GLOG_minloglevel'] = '2'
import sys
import time
import argparse
import cv2
import numpy as np

from utils import init_holistic, extract_holistic_features, draw_holistic_landmarks, FEATURE_DIM

RECORD_FRAMES_MIN = 10
TEMPLATES_PER_CLASS = 10
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
WINDOW_NAME = "SignKYC - Record Template (Holistic)"

def draw_overlay(
    frame: np.ndarray,
    gesture_name: str,
    state: str,
    recorded_count: int,
    total_frames: int,
    save_path: str = ""
):
    h, w, _ = frame.shape
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 85), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    cv2.putText(frame, "SignKYC Template Recorder (Holistic)", (15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 220, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Target Gesture: '{gesture_name.upper()}'", (15, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)

    if state == "IDLE":
        cv2.putText(frame, f"READY - Press SPACE to Start Recording '{gesture_name}' (Template {recorded_count}/{total_frames})", (15, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA)
    elif state == "RECORDING":
        cv2.circle(frame, (w - 30, 40), 12, (0, 0, 255), -1)
        cv2.putText(frame, "REC", (w - 75, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2, cv2.LINE_AA)
        bar_x1, bar_y1 = 20, h - 50
        bar_w = w - 40
        bar_h = 24
        cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x1 + bar_w, bar_y1 + bar_h), (50, 50, 50), -1)
        cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x1 + bar_w, bar_y1 + bar_h), (255, 255, 255), 1)
        cv2.putText(frame, f"Recording... (Frames: {recorded_count}) | Press SPACE to Stop", (bar_x1 + 10, bar_y1 + 17), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 215, 255), 2, cv2.LINE_AA)
    elif state == "SAVED":
        cv2.putText(frame, f"SAVED '{gesture_name}'! 'N' for Next Variation | 'R' to Retry | 'Q' to Quit", (15, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 2, cv2.LINE_AA)


def main():
    parser = argparse.ArgumentParser(description="Record a named ISL gesture reference template using MediaPipe Holistic.")
    parser.add_argument("--name", type=str, default=None, help="Name of the gesture (e.g., 'hello', 'namaste').")
    parser.add_argument("--camera", type=int, default=0, help="Webcam camera device index (default: 0).")
    args = parser.parse_args()

    gesture_name = args.name
    if not gesture_name:
        gesture_name = input("Enter the gesture name to record (e.g. namaste, hello): ").strip()
        if not gesture_name:
            print("Error: Gesture name cannot be empty.")
            sys.exit(1)

    gesture_name = gesture_name.lower().replace(" ", "_")
    os.makedirs(TEMPLATES_DIR, exist_ok=True)

    current_template = 1
    def get_save_path():
        return os.path.join(TEMPLATES_DIR, f"reference_{gesture_name}_{current_template:02d}.npy")
    
    save_path = get_save_path()

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}.")
        sys.exit(1)

    holistic = init_holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    state = "IDLE"
    recorded_frames = []

    print("=" * 60)
    print(f"SignKYC ISL Template Recorder (Holistic) - Gesture: [{gesture_name}]")
    print(f"Press 'SPACE' to start recording, then press 'SPACE' again to stop.")
    print("=" * 60)

    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_AUTOSIZE)

    try:
        while True:
            try:
                if cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE) < 1:
                    break
            except cv2.error:
                break

            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)

            feature_vector, results = extract_holistic_features(frame, holistic)
            frame = draw_holistic_landmarks(frame, results)

            if state == "RECORDING":
                recorded_frames.append(feature_vector)

            draw_overlay(
                frame=frame,
                gesture_name=gesture_name,
                state=state,
                recorded_count=current_template if state == "IDLE" else len(recorded_frames),
                total_frames=TEMPLATES_PER_CLASS,
                save_path=save_path
            )

            cv2.imshow(WINDOW_NAME, frame)

            key = cv2.waitKey(1) & 0xFF
            if key in [ord("q"), ord("Q"), 27]:
                break
            elif key == 32: # Spacebar
                if state == "IDLE":
                    print(f"[INFO] Recording started for '{gesture_name}' (Template {current_template})...")
                    recorded_frames = []
                    state = "RECORDING"
                elif state == "RECORDING":
                    if len(recorded_frames) >= RECORD_FRAMES_MIN:
                        template_array = np.array(recorded_frames, dtype=np.float32)
                        np.save(save_path, template_array)
                        print(f"\n[SUCCESS] Saved '{gesture_name}' template {current_template} to '{save_path}'")
                        state = "SAVED"
                    else:
                        print(f"\n[WARNING] Recording too short ({len(recorded_frames)} frames). Minimum is {RECORD_FRAMES_MIN}.")
                        state = "IDLE"
            elif key in [ord("n"), ord("N")] and state == "SAVED":
                if current_template < TEMPLATES_PER_CLASS:
                    current_template += 1
                else:
                    print(f"Completed {TEMPLATES_PER_CLASS} variations for {gesture_name}!")
                    break
                save_path = get_save_path()
                state = "IDLE"
            elif key in [ord("r"), ord("R")] and state == "SAVED":
                print(f"[INFO] Retrying '{gesture_name}' template {current_template}...")
                state = "IDLE"
    finally:
        holistic.close()
        cap.release()
        cv2.destroyAllWindows()
        for _ in range(5):
            cv2.waitKey(1)

if __name__ == "__main__":
    main()
