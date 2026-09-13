#!/usr/bin/env python3
"""
Diagnostic script to verify template data characteristics.
Checks: shape, value ranges, zero-padding ratios, and cross-class separability.
"""
import os
import sys
import numpy as np
import glob
import re

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
PUBLIC_TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "templates")
FEATURE_DIM = 106

def load_all_templates(templates_dir):
    templates = {}
    for file in sorted(glob.glob(os.path.join(templates_dir, "*.npy"))):
        base = os.path.basename(file)
        match = re.search(r'reference_(.+?)_\d+\.npy', base)
        if match:
            gesture_name = match.group(1)
        else:
            gesture_name = base.replace("reference_", "").replace(".npy", "")
        
        seq = np.load(file)
        if gesture_name not in templates:
            templates[gesture_name] = []
        templates[gesture_name].append((base, seq))
    return templates

def analyze_templates(templates):
    print("=" * 70)
    print("TEMPLATE DIAGNOSTIC REPORT")
    print("=" * 70)
    
    for gesture_name, variations in sorted(templates.items()):
        print(f"\n--- Gesture: '{gesture_name}' ({len(variations)} variations) ---")
        
        for fname, seq in variations[:2]:  # Show first 2 of each class
            print(f"  File: {fname}")
            print(f"    Shape: {seq.shape} (expected: (40, 106))")
            print(f"    Dtype: {seq.dtype}")
            
            # Check value ranges per block
            upper_body = seq[:, 0:12]
            head = seq[:, 12:22]
            left_hand = seq[:, 22:64]
            right_hand = seq[:, 64:106]
            
            ub_nonzero = np.count_nonzero(upper_body) / upper_body.size * 100
            hd_nonzero = np.count_nonzero(head) / head.size * 100
            lh_nonzero = np.count_nonzero(left_hand) / left_hand.size * 100
            rh_nonzero = np.count_nonzero(right_hand) / right_hand.size * 100
            
            print(f"    Upper Body [0:12]:  range=[{upper_body.min():.4f}, {upper_body.max():.4f}] nonzero={ub_nonzero:.0f}%")
            print(f"    Head [12:22]:       range=[{head.min():.4f}, {head.max():.4f}] nonzero={hd_nonzero:.0f}%")
            print(f"    Left Hand [22:64]:  range=[{left_hand.min():.4f}, {left_hand.max():.4f}] nonzero={lh_nonzero:.0f}%")
            print(f"    Right Hand [64:106]:range=[{right_hand.min():.4f}, {right_hand.max():.4f}] nonzero={rh_nonzero:.0f}%")
            
            # Sample frame 0 and frame 20 from first variation
            if fname == variations[0][0]:
                print(f"    Frame 0, first 10 values:  {seq[0, :10]}")
                mid = min(20, len(seq) - 1)
                print(f"    Frame {mid}, first 10 values: {seq[mid, :10]}")
    
    # Cross-class DTW distance analysis using simple Euclidean
    print("\n" + "=" * 70)
    print("CROSS-CLASS SEPARABILITY (frame-averaged Euclidean distance)")
    print("=" * 70)
    
    class_means = {}
    for gesture_name, variations in sorted(templates.items()):
        # Average across all variations and frames
        all_frames = np.concatenate([seq for _, seq in variations], axis=0)
        class_means[gesture_name] = all_frames.mean(axis=0)
    
    names = sorted(class_means.keys())
    print(f"\n{'':>12s}", end="")
    for n in names:
        print(f" {n:>8s}", end="")
    print()
    
    for n1 in names:
        print(f"{n1:>12s}", end="")
        for n2 in names:
            dist = np.sqrt(np.sum((class_means[n1] - class_means[n2]) ** 2))
            print(f" {dist:8.3f}", end="")
        print()
    
    # Check for the X-flip issue
    print("\n" + "=" * 70)
    print("X-COORDINATE SIGN ANALYSIS (template was recorded with cv2.flip(frame,1))")
    print("=" * 70)
    print("Python utils.py stores raw MediaPipe .x coords (no 1.0-x transform)")
    print("JS holisticLandmarker.ts applies (1.0 - x) to mirror for selfie camera")
    print()
    
    # Check if pose upper-body x-coords are predominantly positive or negative
    for gesture_name, variations in sorted(templates.items()):
        seq = variations[0][1]  # First variation
        # Pose upper body x-coords are at even indices 0,2,4,6,8,10
        pose_x = seq[:, [0, 2, 4, 6, 8, 10]]
        mean_x = pose_x.mean()
        print(f"  '{gesture_name}' mean pose X (mid-shoulder relative): {mean_x:+.4f}")
    
    print()
    print("If all mean pose X values are close to 0.0, templates are well-centered.")
    print("The JS (1.0-x) transform should produce equivalent relative coords ONLY IF")
    print("the webcam input is a standard (unflipped) selfie feed.")
    print()
    print("CRITICAL: Python records with cv2.flip(frame, 1) BEFORE MediaPipe processing.")
    print("This means MediaPipe sees a MIRRORED image. The landmarks .x are in mirrored space.")
    print("On mobile, the front camera feed is NOT pre-flipped by the app before MediaPipe.")
    print("Instead, JS applies (1.0 - x) AFTER MediaPipe processing.")
    print("These two approaches are NOT mathematically equivalent when mid-shoulder")
    print("normalization is applied!")

if __name__ == "__main__":
    # Try both paths
    for d in [TEMPLATES_DIR, PUBLIC_TEMPLATES_DIR]:
        if os.path.exists(d) and glob.glob(os.path.join(d, "*.npy")):
            print(f"Using templates from: {d}\n")
            templates = load_all_templates(d)
            analyze_templates(templates)
            break
    else:
        print("No templates found!")
        sys.exit(1)
