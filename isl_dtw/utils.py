import cv2
import numpy as np
import mediapipe as mp

# ──────────────────────────────────────────────────────────────────────
# Feature vector layout (constant across all frames)
# ──────────────────────────────────────────────────────────────────────
#   Block                   Landmarks                               Dims
#   ─────────────────────   ─────────────────────────────────────    ────
#   Upper Body / Arms       Pose 11-16 (shoulders, elbows, wrists)  12
#   Head Spatial Anchors    Pose 0, 2, 5, 9, 10                     10
#   Left Hand               21 hand landmarks (wrist-relative)       42
#   Right Hand              21 hand landmarks (wrist-relative)       42
#                                                          Total:   106
# ──────────────────────────────────────────────────────────────────────

FEATURE_DIM = 106

# Pose landmark indices for upper body and head anchors
POSE_UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16]  # shoulders, elbows, wrists
POSE_HEAD_INDICES = [0, 2, 5, 9, 10]                 # nose, left eye, right eye, mouth left, mouth right

# MediaPipe drawing utilities and specs
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


def init_holistic(
    min_detection_confidence: float = 0.5,
    min_tracking_confidence: float = 0.5,
):
    """
    Initializes and returns a MediaPipe Holistic model instance.

    Args:
        min_detection_confidence: Minimum confidence for initial detection.
        min_tracking_confidence: Minimum confidence for landmark tracking.

    Returns:
        A mediapipe.solutions.holistic.Holistic instance.
    """
    return mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=0,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence,
    )


def _extract_pose_features(pose_landmarks):
    """
    Extracts upper-body arm features (12 dims) and head anchor features (10 dims)
    from MediaPipe Pose landmarks, normalized relative to mid-shoulder.

    Returns:
        upper_body: np.ndarray of shape (12,) — 6 landmarks × 2 coords
        head_anchors: np.ndarray of shape (10,) — 5 landmarks × 2 coords
    """
    if pose_landmarks is None:
        return np.zeros(12, dtype=np.float32), np.zeros(10, dtype=np.float32)

    lm = pose_landmarks.landmark

    # Mid-shoulder reference point
    mid_shoulder_x = (lm[11].x + lm[12].x) / 2.0
    mid_shoulder_y = (lm[11].y + lm[12].y) / 2.0

    # Upper body: shoulders (11, 12), elbows (13, 14), wrists (15, 16)
    upper_body = np.zeros(12, dtype=np.float32)
    for i, idx in enumerate(POSE_UPPER_BODY_INDICES):
        upper_body[i*2] = lm[idx].x - mid_shoulder_x
        upper_body[i*2 + 1] = lm[idx].y - mid_shoulder_y

    # Head spatial anchors: nose (0), eyes (2, 5), mouth corners (9, 10)
    head_anchors = np.zeros(10, dtype=np.float32)
    for i, idx in enumerate(POSE_HEAD_INDICES):
        head_anchors[i*2] = lm[idx].x - mid_shoulder_x
        head_anchors[i*2 + 1] = lm[idx].y - mid_shoulder_y

    return upper_body, head_anchors


def _extract_hand_features(hand_landmarks):
    """
    Extracts 42-dimensional features from 21 hand landmarks,
    normalized relative to the wrist (hand landmark index 0).

    Returns zero-padded vector (42 zeros) if hand_landmarks is None.

    Returns:
        np.ndarray of shape (42,), dtype=np.float32.
    """
    if hand_landmarks is None:
        return np.zeros(42, dtype=np.float32)

    lm = hand_landmarks.landmark
    wrist_x = lm[0].x
    wrist_y = lm[0].y

    features = np.zeros(42, dtype=np.float32)
    for i, landmark in enumerate(lm):
        features[i*2] = landmark.x - wrist_x
        features[i*2 + 1] = landmark.y - wrist_y

    return features


def extract_holistic_features(frame: np.ndarray, holistic):
    """
    Extracts a 106-dimensional holistic feature vector from an OpenCV BGR frame.

    Feature layout:
        [0:12]   Upper body / arms  (pose 11-16, mid-shoulder relative)
        [12:22]  Head anchors       (pose 0,2,5,9,10, mid-shoulder relative)
        [22:64]  Left hand          (21 landmarks, wrist-relative, zero-padded if absent)
        [64:106] Right hand         (21 landmarks, wrist-relative, zero-padded if absent)

    Args:
        frame: BGR image from OpenCV.
        holistic: Initialized mp.solutions.holistic.Holistic instance.

    Returns:
        feature_vector: np.ndarray of shape (106,), dtype=np.float32.
        results: Raw MediaPipe holistic results object (for drawing).
    """
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb_frame.flags.writeable = False
    results = holistic.process(rgb_frame)
    rgb_frame.flags.writeable = True

    # Extract directly into a contiguous 106-dim vector (zero-padded by default)
    feature_vector = np.zeros(FEATURE_DIM, dtype=np.float32)

    # 1. Pose features
    if results.pose_landmarks:
        lm = results.pose_landmarks.landmark
        mid_shoulder_x = (lm[11].x + lm[12].x) / 2.0
        mid_shoulder_y = (lm[11].y + lm[12].y) / 2.0

        # Upper body (12 dims: [0:12])
        for i, idx in enumerate(POSE_UPPER_BODY_INDICES):
            feature_vector[i * 2] = lm[idx].x - mid_shoulder_x
            feature_vector[i * 2 + 1] = lm[idx].y - mid_shoulder_y

        # Head anchors (10 dims: [12:22])
        for i, idx in enumerate(POSE_HEAD_INDICES):
            feature_vector[12 + i * 2] = lm[idx].x - mid_shoulder_x
            feature_vector[12 + i * 2 + 1] = lm[idx].y - mid_shoulder_y

    # 2. Left hand (42 dims: [22:64])
    if results.left_hand_landmarks:
        lm = results.left_hand_landmarks.landmark
        wrist_x, wrist_y = lm[0].x, lm[0].y
        for i, landmark in enumerate(lm):
            feature_vector[22 + i * 2] = landmark.x - wrist_x
            feature_vector[22 + i * 2 + 1] = landmark.y - wrist_y

    # 3. Right hand (42 dims: [64:106])
    if results.right_hand_landmarks:
        lm = results.right_hand_landmarks.landmark
        wrist_x, wrist_y = lm[0].x, lm[0].y
        for i, landmark in enumerate(lm):
            feature_vector[64 + i * 2] = landmark.x - wrist_x
            feature_vector[64 + i * 2 + 1] = landmark.y - wrist_y

    return feature_vector, results


def draw_holistic_landmarks(frame: np.ndarray, results) -> np.ndarray:
    """
    Draws pose (upper body subset), left hand, and right hand landmarks
    onto the frame using MediaPipe drawing utilities with distinct colors.

    Args:
        frame: BGR image to annotate.
        results: Raw results object from holistic.process().

    Returns:
        Annotated frame (modified in-place and returned).
    """
    if results is None:
        return frame

    # Draw pose connections (full body drawn for visual context)
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            frame,
            results.pose_landmarks,
            mp_holistic.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(
                color=(80, 180, 255), thickness=2, circle_radius=2
            ),
            connection_drawing_spec=mp_drawing.DrawingSpec(
                color=(80, 110, 200), thickness=2
            ),
        )

    # Draw left hand connections (cyan / teal)
    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(
            frame,
            results.left_hand_landmarks,
            mp_holistic.HAND_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(
                color=(0, 255, 200), thickness=2, circle_radius=3
            ),
            connection_drawing_spec=mp_drawing.DrawingSpec(
                color=(0, 200, 160), thickness=2
            ),
        )

    # Draw right hand connections (orange / amber)
    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(
            frame,
            results.right_hand_landmarks,
            mp_holistic.HAND_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(
                color=(0, 140, 255), thickness=2, circle_radius=3
            ),
            connection_drawing_spec=mp_drawing.DrawingSpec(
                color=(0, 100, 200), thickness=2
            ),
        )

    return frame
