import os
import sys
import time
import argparse
import cv2
import numpy as np

from utils import get_hand_detector, extract_landmarks, draw_landmarks_on_frame

RECORD_FRAMES = 30
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Record a 30-frame ISL gesture reference template using MediaPipe Hands."
    )
    parser.add_argument(
        "--name",
        type=str,
        default=None,
        help="Name of the gesture (e.g., 'hello', 'namaste', 'thank_you').",
    )
    parser.add_argument(
        "--camera",
        type=int,
        default=0,
        help="Webcam camera device index (default: 0).",
    )
    return parser.parse_args()


def draw_overlay(
    frame: np.ndarray,
    gesture_name: str,
    state: str,
    recorded_count: int,
    total_frames: int,
    save_path: str = "",
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
        "SignKYC ISL Template Recorder",
        (15, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        (0, 220, 255),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        frame,
        f"Target Gesture: {gesture_name.upper()}",
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
            "READY - Press 'S' to Start Recording (30 Frames)",
            (15, h - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 255),
            2,
            cv2.LINE_AA,
        )
    elif state == "COUNTDOWN":
        cv2.putText(
            frame,
            "Get Ready... Starting in 1 second",
            (15, h - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (0, 165, 255),
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

        # Progress bar
        bar_x1, bar_y1 = 20, h - 50
        bar_w = w - 40
        bar_h = 24
        cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x1 + bar_w, bar_y1 + bar_h), (50, 50, 50), -1)
        
        progress = recorded_count / total_frames
        filled_w = int(bar_w * progress)
        cv2.rectangle(
            frame,
            (bar_x1, bar_y1),
            (bar_x1 + filled_w, bar_y1 + bar_h),
            (0, 215, 255),
            -1,
        )
        cv2.rectangle(
            frame,
            (bar_x1, bar_y1),
            (bar_x1 + bar_w, bar_y1 + bar_h),
            (255, 255, 255),
            1,
        )

        progress_text = f"Recording: {recorded_count}/{total_frames} Frames ({int(progress * 100)}%)"
        cv2.putText(
            frame,
            progress_text,
            (bar_x1 + 10, bar_y1 + 17),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 0, 0),
            2,
            cv2.LINE_AA,
        )
    elif state == "SAVED":
        cv2.putText(
            frame,
            f"SAVED: {os.path.basename(save_path)} | 'S': Re-record | 'Q': Quit",
            (15, h - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )


def main():
    args = parse_args()
    gesture_name = args.name

    if not gesture_name:
        gesture_name = input("Enter the gesture name to record (e.g. namaste, hello, thank_you): ").strip()
        if not gesture_name:
            print("Error: Gesture name cannot be empty.")
            sys.exit(1)

    # Sanitize gesture name for filename
    gesture_name = gesture_name.lower().replace(" ", "_")
    os.makedirs(TEMPLATES_DIR, exist_ok=True)
    output_filename = f"reference_{gesture_name}.npy"
    save_path = os.path.join(TEMPLATES_DIR, output_filename)

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}.")
        sys.exit(1)

    detector = get_hand_detector()

    state = "IDLE"  # IDLE, RECORDING, SAVED
    recorded_frames = []
    
    print("=" * 60)
    print(f"SignKYC ISL Template Recorder - Gesture: [{gesture_name}]")
    print(f"Destination: {save_path}")
    print("Instructions:")
    print("  - Press 'S' to begin recording 30 dynamic hand frames.")
    print("  - Press 'Q' or ESC to quit.")
    print("=" * 60)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame from camera.")
                break

            # Flip frame horizontally for natural selfie view
            frame = cv2.flip(frame, 1)

            # Extract hand landmarks
            feature_vector, results = extract_landmarks(frame, detector)

            # Draw MediaPipe hand skeleton overlay
            frame = draw_landmarks_on_frame(frame, results)

            # Handle state logic
            if state == "RECORDING":
                recorded_frames.append(feature_vector)
                if len(recorded_frames) >= RECORD_FRAMES:
                    # Save exactly 30 frames to .npy file
                    template_array = np.array(recorded_frames, dtype=np.float32)  # Shape: (30, 42)
                    np.save(save_path, template_array)
                    print(f"\n[SUCCESS] Saved {RECORD_FRAMES} frames of shape {template_array.shape} to '{save_path}'")
                    state = "SAVED"

            # Render HUD overlay
            draw_overlay(
                frame=frame,
                gesture_name=gesture_name,
                state=state,
                recorded_count=len(recorded_frames),
                total_frames=RECORD_FRAMES,
                save_path=save_path,
            )

            cv2.imshow("SignKYC - Record ISL Template", frame)

            key = cv2.waitKey(1) & 0xFF
            if key in [ord("q"), ord("Q"), 27]:  # 27 = ESC
                break
            elif key in [ord("s"), ord("S")]:
                print(f"[INFO] Starting 30-frame recording for '{gesture_name}'...")
                recorded_frames = []
                state = "RECORDING"

    finally:
        detector.close()
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
