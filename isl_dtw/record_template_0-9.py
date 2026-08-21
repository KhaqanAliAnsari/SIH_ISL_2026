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

RECORD_FRAMES_MIN = 10 # Require at least 10 frames to avoid accidental short presses
TEMPLATES_PER_CLASS = 10
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
WINDOW_NAME = "SignKYC - Record Digits 0-9 (Holistic)"

def draw_overlay(
    frame: np.ndarray,
    gesture_name: str,
    state: str,
    recorded_count: int,
    total_frames: int,
    save_path: str = "",
    countdown_remaining: float = 0.0,
    is_last: bool = False
):
    """
    Draws informative HUD UI and recording progress bar on the video frame.
    """
    h, w, _ = frame.shape

    # Top semi-transparent header bar
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 85), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Title & Gesture info
    cv2.putText(
        frame,
        "SignKYC Digits 0-9 Recorder (Holistic)",
        (15, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        (0, 220, 255),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        frame,
        f"Target Gesture: '{gesture_name.upper()}'",
        (15, 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    # State Badge / Instructions
    if state == "IDLE":
        # Amber / Cyan status
        cv2.putText(
            frame,
            f"READY - Press SPACE to Start Recording '{gesture_name}' (Template {recorded_count}/{total_frames})",
            (15, h - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 255),
            2,
            cv2.LINE_AA,
        )

    elif state == "RECORDING":
        # Red pulsing recording indicator
        cv2.circle(frame, (w - 30, 40), 12, (0, 0, 255), -1)
        cv2.putText(
            frame,
            "REC",
            (w - 75, 46),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2,
            cv2.LINE_AA,
        )

        # Progress bar is now just a frame counter since length is variable
        bar_x1, bar_y1 = 20, h - 50
        bar_w = w - 40
        bar_h = 24
        cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x1 + bar_w, bar_y1 + bar_h), (50, 50, 50), -1)
        
        cv2.rectangle(
            frame,
            (bar_x1, bar_y1),
            (bar_x1 + bar_w, bar_y1 + bar_h),
            (255, 255, 255),
            1,
        )

        progress_text = f"Recording... (Frames: {recorded_count}) | Press SPACE to Stop"
        cv2.putText(
            frame,
            progress_text,
            (bar_x1 + 10, bar_y1 + 17),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 215, 255),
            2,
            cv2.LINE_AA,
        )
    elif state == "SAVED":
        if is_last:
            prompt = f"ALL DIGITS (0-9) SAVED! Press 'Q' to Quit."
        else:
            prompt = f"SAVED '{gesture_name}'! 'N' for Next | 'R' to Retry"

        cv2.putText(
            frame,
            prompt,
            (15, h - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

def main():
    parser = argparse.ArgumentParser(description="Record digits 0-9 sequentially")
    parser.add_argument("--camera", type=int, default=0, help="Webcam device index (default: 0).")
    args = parser.parse_args()

    os.makedirs(TEMPLATES_DIR, exist_ok=True)

    target_gestures = [str(i) for i in range(10)]
    current_idx = 0
    current_template = 1
    gesture_name = target_gestures[current_idx]
    
    def get_save_path():
        return os.path.join(TEMPLATES_DIR, f"reference_{gesture_name}_{current_template:02d}.npy")
    
    save_path = get_save_path()

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}.")
        sys.exit(1)

    holistic = init_holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    state = "IDLE"  # IDLE, RECORDING, SAVED
    recorded_frames = []
    
    print("=" * 60)
    print("SignKYC Sequential Template Recorder [0-9]")
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
                print("Failed to grab frame from camera.")
                break

            frame = cv2.flip(frame, 1)

            feature_vector, results = extract_holistic_features(frame, holistic)
            frame = draw_holistic_landmarks(frame, results)

            if state == "RECORDING":
                recorded_frames.append(feature_vector)

            is_last = (current_idx == len(target_gestures) - 1)

            draw_overlay(
                frame=frame,
                gesture_name=gesture_name,
                state=state,
                recorded_count=current_template if state == "IDLE" else len(recorded_frames),
                total_frames=TEMPLATES_PER_CLASS,
                save_path=save_path,
                countdown_remaining=0.0,
                is_last=is_last
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
                        
            elif key in [ord("n"), ord("N")] and state == "SAVED" and not is_last:
                if current_template < TEMPLATES_PER_CLASS:
                    current_template += 1
                else:
                    current_idx += 1
                    current_template = 1
                
                gesture_name = target_gestures[current_idx]
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
