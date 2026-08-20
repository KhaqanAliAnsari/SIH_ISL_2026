"""
preprocess_static.py -- Extract 84-dim hand landmark features from static ISL images.

Single-process version (MediaPipe + TF on Windows can't safely multiprocess).
Optimized to:
  - Detect incomplete CSVs and only process missing classes
  - Append missing data instead of re-processing everything
  - Show progress per class
"""

import os

# Limit CPU threads for underlying C++ libraries to prevent freezing
os.environ['OMP_NUM_THREADS'] = '8'
os.environ['OPENBLAS_NUM_THREADS'] = '8'
os.environ['MKL_NUM_THREADS'] = '8'

import cv2
import numpy as np
import mediapipe as mp
import csv
import time

mp_hands = mp.solutions.hands


def get_existing_classes(csv_path):
    """Read existing CSV and return set of class labels already processed."""
    if not os.path.exists(csv_path):
        return set()
    try:
        # Read only the label column to save memory
        import pandas as pd
        df = pd.read_csv(csv_path, usecols=['label'], low_memory=False)
        classes = set(df['label'].astype(str).unique())
        return classes
    except Exception:
        return set()


def process_dataset(dataset_dir, output_csv, force=False):
    """Process dataset images to extract hand landmark features."""
    if not os.path.exists(dataset_dir):
        print("  [WARN] Directory %s does not exist, skipping." % dataset_dir)
        return

    # Check what classes already exist
    existing_classes = set()
    if not force and os.path.exists(output_csv):
        existing_classes = get_existing_classes(output_csv)

    # Get all class directories
    all_classes = sorted([
        cls for cls in os.listdir(dataset_dir)
        if os.path.isdir(os.path.join(dataset_dir, cls))
    ])

    # Filter to only missing classes
    missing_classes = [cls for cls in all_classes if cls not in existing_classes]

    if not missing_classes:
        print("  [OK] %s has all %d classes. Nothing to do." % (output_csv, len(all_classes)))
        return

    if existing_classes:
        print("  Found %d/%d classes. Processing %d missing: %s" % (
            len(existing_classes), len(all_classes), len(missing_classes),
            ', '.join(missing_classes)
        ))
    else:
        print("  Processing all %d classes..." % len(all_classes))

    # Initialize MediaPipe Hands (single instance, reused)
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.5
    )

    t0 = time.time()
    total_images = 0
    total_dropped = 0
    new_rows = []

    for cls_idx, cls in enumerate(missing_classes):
        cls_dir = os.path.join(dataset_dir, cls)
        images = [f for f in os.listdir(cls_dir)
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]

        cls_kept = 0
        cls_dropped = 0

        for img_name in images:
            img_path = os.path.join(cls_dir, img_name)
            image = cv2.imread(img_path)
            if image is None:
                continue

            total_images += 1
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_image)

            features = np.zeros(84, dtype=np.float32)
            left_hand_landmarks = None
            right_hand_landmarks = None

            if results.multi_hand_landmarks and results.multi_handedness:
                for idx, hand_handedness in enumerate(results.multi_handedness):
                    label = hand_handedness.classification[0].label
                    landmarks = results.multi_hand_landmarks[idx].landmark

                    if label == "Left" and left_hand_landmarks is None:
                        left_hand_landmarks = landmarks
                    elif label == "Right" and right_hand_landmarks is None:
                        right_hand_landmarks = landmarks

            if left_hand_landmarks is None and right_hand_landmarks is None:
                cls_dropped += 1
                total_dropped += 1
                continue

            # Left Hand (indices 0 to 41)
            if left_hand_landmarks:
                wrist_x = 1.0 - left_hand_landmarks[0].x
                wrist_y = left_hand_landmarks[0].y
                offset = 0
                for i in range(21):
                    pt = left_hand_landmarks[i]
                    features[offset] = (1.0 - pt.x) - wrist_x
                    offset += 1
                    features[offset] = pt.y - wrist_y
                    offset += 1

            # Right Hand (indices 42 to 83)
            if right_hand_landmarks:
                wrist_x = 1.0 - right_hand_landmarks[0].x
                wrist_y = right_hand_landmarks[0].y
                offset = 42
                for i in range(21):
                    pt = right_hand_landmarks[i]
                    features[offset] = (1.0 - pt.x) - wrist_x
                    offset += 1
                    features[offset] = pt.y - wrist_y
                    offset += 1

            new_rows.append((list(features), cls))
            cls_kept += 1

        elapsed = time.time() - t0
        print("  [%d/%d] Class '%s': %d kept, %d dropped (%.0fs elapsed)" % (
            cls_idx + 1, len(missing_classes), cls, cls_kept, cls_dropped, elapsed
        ))

    hands.close()

    # Write or append to CSV
    if existing_classes and os.path.exists(output_csv):
        # Append mode
        print("  Appending %d new rows to %s..." % (len(new_rows), output_csv))
        with open(output_csv, 'a', newline='') as f:
            writer = csv.writer(f)
            for features, label in new_rows:
                writer.writerow(features + [label])
    else:
        # Write new file
        print("  Writing %d rows to %s..." % (len(new_rows), output_csv))
        with open(output_csv, 'w', newline='') as f:
            writer = csv.writer(f)
            header = [("f_%d" % i) for i in range(84)] + ["label"]
            writer.writerow(header)
            for features, label in new_rows:
                writer.writerow(features + [label])

    elapsed = time.time() - t0
    print("  [OK] Done in %.1fs | Processed: %d | Dropped: %d | New rows: %d" % (
        elapsed, total_images, total_dropped, len(new_rows)
    ))
    print()


if __name__ == "__main__":
    base_dir = r"c:\Users\11111\Downloads\SIH_ISL_2026\isl_dataset"
    output_dir = r"c:\Users\11111\Downloads\SIH_ISL_2026\isl_dtw"

    print("=== Static Feature Extraction (single-process, incremental) ===")
    print()

    # Train set (will detect missing V-Z and only process those)
    print("[1/3] Train set:")
    process_dataset(
        os.path.join(base_dir, "Train"),
        os.path.join(output_dir, "static_features_train.csv"),
    )

    # Validation set
    print("[2/3] Validation set:")
    process_dataset(
        os.path.join(base_dir, "Validation"),
        os.path.join(output_dir, "static_features_val.csv"),
    )

    # Test set
    print("[3/3] Test set:")
    process_dataset(
        os.path.join(base_dir, "Test"),
        os.path.join(output_dir, "static_features_test.csv"),
    )

    print("=== All preprocessing complete. ===")
