# Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)

Dynamic Indian Sign Language (ISL) gesture recognition pipeline using **MediaPipe Holistic** (full upper body + both hands + head anchors) and **Dynamic Time Warping (FastDTW)**.

---

## 📁 Project Structure

```text
isl_dtw/
├── templates/               # Stores recorded reference templates (.npy)
├── utils.py                 # MediaPipe Holistic extraction & normalization (106-dim vector)
├── record_template.py       # Records variable-length multi-variation gesture templates using Spacebar
├── record_template_0-9.py   # Batch recorder for digits 0-9 with 10 variations each
├── main.py                  # Real-time FastDTW recognizer with dynamic 90-frame rolling window
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

> **Note:** Hands are zero-padded (42 zeros) when not detected in frame, ensuring a constant feature dimension. Arrays are pre-allocated for high-performance zero-garbage execution.

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Record Reference Templates
Record 10 natural variations of a variable-length sign gesture (e.g. `namaste`, `hello`, `thank_you`):

```bash
# Record 'namaste' gesture
python record_template.py --name namaste
```
* **Instructions**:
  - Stand in front of the camera so your upper body and hands are visible.
  - **Hold SPACEBAR** to begin recording a variation.
  - Perform the dynamic gesture smoothly.
  - **Release SPACEBAR** when finished.
  - Repeat 10 times to capture natural variations (`reference_namaste_01.npy` to `10.npy`).
  - Output is saved automatically in `templates/`.

---

### 3. Run Real-time Gesture Recognition
Launch the live DTW recognizer:

```bash
python main.py
```

#### Custom Options:
```bash
# Use a specific camera index (default: 0)
python main.py --camera 1
```

---

## 🧠 Technical Highlights

- **Dynamic Sliding Window Engine**: The recognizer maintains a 90-frame `deque` rolling buffer. It matches gestures by extracting a variable-length slice off the end of the buffer corresponding precisely to the length of the template variation being checked.
- **Multi-Template Variation Classes**: By recording 10 variations per gesture, the recognizer accounts for different durations and slight deviations in execution, massively boosting real-world robustness.
- **CPU Optimization (`DTW_EVAL_RATE = 3`)**: Evaluates DTW every 3 frames instead of every frame. Given the overlapping 90-frame buffer, this preserves accuracy while saving 66% of CPU cycles, ensuring 30 FPS inference.
- **MediaPipe Holistic**: Unified detection of pose, left hand, and right hand in a single pass — enabling ISL signs that involve two-hand interaction, torso-relative arm positioning, and face-anchored gestures.
- **Translation Invariance**: Upper body and head landmarks are normalized relative to mid-shoulder `((lm11 + lm12) / 2)`. Hand landmarks are normalized relative to their respective wrist (landmark 0).
- **FastDTW Matching**: Computes temporal sequence alignment against all loaded reference templates using Euclidean spatial distance (`scipy.spatial.distance.euclidean`).
- **Duplicate Suppression**: Once a gesture is recognized below the distance threshold, the rolling buffer is automatically cleared to prevent repeated false triggers.
