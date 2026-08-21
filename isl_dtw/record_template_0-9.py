import os
import sys
import time
import argparse
import cv2
import numpy as np

from utils import init_holistic, extract_holistic_features, draw_holistic_landmarks, FEATURE_DIM

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
WINDOW_NAME = "SignKYC - Record Digits 0-9 (Holistic)"

TEMPLATES_PER_CLASS = 10
MAX_FRAMES_PER_TEMPLATE = 40
COUNTDOWN_SECONDS = 2.0
DIGITS = [str(i) for i in range(10)]

def draw_overlay(
    frame: np.ndarray,
    gesture_name: str,
    state: str,
    recorded_count: int,
    current_frames: int = 0,
    countdown_remaining: float = 0.0,
    save_path: str = ""
):
    h, w, _ = frame.shape

    # Top semi-transparent header bar
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 85), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Title & Gesture info
    cv2.putText(frame, "SignKYC Digits 0-9 Automated Batch Recorder", (15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.70, (0, 220, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Target Digit: '{gesture_name}' ({recorded_count}/{TEMPLATES_PER_CLASS} completed)", (15, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)

    # State Badge / Instructions
    if state == "IDLE":
        cv2.rectangle(frame, (15, 100), (450, 140), (200, 0, 0), -1)
        cv2.putText(frame, "Press 's' to start batch, 'n' to skip", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    elif state == "COUNTDOWN":
        cv2.rectangle(frame, (15, 100), (350, 140), (0, 140, 255), -1)
        cv2.putText(frame, f"GET READY... {countdown_remaining:.1f}s", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)

    elif state == "RECORDING":
        cv2.rectangle(frame, (15, 100), (350, 140), (0, 0, 255), -1)
        cv2.putText(frame, f"RECORDING... ({current_frames}/{MAX_FRAMES_PER_TEMPLATE})", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        
        # Progress bar
        cv2.rectangle(frame, (15, 150), (15 + int((current_frames / MAX_FRAMES_PER_TEMPLATE) * 335), 160), (0, 0, 255), -1)
    
    elif state == "SAVED":
        cv2.rectangle(frame, (15, 100), (500, 140), (0, 200, 0), -1)
        cv2.putText(frame, f"SAVED! ({save_path})", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        
    elif state == "DONE":
        cv2.rectangle(frame, (15, 100), (500, 140), (0, 255, 0), -1)
        cv2.putText(frame, "DIGIT COMPLETE! PRESS 'n' FOR NEXT", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2, cv2.LINE_AA)


def main():
    os.makedirs(TEMPLATES_DIR, exist_ok=True)

    if os.name == 'nt':
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open camera.")
        sys.exit(1)

    holistic = init_holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    digit_idx = 0
    gesture_name = DIGITS[digit_idx]
    
    recorded_count = 0
    state = "IDLE"  # IDLE, COUNTDOWN, RECORDING, SAVED, DONE
    feature_sequence = []
    save_path = ""
    
    countdown_start_time = 0
    saved_display_start = 0
    countdown_remaining = 0.0

    print("\n" + "="*50)
    print(" 🔢 Automated Batch Recording for Digits 0-9")
    print(f" -> Current Digit: '{gesture_name}'")
    print(f" -> Press 's' to start {TEMPLATES_PER_CLASS}-variation batch.")
    print(" -> Press 'n' to skip to the next digit early.")
    print(" -> Press 'q' to quit at any time.")
    print("="*50 + "\n")

    try:
        cv2.namedWindow(WINDOW_NAME)
        while True:
            # Check window close natively
            if cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE) < 1:
                break

            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame from camera.")
                break

            frame = cv2.flip(frame, 1)

            feature_vec, results = extract_holistic_features(frame, holistic)
            draw_holistic_landmarks(frame, results)

            key = cv2.waitKey(1) & 0xFF


            
            if state == "IDLE":
                if key == ord('s'):
                    state = "COUNTDOWN"
                    countdown_start_time = time.time()
                elif key == ord('n'):
                    digit_idx += 1
                    if digit_idx >= len(DIGITS):
                        print("🎉 All digits recorded!")
                        break
                    gesture_name = DIGITS[digit_idx]
                    recorded_count = 0
                    print(f"\n---> Current Digit: '{gesture_name}' (Press 's' to start)")
            
            elif state == "COUNTDOWN":
                elapsed = time.time() - countdown_start_time
                if elapsed >= COUNTDOWN_SECONDS:
                    state = "RECORDING"
                    feature_sequence = []
                else:
                    countdown_remaining = max(0.0, COUNTDOWN_SECONDS - elapsed)

            elif state == "RECORDING":
                feature_sequence.append(feature_vec)
                if len(feature_sequence) >= MAX_FRAMES_PER_TEMPLATE:
                    recorded_count += 1
                    padded_count = str(recorded_count).zfill(2)
                    filename = f"reference_{gesture_name}_{padded_count}.npy"
                    save_path = os.path.join(TEMPLATES_DIR, filename)
                    
                    np.save(save_path, np.array(feature_sequence, dtype=np.float32))
                    print(f"[{recorded_count}/{TEMPLATES_PER_CLASS}] Saved digit {gesture_name}: {filename}")
                    
                    state = "SAVED"
                    saved_display_start = time.time()

            elif state == "SAVED":
                if time.time() - saved_display_start > 1.0:
                    if recorded_count < TEMPLATES_PER_CLASS:
                        state = "COUNTDOWN"
                        countdown_start_time = time.time()
                    else:
                        state = "DONE"
                        
            elif state == "DONE":
                if key == ord('n'):
                    digit_idx += 1
                    if digit_idx >= len(DIGITS):
                        print("🎉 All digits recorded! Exiting.")
                        break
                    gesture_name = DIGITS[digit_idx]
                    recorded_count = 0
                    state = "IDLE"
                    print(f"\n---> Current Digit: '{gesture_name}' (Press 's' to start)")

            # Draw overlay
            draw_overlay(
                frame, 
                gesture_name, 
                state, 
                recorded_count, 
                current_frames=len(feature_sequence) if state == "RECORDING" else 0,
                countdown_remaining=countdown_remaining if state == "COUNTDOWN" else 0.0,
                save_path=os.path.basename(save_path)
            )

            cv2.imshow(WINDOW_NAME, frame)

            if key == ord('q'):
                print("Recording cancelled by user.")
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        holistic.close()


if __name__ == "__main__":
    main()
