import os
import sys
import time
import argparse
import glob
import re
from collections import deque

import cv2
import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

from utils import init_holistic, extract_holistic_features, draw_holistic_landmarks, FEATURE_DIM

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
WINDOW_NAME = "SignKYC - Dynamic ISL DTW Recognition"

BUFFER_SIZE = 90  # 3 seconds at 30 fps
DTW_EVAL_RATE = 3 # Evaluate DTW every N frames
DTW_THRESHOLD = 30.0

def load_templates():
    """
    Load all .npy files in TEMPLATES_DIR.
    Groups them into a dictionary by gesture class name.
    Expects files like `reference_namaste_01.npy`.
    """
    templates = {}
    if not os.path.exists(TEMPLATES_DIR):
        print(f"Warning: templates directory not found at {TEMPLATES_DIR}")
        return templates

    for file in glob.glob(os.path.join(TEMPLATES_DIR, "*.npy")):
        base = os.path.basename(file)
        # e.g., reference_namaste_01.npy -> namaste
        match = re.search(r'reference_(.+?)_\d+\.npy', base)
        if match:
            gesture_name = match.group(1)
        else:
            gesture_name = base.replace("reference_", "").replace(".npy", "")
        
        sequence = np.load(file)
        
        if gesture_name not in templates:
            templates[gesture_name] = []
        templates[gesture_name].append((base, sequence))

    total_variations = sum(len(v) for v in templates.values())
    print(f"Loaded {total_variations} template variations across {len(templates)} gesture classes.")
    return templates


def compute_dtw_distance(seq1: np.ndarray, seq2: np.ndarray) -> float:
    """
    Compute DTW distance between two feature sequences.
    """
    distance, _ = fastdtw(seq1, seq2, radius=5, dist=euclidean)
    return distance


def run_pipeline(camera_index: int = 0):
    templates = load_templates()
    if not templates:
        print("No templates found. Please run record_template.py first.")
        return

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"Error: Could not open camera {camera_index}")
        return

    # Use deque for fast sliding window
    frame_buffer = deque(maxlen=BUFFER_SIZE)
    holistic = init_holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    print("\n" + "="*50)
    print("SignKYC Dynamic DTW Recognition Started")
    print("Press 'q' to quit.")
    print("="*50 + "\n")

    frame_count = 0
    last_match = None
    last_confidence = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            frame = cv2.flip(frame, 1)

            t0 = time.time()
            
            # Extract features
            feature_vec, results = extract_holistic_features(frame, holistic)
            
            # Draw landmarks
            draw_holistic_landmarks(frame, results)

            # Check if person is in frame
            body_detected = np.any(feature_vec[:12] != 0.0)

            if body_detected:
                frame_buffer.append(feature_vec)

                # Only evaluate DTW every N frames to save CPU
                if len(frame_buffer) > 15 and frame_count % DTW_EVAL_RATE == 0:
                    buffer_arr = np.array(frame_buffer)
                    
                    best_gesture = None
                    best_distance = float('inf')

                    for gesture_name, variations in templates.items():
                        for (fname, temp_seq) in variations:
                            temp_len = len(temp_seq)
                            
                            # If our buffer is shorter than the template, we can't match it yet
                            if len(buffer_arr) < temp_len:
                                continue
                                
                            # Extract the exact length slice from the end of the buffer
                            slice_to_compare = buffer_arr[-temp_len:]
                            
                            distance = compute_dtw_distance(slice_to_compare, temp_seq)
                            
                            # Normalize distance by template length so it's comparable across different lengths
                            norm_distance = (distance / temp_len) * 30.0
                            
                            if norm_distance < best_distance:
                                best_distance = norm_distance
                                best_gesture = gesture_name
                    
                    if best_distance < DTW_THRESHOLD:
                        last_match = best_gesture
                        last_confidence = max(0, 100 - (best_distance / DTW_THRESHOLD * 50))
                    else:
                        last_match = None
                        last_confidence = 0.0
            else:
                # If no body detected, clear buffer to avoid ghost gestures
                frame_buffer.clear()
                last_match = None
                last_confidence = 0.0

            t1 = time.time()
            fps = 1.0 / (t1 - t0 + 1e-6)

            # Draw UI
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Buffer: {len(frame_buffer)}/{BUFFER_SIZE}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            if last_match:
                cv2.putText(frame, f"Match: {last_match.upper()} ({last_confidence:.1f}%)", (10, 90), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)

            cv2.imshow(WINDOW_NAME, frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        holistic.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run DTW Gesture Recognition Pipeline.")
    parser.add_argument("--camera", type=int, default=0, help="Camera device index.")
    args = parser.parse_args()
    
    run_pipeline(args.camera)
