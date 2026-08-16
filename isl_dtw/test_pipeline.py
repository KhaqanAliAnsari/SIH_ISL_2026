import os
import sys
import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import utils
import main


def run_tests():
    print("=" * 60)
    print("Running ISL DTW Pipeline Verification Tests (Holistic)")
    print(f"Expected feature dimension: {utils.FEATURE_DIM}")
    print("=" * 60)

    # 1. Test Holistic initialization & empty frame extraction
    print("[1/5] Testing Holistic initialization and feature extraction...")
    holistic = utils.init_holistic()
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    feature_vec, results = utils.extract_holistic_features(dummy_frame, holistic)

    assert feature_vec.shape == (utils.FEATURE_DIM,), (
        f"Expected shape ({utils.FEATURE_DIM},), got {feature_vec.shape}"
    )
    assert np.all(feature_vec == 0), "Feature vector should be zero-padded when no body is present"
    print(f"  -> PASSED: Feature vector has shape ({utils.FEATURE_DIM},) and is zero-padded properly.")

    # 2. Test holistic drawing
    print("[2/5] Testing holistic landmark drawing...")
    drawn_frame = utils.draw_holistic_landmarks(dummy_frame, results)
    assert drawn_frame.shape == (480, 640, 3)
    print("  -> PASSED: Frame drawing executed cleanly.")

    # 3. Test template generation and loading
    print("[3/5] Testing template save and load logic...")
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
    os.makedirs(templates_dir, exist_ok=True)
    
    test_template_path = os.path.join(templates_dir, "reference_test_gesture.npy")
    dummy_sequence = np.random.randn(30, utils.FEATURE_DIM).astype(np.float32)
    np.save(test_template_path, dummy_sequence)

    templates = main.load_templates(templates_dir)
    assert "test_gesture" in templates, "Template name parsing failed"
    assert templates["test_gesture"].shape == (30, utils.FEATURE_DIM), (
        f"Template shape mismatch: {templates['test_gesture'].shape}"
    )
    print(f"  -> PASSED: Successfully loaded '{list(templates.keys())}' with shape (30, {utils.FEATURE_DIM}).")

    # 4. Test FastDTW calculation with euclidean metric
    print("[4/5] Testing FastDTW distance calculation...")
    # Distance between identical sequences should be 0.0
    dist_same, _ = fastdtw(dummy_sequence, templates["test_gesture"], dist=euclidean)
    assert np.isclose(dist_same, 0.0), f"Expected 0.0 distance for identical sequence, got {dist_same}"

    # Distance between different sequences should be > 0.0
    diff_sequence = np.random.randn(30, utils.FEATURE_DIM).astype(np.float32)
    dist_diff, _ = fastdtw(diff_sequence, templates["test_gesture"], dist=euclidean)
    assert dist_diff > 0.0, f"Expected non-zero distance, got {dist_diff}"
    print(f"  -> PASSED: FastDTW identical dist={dist_same:.2f}, different dist={dist_diff:.2f}")

    # 5. Clean up temporary test template
    print("[5/5] Cleaning up test template...")
    if os.path.exists(test_template_path):
        os.remove(test_template_path)
    holistic.close()
    print("  -> PASSED: Cleanup finished.")

    print("\n" + "=" * 60)
    print("ALL PIPELINE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
