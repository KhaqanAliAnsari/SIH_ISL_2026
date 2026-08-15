import os
import urllib.request
import cv2
import numpy as np
import mediapipe as mp

# Hand landmark skeletal connections (21 landmarks)
HAND_CONNECTIONS = [
    # Thumb
    (0, 1), (1, 2), (2, 3), (3, 4),
    # Index finger
    (0, 5), (5, 6), (6, 7), (7, 8),
    # Middle finger
    (9, 10), (10, 11), (11, 12),
    # Ring finger
    (13, 14), (14, 15), (15, 16),
    # Pinky
    (0, 17), (17, 18), (18, 19), (19, 20),
    # Palm knuckles
    (5, 9), (9, 13), (13, 17),
]

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"


def ensure_model_file():
    """
    Ensures that the MediaPipe Tasks hand_landmarker.task model is available locally.
    Downloads it automatically if missing.
    """
    if not os.path.exists(MODEL_PATH):
        print(f"[INFO] Downloading MediaPipe HandLandmarker model to '{MODEL_PATH}'...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("[INFO] Model downloaded successfully.")
    return MODEL_PATH


class HandDetector:
    """
    Universal MediaPipe Hand detector supporting both MediaPipe Tasks API (v0.10.x+)
    and legacy Solutions API (v0.9.x and earlier).
    """

    def __init__(self, max_num_hands: int = 1, min_detection_confidence: float = 0.7):
        self.max_num_hands = max_num_hands
        self.min_detection_confidence = min_detection_confidence
        self.use_tasks_api = False
        self.detector = None

        if hasattr(mp, "solutions") and hasattr(mp.solutions, "hands"):
            # Legacy Solutions API
            self.detector = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=max_num_hands,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=0.5,
            )
            self.use_tasks_api = False
        else:
            # Modern MediaPipe Tasks API (0.10.x / 1.0.x+)
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            model_file = ensure_model_file()
            base_options = python.BaseOptions(model_asset_path=model_file)
            options = vision.HandLandmarkerOptions(
                base_options=base_options,
                num_hands=max_num_hands,
                min_hand_detection_confidence=min_detection_confidence,
            )
            self.detector = vision.HandLandmarker.create_from_options(options)
            self.use_tasks_api = True

    def process(self, frame_bgr: np.ndarray):
        """
        Processes a BGR image frame and extracts hand landmarks.
        Returns:
            landmarks_list: List of list of landmarks [ [lm0, lm1, ..., lm20], ... ]
        """
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        if self.use_tasks_api:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            result = self.detector.detect(mp_image)
            return result.hand_landmarks  # List of lists of NormalizedLandmark
        else:
            result = self.detector.process(rgb_frame)
            return result.multi_hand_landmarks if result.multi_hand_landmarks else []

    def close(self):
        if self.detector:
            self.detector.close()


def get_hand_detector(max_num_hands: int = 1, min_detection_confidence: float = 0.7):
    """
    Factory function returning an initialized HandDetector.
    """
    return HandDetector(max_num_hands=max_num_hands, min_detection_confidence=min_detection_confidence)


def extract_landmarks(frame: np.ndarray, detector: HandDetector):
    """
    Extracts 21 hand landmarks from an OpenCV frame.
    
    Applies translation invariance:
      - Subtracts wrist coordinates (landmark 0: x0, y0) from all 21 (x, y) coordinates.
      - Yields a 42-dimensional vector per frame.
      - Returns zero-padded vector np.zeros(42) if no hand is detected.

    Args:
        frame: BGR image from OpenCV.
        detector: Initialized HandDetector instance.

    Returns:
        feature_vector: np.ndarray of shape (42,), dtype=np.float32.
        raw_landmarks: Raw landmarks list for drawing utilities.
    """
    hand_landmarks_list = detector.process(frame)

    if hand_landmarks_list and len(hand_landmarks_list) > 0:
        # Take the primary hand detected (first hand)
        primary_hand = hand_landmarks_list[0]
        
        # Landmark 0 is the wrist reference point
        wrist = primary_hand[0]
        wrist_x = wrist.x
        wrist_y = wrist.y

        features = []
        for lm in primary_hand:
            # Translation invariant coordinates relative to wrist
            features.append(lm.x - wrist_x)
            features.append(lm.y - wrist_y)

        return np.array(features, dtype=np.float32), hand_landmarks_list
    else:
        # Zero-pad when no hand is detected
        return np.zeros(42, dtype=np.float32), []


def draw_landmarks_on_frame(frame: np.ndarray, hand_landmarks_list) -> np.ndarray:
    """
    Draws custom high-visibility hand skeleton and joints onto the frame.
    """
    if not hand_landmarks_list:
        return frame

    h, w, _ = frame.shape

    for landmarks in hand_landmarks_list:
        # Convert normalized coordinates to pixel coordinates
        pts = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]

        # Draw skeletal connections
        for start_idx, end_idx in HAND_CONNECTIONS:
            if start_idx < len(pts) and end_idx < len(pts):
                cv2.line(frame, pts[start_idx], pts[end_idx], (0, 255, 180), 2, cv2.LINE_AA)

        # Draw joint nodes
        for i, (px, py) in enumerate(pts):
            # Highlight wrist (0) and fingertips (4, 8, 12, 16, 20) with distinct color
            if i in [0, 4, 8, 12, 16, 20]:
                cv2.circle(frame, (px, py), 6, (0, 140, 255), -1, cv2.LINE_AA)
                cv2.circle(frame, (px, py), 7, (255, 255, 255), 1, cv2.LINE_AA)
            else:
                cv2.circle(frame, (px, py), 4, (0, 220, 255), -1, cv2.LINE_AA)

    return frame
