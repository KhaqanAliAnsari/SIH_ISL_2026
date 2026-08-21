# Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)

Dynamic Indian Sign Language (ISL) gesture recognition pipeline using **MediaPipe Holistic** (full upper body + both hands + head anchors) and **Dynamic Time Warping (FastDTW)**.

---

## 📁 Project Structure

```text
isl_dtw/
├── templates/               # Stores recorded reference templates (.npy)
├── utils.py                 # MediaPipe Holistic extraction & normalization (106-dim vector)
├── record_template.py       # Records multiple dynamic variations to reference_<name>_XX.npy
├── record_template_0-9.py   # Sequentially records 10 variations for digits 0-9
├── main.py                  # Real-time FastDTW recognizer with dynamic sliding window and evaluation skipping
├── test_pipeline.py         # Automated pipeline verification tests
├── requirements.txt         # Dependencies
└── README.md
```

---

## 🧬 Feature Vector Layout (106 dimensions per frame)

| Block | Pose Indices | Reference Point | Dimensions |
|---|---|---|---|
| **Upper Body / Arms** | 11, 12, 13, 14, 15, 16 (shoulders, elbows, wrists) | Mid-shoulder | 12 |
| **Head Spatial Anchors** | 0, 2, 5, 9, 10 (nose, eyes, mouth corners) | Mid-shoulder | 10 |
| **Left Hand** | 21 hand landmarks | Left wrist (hand lm 0) | 42 |
| **Right Hand** | 21 hand landmarks | Right wrist (hand lm 0) | 42 |
| | | **Total** | **106** |

> **Note:** Hands are zero-padded (42 zeros) when not detected in frame, ensuring a constant feature dimension.

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Record Reference Templates
Record dynamic gesture variations (e.g. `namaste`, `hello`, `thank_you`):

```bash
# Record 'namaste' gesture (prompts for 10 variations)
python record_template.py --name namaste

# Record digits 0-9 sequentially
python record_template_0-9.py
```
* **Instructions**:
  - Stand in front of the camera so your upper body and hands are visible.
  - Press and hold **`SPACEBAR`** to begin recording a variation. Release or press space again to stop.
  - The script will capture 10 natural variations per class to ensure high accuracy.
  - Outputs are saved automatically as `templates/reference_<gesture_name>_01.npy`, etc.

---

### 3. Run Real-time Gesture Recognition
Launch the live DTW recognizer:

```bash
python main.py
```

#### Custom Options:
```bash
# Set a custom DTW distance threshold (default is 30.0)
python main.py --threshold 25.0

# Use a specific camera index (default: 0)
python main.py --camera 1
```

---

## 🧠 Technical Highlights

- **MediaPipe Holistic**: Unified detection of pose, left hand, and right hand in a single pass — enabling ISL signs that involve two-hand interaction, torso-relative arm positioning, and face-anchored gestures.
- **Translation Invariance**: Upper body and head landmarks are normalized relative to mid-shoulder `((lm11 + lm12) / 2)`. Hand landmarks are normalized relative to their respective wrist (landmark 0).
- **Constant Feature Dimension**: Zero-padding ensures a fixed 106-dimensional vector per frame regardless of hand visibility.
- **Dynamic Sliding Window**: Automatically adapts to match the length of the recorded templates (instead of forcing a strict 30 frames).
- **Multi-Template Grouping**: Groups multiple recorded variations (e.g., `_01`, `_02`) under a single class and finds the minimum DTW distance to ensure robust recognition against natural human variation.
- **FastDTW Matching**: Computes temporal sequence alignment against all loaded reference templates using Euclidean spatial distance (`scipy.spatial.distance.euclidean`). Optimized to evaluate every 3 frames to maintain high CPU performance.
- **Duplicate Suppression**: Once a gesture is recognized below the distance threshold, the rolling buffer is automatically cleared to prevent repeated false triggers.
