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
DIGITS = [str(i) for i in range(10)]

def draw_overlay(
    frame: np.ndarray,
    gesture_name: str,
    state: str,
    recorded_count: int,
    current_frames: int = 0,
    save_path: str = "",
    is_last: bool = False
):
    h, w, _ = frame.shape

    # Top semi-transparent header bar
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 85), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Title & Gesture info
    cv2.putText(frame, "SignKYC Digits 0-9 Recorder (Holistic)", (15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 220, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Target Gesture: '{gesture_name.upper()}' ({recorded_count}/{TEMPLATES_PER_CLASS} completed)", (15, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)

    # State Badge / Instructions
    if state == "IDLE":
        cv2.rectangle(frame, (15, 100), (450, 140), (200, 0, 0), -1)
        cv2.putText(frame, "HOLD [SPACEBAR] to Record", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    elif state == "RECORDING":
        cv2.rectangle(frame, (15, 100), (350, 140), (0, 0, 255), -1)
        cv2.putText(frame, f"RECORDING... ({current_frames} frames)", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    elif state == "SAVED":
        cv2.rectangle(frame, (15, 100), (500, 140), (0, 200, 0), -1)
        if not is_last:
            cv2.putText(frame, "SAVED! Release Spacebar.", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        else:
            cv2.putText(frame, "DONE! Press 'n' for next digit.", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, f"Path: {save_path}", (15, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
    elif state == "DONE":
        cv2.rectangle(frame, (15, 100), (500, 140), (0, 255, 0), -1)
        if gesture_name == "9":
            cv2.putText(frame, "ALL DIGITS COMPLETE! PRESS 'q'", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2, cv2.LINE_AA)
        else:
            cv2.putText(frame, f"DIGIT {gesture_name} COMPLETE! PRESS 'n' FOR NEXT", (25, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2, cv2.LINE_AA)


def main():
    os.makedirs(TEMPLATES_DIR, exist_ok=True)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        sys.exit(1)

    holistic = init_holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    digit_idx = 0
    gesture_name = DIGITS[digit_idx]
    
    recorded_count = 0
    state = "IDLE"  # IDLE, RECORDING, SAVED, DONE
    feature_sequence = []
    save_path = ""
    last_saved_time = 0

    print("\n" + "="*50)
    print(" 🔢 Batch Recording for Digits 0-9")
    print(f" -> Current Digit: '{gesture_name}'")
    print(f" -> Hold SPACEBAR to record variation.")
    print(f" -> Press 'n' to advance to the next digit early.")
    print(" -> Press 'q' to quit.")
    print("="*50 + "\n")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame from camera.")
                break

            # Mirror the frame
            frame = cv2.flip(frame, 1)

            feature_vec, results = extract_holistic_features(frame, holistic)
            draw_holistic_landmarks(frame, results)

            key = cv2.waitKey(1) & 0xFF

            if recorded_count >= TEMPLATES_PER_CLASS:
                state = "DONE"
                
            if key == ord(' '):
                # Spacebar is held down
                if state == "IDLE" or state == "SAVED":
                    state = "RECORDING"
                    feature_sequence = []
                
                if state == "RECORDING":
                    feature_sequence.append(feature_vec)
                    
            elif key == ord('n') and state in ["IDLE", "SAVED", "DONE"]:
                digit_idx += 1
                if digit_idx >= len(DIGITS):
                    print("🎉 All digits 0-9 have been recorded! Exiting.")
                    break
                
                gesture_name = DIGITS[digit_idx]
                recorded_count = 0
                state = "IDLE"
                feature_sequence = []
                save_path = ""
                
                print("\n" + "="*50)
                print(f" 🔢 Current Digit: '{gesture_name}'")
                print("="*50 + "\n")
                
            else:
                # Spacebar is released
                if state == "RECORDING":
                    if len(feature_sequence) > 10:
                        # Save the sequence
                        recorded_count += 1
                        padded_count = str(recorded_count).zfill(2)
                        filename = f"reference_{gesture_name}_{padded_count}.npy"
                        save_path = os.path.join(TEMPLATES_DIR, filename)
                        
                        np.save(save_path, np.array(feature_sequence, dtype=np.float32))
                        print(f"[{recorded_count}/{TEMPLATES_PER_CLASS}] Saved digit {gesture_name}: {filename} ({len(feature_sequence)} frames)")
                        
                        state = "SAVED"
                        last_saved_time = time.time()
                    else:
                        print("Recording too short (<10 frames). Discarded.")
                        state = "IDLE"
                elif state == "SAVED":
                    if recorded_count >= TEMPLATES_PER_CLASS:
                        state = "DONE"
                    elif time.time() - last_saved_time > 1.0:
                        state = "IDLE"

            # Draw overlay
            draw_overlay(
                frame, 
                gesture_name, 
                state, 
                recorded_count, 
                len(feature_sequence) if state == "RECORDING" else 0,
                save_path,
                is_last=(recorded_count >= TEMPLATES_PER_CLASS)
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
