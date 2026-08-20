import os
import sys
import glob
import time
import argparse
from collections import deque
import cv2
import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

from utils import init_holistic, extract_holistic_features, draw_holistic_landmarks, FEATURE_DIM

BUFFER_SIZE = 30
DEFAULT_THRESHOLD = 30.0
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
WINDOW_NAME = "SignKYC - Real-time ISL Gesture Recognition (Holistic DTW)"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition using MediaPipe Holistic."
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=DEFAULT_THRESHOLD,
        help=f"DTW distance recognition threshold (default: {DEFAULT_THRESHOLD}). Lower = stricter match.",
    )
    parser.add_argument(
        "--camera",
        type=int,
        default=0,
        help="Webcam camera device index (default: 0).",
    )
    parser.add_argument(
        "--templates_dir",
        type=str,
        default=TEMPLATES_DIR,
        help=f"Directory containing reference template .npy files (default: '{TEMPLATES_DIR}').",
    )
    return parser.parse_args()


def load_templates(templates_dir: str):
    """
    Loads all .npy reference gesture templates from the specified directory.
    Only loads templates whose second dimension matches FEATURE_DIM.

    Returns:
        dict: { "gesture_name": np.ndarray of shape (N, FEATURE_DIM) }
    """
    templates = {}
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir, exist_ok=True)
        return templates

    npy_files = glob.glob(os.path.join(templates_dir, "*.npy"))
    for file_path in npy_files:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        # Remove 'reference_' prefix if present
        gesture_name = base_name.replace("reference_", "")
        try:
            data = np.load(file_path)
            if data.ndim == 2 and data.shape[1] == FEATURE_DIM:
                templates[gesture_name] = data
                print(f"[LOADED] Template '{gesture_name}' from {os.path.basename(file_path)} (Shape: {data.shape})")
            else:
                print(
                    f"[WARNING] Skipping '{os.path.basename(file_path)}' — "
                    f"shape {data.shape} does not match expected (N, {FEATURE_DIM}). "
                    f"Re-record with the holistic pipeline."
                )
        except Exception as e:
            print(f"[ERROR] Failed to load template '{file_path}': {e}")

    return templates


def draw_hud(
    frame: np.ndarray,
    templates_count: int,
    buffer_len: int,
    max_buffer: int,
    recognized_gesture: str,
    recognized_dist: float,
    threshold: float,
    scores_dict: dict,
    fps: float,
):
    """
    Renders an informative real-time HUD with recognition status, buffer meter, and scores.
    """
    h, w, _ = frame.shape

    # Top banner background
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 75), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Title & FPS
    cv2.putText(
        frame,
        "SignKYC - Real-time ISL Holistic DTW Recognizer",
        (15, 26),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 220, 255),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        frame,
        f"Templates: {templates_count} | Threshold: {threshold:.1f} | FPS: {fps:.1f}",
        (15, 55),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (200, 200, 200),
        1,
        cv2.LINE_AA,
    )

    # Buffer Gauge (Top Right)
    buf_text = f"Buffer: {buffer_len}/{max_buffer}"
    cv2.putText(
        frame,
        buf_text,
        (w - 180, 26),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0) if buffer_len == max_buffer else (0, 165, 255),
        1,
        cv2.LINE_AA,
    )

    # Real-time scores panel (Right side)
    if scores_dict:
        panel_y = 95
        cv2.putText(
            frame,
            "DTW Distances:",
            (w - 210, panel_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )
        panel_y += 20
        # Sort by lowest distance
        sorted_scores = sorted(scores_dict.items(), key=lambda x: x[1])[:4]
        for name, dist in sorted_scores:
            is_match = dist < threshold
            color = (0, 255, 0) if is_match else (180, 180, 180)
            cv2.putText(
                frame,
                f"{name[:12]}: {dist:.2f}",
                (w - 210, panel_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1,
                cv2.LINE_AA,
            )
            panel_y += 18

    # Recognized Gesture Alert Card (Bottom Center)
    if recognized_gesture:
        card_w, card_h = 420, 80
        card_x = (w - card_w) // 2
        card_y = h - card_h - 20

        # Emerald green card
        card_overlay = frame.copy()
        cv2.rectangle(
            card_overlay,
            (card_x, card_y),
            (card_x + card_w, card_y + card_h),
            (20, 100, 20),
            -1,
        )
        cv2.addWeighted(card_overlay, 0.85, frame, 0.15, 0, frame)
        cv2.rectangle(
            frame,
            (card_x, card_y),
            (card_x + card_w, card_y + card_h),
            (0, 255, 100),
            2,
        )

        # Text
        cv2.putText(
            frame,
            f"GESTURE: {recognized_gesture.upper()}",
            (card_x + 18, card_y + 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.85,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
        cv2.putText(
            frame,
            f"DTW Distance: {recognized_dist:.2f} (Threshold < {threshold:.1f})",
            (card_x + 18, card_y + 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (200, 255, 200),
            1,
            cv2.LINE_AA,
        )


def main():
    args = parse_args()
    threshold = args.threshold
    templates = load_templates(args.templates_dir)

    if not templates:
        print("=" * 70)
        print(f"[!] No compatible reference templates found in '{args.templates_dir}'.")
        print(f"    Expected template shape: (N, {FEATURE_DIM}).")
        print("Please record at least one reference template first by running:")
        print("    python record_template.py --name <gesture_name>")
        print("=" * 70)

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}.")
        sys.exit(1)

    holistic = init_holistic()
    landmark_buffer = deque(maxlen=BUFFER_SIZE)

    # Recognition persistence state for UI display
    last_recognized_gesture = ""
    last_recognized_dist = 0.0
    recognized_display_until = 0.0
    last_scores = {}

    prev_time = time.time()
    fps = 0.0

    print("=" * 70)
    print("SignKYC Real-Time ISL Gesture Recognition (Holistic DTW)")
    print(f"Feature dimension: {FEATURE_DIM} (upper body + head + both hands)")
    print(f"Loaded {len(templates)} templates: {list(templates.keys())}")
    print(f"Rolling Buffer: {BUFFER_SIZE} frames | Distance Threshold: {threshold}")
    print("Press 'Q' or ESC to exit.")
    print("=" * 70)

    # Create named window upfront so it registers for keyboard focus
    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_AUTOSIZE)

    try:
        while True:
            # Detect if user closed window via the X button
            try:
                if cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE) < 1:
                    break
            except cv2.error:
                break

            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame from webcam.")
                break

            # Calculate FPS
            curr_time = time.time()
            fps = 1.0 / (curr_time - prev_time + 1e-6)
            prev_time = curr_time

            # Flip frame horizontally for intuitive mirror view
            frame = cv2.flip(frame, 1)

            # Extract normalized holistic features (106-dim)
            feature_vector, results = extract_holistic_features(frame, holistic)

            # Draw MediaPipe holistic skeleton overlay (pose + both hands)
            frame = draw_holistic_landmarks(frame, results)

            # Push vector into rolling buffer
            landmark_buffer.append(feature_vector)

            # When the buffer is full (30 frames), perform DTW against templates
            if len(landmark_buffer) == BUFFER_SIZE and len(templates) > 0:
                current_sequence = np.array(landmark_buffer, dtype=np.float32)  # Shape: (30, FEATURE_DIM)

                best_gesture = None
                min_distance = float("inf")
                current_scores = {}

                # Predefine fast distance function for fastdtw
                def fast_euclidean(u, v):
                    return np.linalg.norm(u - v)

                for gesture_name, template_sequence in templates.items():
                    # Calculate FastDTW using optimized Euclidean distance
                    dist, _ = fastdtw(current_sequence, template_sequence, dist=fast_euclidean)
                    current_scores[gesture_name] = dist

                    if dist < min_distance:
                        min_distance = dist
                        best_gesture = gesture_name

                last_scores = current_scores

                # Trigger recognition if distance is below threshold
                if best_gesture is not None and min_distance < threshold:
                    print(f"\n[RECOGNIZED] Gesture: '{best_gesture.upper()}' | DTW Distance: {min_distance:.2f} (Threshold: {threshold})")
                    last_recognized_gesture = best_gesture
                    last_recognized_dist = min_distance
                    recognized_display_until = time.time() + 2.0  # Display banner for 2 seconds

                    # Clear rolling buffer to prevent duplicate immediate triggers
                    landmark_buffer.clear()

            # Clear UI recognition banner if expired
            active_gesture = last_recognized_gesture if time.time() < recognized_display_until else ""

            # Render HUD
            draw_hud(
                frame=frame,
                templates_count=len(templates),
                buffer_len=len(landmark_buffer),
                max_buffer=BUFFER_SIZE,
                recognized_gesture=active_gesture,
                recognized_dist=last_recognized_dist,
                threshold=threshold,
                scores_dict=last_scores,
                fps=fps,
            )

            cv2.imshow(WINDOW_NAME, frame)

            key = cv2.waitKey(1) & 0xFF
            if key in [ord("q"), ord("Q"), 27]:  # 27 = ESC
                break

    finally:
        holistic.close()
        cap.release()
        cv2.destroyAllWindows()
        # Pump event loop so Windows actually tears down the window
        for _ in range(5):
            cv2.waitKey(1)


if __name__ == "__main__":
    main()
