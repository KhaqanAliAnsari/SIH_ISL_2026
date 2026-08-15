# Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition

Dynamic Indian Sign Language (ISL) gesture recognition pipeline using **MediaPipe Hands** and **Dynamic Time Warping (FastDTW)**.

---

## 📁 Project Structure

```text
isl_dtw/
├── templates/               # Stores recorded reference templates (.npy)
├── utils.py                 # MediaPipe extraction & translation normalization (42-dim vector)
├── record_template.py       # Records 30 frames of dynamic gesture to reference_<name>.npy
├── main.py                  # Real-time FastDTW recognizer with rolling 30-frame buffer
├── requirements.txt         # Dependencies
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Record Reference Templates
Record a dynamic 30-frame sign gesture (e.g. `namaste`, `hello`, `thank_you`):

```bash
# Record 'namaste' gesture
python record_template.py --name namaste

# Record 'hello' gesture
python record_template.py --name hello
```
* **Instructions**:
  - Show your hand in front of the camera.
  - Press **`S`** to begin recording.
  - Perform the dynamic gesture smoothly within the 30-frame progress bar.
  - Output is saved automatically as `templates/reference_<gesture_name>.npy`.

---

### 3. Run Real-time Gesture Recognition
Launch the live DTW recognizer:

```bash
python main.py
```

#### Custom Options:
```bash
# Set a custom DTW distance threshold (default is 15.0)
python main.py --threshold 16.5

# Use a specific camera index (default: 0)
python main.py --camera 1
```

---

## 🧠 Technical Highlights

- **Translation Invariance**: Wrist landmark (landmark 0: `x0, y0`) is subtracted from all 21 hand landmarks, creating a $21 \times 2 = 42$-dimensional feature vector per frame.
- **Zero-Padding**: Automatically zero-pads `(42,)` when no hand is present.
- **FastDTW Matching**: Computes temporal sequence alignment against all loaded reference templates using Euclidean spatial distance (`scipy.spatial.distance.euclidean`).
- **Duplicate Suppression**: Once a gesture is recognized below the distance threshold, the rolling buffer is automatically cleared to prevent repeated false triggers.
