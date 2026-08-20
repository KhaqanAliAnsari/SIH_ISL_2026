"""
train_static_mlp.py -- Train an MLP classifier for static ISL hand poses (0-9, A-Z).

Upgraded with:
  - Deeper architecture (256->128->64 with BatchNorm + Dropout)
  - Class weight balancing for underrepresented classes
  - ReduceLROnPlateau scheduler
  - Gaussian noise augmentation layer
  - Per-class accuracy report
  - Auto-copy TFJS model to public/ directory
  - CPU-optimized (oneDNN, multi-threading)
"""

import os
import sys
import shutil
import json
import time
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

# --- CPU Optimization (Throttled to prevent freezing) ---
os.environ['OMP_NUM_THREADS'] = '8'
os.environ['OPENBLAS_NUM_THREADS'] = '8'
os.environ['MKL_NUM_THREADS'] = '8'
tf.config.threading.set_intra_op_parallelism_threads(8)  # limit cores
tf.config.threading.set_inter_op_parallelism_threads(8)  # limit cores
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '1'  # Enable oneDNN for CPU speedup


def load_data(csv_path):
    """Load features and labels from CSV."""
    if not os.path.exists(csv_path):
        print("  [FAIL] File not found: %s" % csv_path)
        sys.exit(1)
    df = pd.read_csv(csv_path, low_memory=False)
    X = df.drop('label', axis=1).values.astype(np.float32)
    y = df['label'].astype(str).values
    print("  Loaded %s: %s samples, %d features" % (csv_path, f"{X.shape[0]:,}", X.shape[1]))
    return X, y


def build_model(input_dim, num_classes):
    """
    Improved MLP architecture:
      Input(84) -> GaussianNoise(0.01)
               -> Dense(256) -> BN -> ReLU -> Dropout(0.3)
               -> Dense(128) -> BN -> ReLU -> Dropout(0.3)
               -> Dense(64)  -> BN -> ReLU -> Dropout(0.2)
               -> Dense(num_classes, softmax)

    ~40K parameters -- still tiny for TF.js (<100KB model).
    """
    model = tf.keras.Sequential([
        tf.keras.layers.InputLayer(input_shape=(input_dim,)),

        # Gaussian noise augmentation (only active during training)
        tf.keras.layers.GaussianNoise(0.01),

        # Block 1
        tf.keras.layers.Dense(256, use_bias=False),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.Dropout(0.3),

        # Block 2
        tf.keras.layers.Dense(128, use_bias=False),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.Dropout(0.3),

        # Block 3
        tf.keras.layers.Dense(64, use_bias=False),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.Dropout(0.2),

        # Output
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def compute_weights(y_train_enc, encoder):
    """Compute class weights to handle imbalanced classes."""
    classes = np.unique(y_train_enc)
    weights = compute_class_weight('balanced', classes=classes, y=y_train_enc)
    weight_dict = {int(i): float(w) for i, w in zip(classes, weights)}
    return weight_dict


if __name__ == "__main__":
    t_start = time.time()

    print("=== Static MLP Training (CPU-optimized) ===")
    print()

    train_csv = "static_features_train.csv"
    val_csv = "static_features_val.csv"
    test_csv = "static_features_test.csv"

    # --- Load Data ---
    print("[1] Loading datasets...")
    X_train, y_train = load_data(train_csv)

    # Handle missing val/test gracefully
    has_val = os.path.exists(val_csv)
    has_test = os.path.exists(test_csv)

    if has_val:
        X_val, y_val = load_data(val_csv)
    else:
        print("  [WARN] No validation set found. Splitting 10%% from training data.")
        from sklearn.model_selection import train_test_split
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=0.1, random_state=42, stratify=y_train
        )

    if has_test:
        X_test, y_test = load_data(test_csv)
    else:
        print("  [WARN] No test set found. Will use validation set for final eval.")
        X_test, y_test = X_val, y_val

    print()

    # --- Encode Labels ---
    print("[2] Encoding labels...")
    encoder = LabelEncoder()
    all_labels = np.concatenate([y_train, y_val, y_test])
    encoder.fit(all_labels)

    y_train_enc = encoder.transform(y_train)
    y_val_enc = encoder.transform(y_val)
    y_test_enc = encoder.transform(y_test)

    num_classes = len(encoder.classes_)
    print("  Classes (%d): %s" % (num_classes, list(encoder.classes_)))

    # Save class mapping
    with open("classes.json", "w") as f:
        json.dump(list(encoder.classes_), f)
    print("  [OK] Saved classes.json")
    print()

    # --- Class Weights ---
    print("[3] Computing class weights for imbalanced classes...")
    class_weights = compute_weights(y_train_enc, encoder)
    for cls_idx, weight in sorted(class_weights.items(), key=lambda x: x[1], reverse=True):
        if weight > 1.2 or weight < 0.8:
            cls_name = encoder.classes_[cls_idx]
            count = np.sum(y_train_enc == cls_idx)
            print("  Class '%s': weight=%.2f (n=%s)" % (cls_name, weight, f"{count:,}"))
    print()

    # --- Build Model ---
    print("[4] Building model...")
    model = build_model(X_train.shape[1], num_classes)
    model.summary()
    print()

    # --- Training ---
    print("[5] Training...")
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=12, restore_best_weights=True, verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6, verbose=1
        ),
    ]

    t_train = time.time()
    history = model.fit(
        X_train, y_train_enc,
        validation_data=(X_val, y_val_enc),
        epochs=100,
        batch_size=64,  # Larger batch for CPU efficiency
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1
    )
    train_time = time.time() - t_train
    print()
    print("  [OK] Training completed in %.1fs (%d epochs)" % (train_time, len(history.epoch)))
    print()

    # --- Evaluation ---
    print("[6] Evaluating on test set...")
    test_loss, test_acc = model.evaluate(X_test, y_test_enc, verbose=0)
    print("  Test Accuracy: %.4f (%.1f%%)" % (test_acc, test_acc * 100))
    print("  Test Loss: %.4f" % test_loss)

    # Per-class accuracy
    print()
    print("  Per-class accuracy:")
    y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
    for i, cls_name in enumerate(encoder.classes_):
        mask = y_test_enc == i
        if np.sum(mask) > 0:
            cls_acc = np.mean(y_pred[mask] == y_test_enc[mask])
            marker = " [WARN]" if cls_acc < 0.85 else ""
            print("    %s: %.3f (%d samples)%s" % (cls_name, cls_acc, np.sum(mask), marker))
    print()

    # --- Save Keras Model ---
    keras_path = "static_mlp.keras"
    model.save(keras_path)
    print("  [OK] Saved Keras model: %s" % keras_path)

    # --- Export to TensorFlow.js ---
    print("[7] Exporting to TensorFlow.js...")
    tfjs_dir = "tfjs_model"
    if os.path.exists(tfjs_dir):
        shutil.rmtree(tfjs_dir)
    os.makedirs(tfjs_dir)

    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, tfjs_dir)
        print("  [OK] TF.js model saved in %s/" % tfjs_dir)
    except Exception as e:
        print("  [WARN] TFJS Python export failed: %s" % str(e))
        print("  Trying CLI converter...")
        # Try saving as SavedModel first, then converting
        saved_model_dir = "static_mlp_saved"
        if os.path.exists(saved_model_dir):
            shutil.rmtree(saved_model_dir)
        model.export(saved_model_dir)
        ret = os.system(
            'python -m tensorflowjs.converters.converter '
            '--input_format=tf_saved_model '
            '--output_format=tfjs_graph_model '
            '"%s" "%s"' % (saved_model_dir, tfjs_dir)
        )
        if ret == 0 and os.path.exists(os.path.join(tfjs_dir, "model.json")):
            print("  [OK] TF.js model saved via CLI fallback")
        else:
            # Last resort: use keras_h5 path
            h5_path = "static_mlp.h5"
            model.save(h5_path, save_format='h5')
            ret2 = os.system(
                'python -m tensorflowjs.converters.keras_h5_to_tfjs '
                '"%s" "%s"' % (h5_path, tfjs_dir)
            )
            if ret2 == 0 and os.path.exists(os.path.join(tfjs_dir, "model.json")):
                print("  [OK] TF.js model saved via H5->TFJS fallback")
            else:
                print("  [FAIL] All TFJS export methods failed.")
                sys.exit(1)

    # --- Copy to public/ ---
    public_tfjs = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "public", "tfjs_model"
    )
    print("[8] Copying to %s..." % public_tfjs)
    if os.path.exists(public_tfjs):
        shutil.rmtree(public_tfjs)
    shutil.copytree(tfjs_dir, public_tfjs)
    
    # Also copy classes.json
    shutil.copy("classes.json", os.path.join(public_tfjs, "classes.json"))
    print("  [OK] Copied classes.json to public/tfjs_model/")

    # Verify
    model_json = os.path.join(public_tfjs, "model.json")
    if os.path.exists(model_json):
        total_size = sum(
            os.path.getsize(os.path.join(public_tfjs, f))
            for f in os.listdir(public_tfjs)
        )
        print("  [OK] Deployed to public/tfjs_model/ (%s bytes total)" % f"{total_size:,}")
    else:
        print("  [FAIL] model.json not found in public/tfjs_model/!")
        sys.exit(1)

    # --- Summary ---
    total_time = time.time() - t_start
    print()
    print("=== Done in %.1fs ===" % total_time)
    print("  Model: %d classes, test accuracy %.1f%%" % (num_classes, test_acc * 100))
    print("  TFJS model ready at: public/tfjs_model/model.json")
