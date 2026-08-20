# Graph Report - SIH_ISL_2026  (2026-08-19)

## Corpus Check
- 54 files · ~41,679,179 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 333 nodes · 478 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f2e43990`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- convert_video_to_pose_embedded_np_array
- sentenceEngine.ts
- SignKYC — Bank Official Console (V-CIP Assist View)
- index.ts
- rules/graphify.md
- workflows/graphify.md
- vercel.json
- Action Plan: Tasks to be Completed (In Sequence)
- extract_holistic_features
- Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)
- VideoPanel.tsx
- Word Level Indian Sign Language Recognition
- video_array_maker
- augment_and_save_frames
- ISL_Recognition
- train_static_mlp.py
- preprocess_static.py

## God Nodes (most connected - your core abstractions)
1. `VideoPanel()` - 18 edges
2. `compilerOptions` - 16 edges
3. `Word Level Indian Sign Language Recognition` - 14 edges
4. `extract_holistic_features()` - 9 edges
5. `convert_video_to_pose_embedded_np_array()` - 8 edges
6. `DemoState` - 8 edges
7. `KYCField` - 8 edges
8. `main()` - 7 edges
9. `draw_holistic_landmarks()` - 7 edges
10. `pushGesture()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `LoginProps` --references--> `Customer`  [EXTRACTED]
  src/components/Login.tsx → src/types.ts
- `PhrasedSentenceStripProps` --references--> `PhrasedSentence`  [EXTRACTED]
  src/components/PhrasedSentenceStrip.tsx → src/types.ts
- `RegistrationProps` --references--> `Customer`  [EXTRACTED]
  src/components/Registration.tsx → src/types.ts
- `VideoPanel()` --calls--> `manualDispatch()`  [EXTRACTED]
  src/components/VideoPanel.tsx → src/lib/sentenceEngine.ts

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.07
Nodes (27): dotenv, express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, dotenv (+19 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.09
Nodes (37): AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps, EditFieldModal() (+29 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+17 more)

### Community 4 - "convert_video_to_pose_embedded_np_array"
Cohesion: 0.11
Nodes (18): get, initialize_model(), Initializes lstm model and loads the trained model weight, adds video format to video recieved from server and predicts the action made in…, test(), upload_video(), initialize_model(), Initializes lstm model and loads the trained model weight (+10 more)

### Community 5 - "sentenceEngine.ts"
Cohesion: 0.21
Nodes (15): App(), clearIdleTimer(), DispatchReason, dispatchSentence(), getCurrentTokens(), getEngineState(), initSentenceEngine(), isStopGesture() (+7 more)

### Community 6 - "SignKYC — Bank Official Console (V-CIP Assist View)"
Cohesion: 0.33
Nodes (5): 🎯 Core Pitch & Workflow Loop, 📌 Executive Summary, 🚀 Interactive Demo States, SignKYC — Bank Official Console (V-CIP Assist View), 🛠️ Technology Stack

### Community 7 - "index.ts"
Cohesion: 0.33
Nodes (3): app, phraseCache, TEMPLATES_DIR

### Community 12 - "Action Plan: Tasks to be Completed (In Sequence)"
Cohesion: 0.18
Nodes (10): Action Plan: Tasks to be Completed (In Sequence), Current Status & Completed Items, Phase 1: Core AI Recognition Pipeline, Phase 2: Environment & Backend Polish, Phase 3: Liveness Verification (Optional / Scripted), Phase 4: Data Persistence (Optional), Phase 5: Customer-Side View, Project Flow Reference (+2 more)

### Community 13 - "extract_holistic_features"
Cohesion: 0.12
Nodes (23): draw_hud(), load_templates(), main(), parse_args(), ndarray, Loads all .npy reference gesture templates from the specified directory. Only…, Renders an informative real-time HUD with recognition status, buffer meter, and…, draw_overlay() (+15 more)

### Community 14 - "Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)"
Cohesion: 0.20
Nodes (9): 1. Install Dependencies, 2. Record Reference Templates, 3. Run Real-time Gesture Recognition, Custom Options:, 🧬 Feature Vector Layout (106 dimensions per frame), 📁 Project Structure, 🚀 Quickstart Guide, Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic) (+1 more)

### Community 15 - "VideoPanel.tsx"
Cohesion: 0.08
Nodes (40): KEY_LANDMARKS, VideoPanel(), clearBuffer(), dtwCurrRow, dtwDistance(), dtwPrevRow, euclideanDistanceSq(), euclidScratch (+32 more)

### Community 16 - "Word Level Indian Sign Language Recognition"
Cohesion: 0.11
Nodes (18): Acknowledgements, Actions: [Hello, How are you, Thank you], API Reference, Architectures, Background, Brief Explanation:, Data, Dataset Details : (+10 more)

### Community 17 - "video_array_maker"
Cohesion: 0.36
Nodes (4): pose_estimation(), Function which takes in image , and the result from mediapipe posenet and uses…, pather : location of video height,width (default : 224) output_directory…, video_array_maker()

### Community 18 - "augment_and_save_frames"
Cohesion: 0.67
Nodes (3): augment_and_save_frames(), augment_videos(), Fetch each frame of video and augment and save as picture in a temporary folder…

### Community 19 - "ISL_Recognition"
Cohesion: 0.50
Nodes (3): Giving input in command line:, ISL_Recognition, Word Level Indian Sign Language Recognition

### Community 20 - "train_static_mlp.py"
Cohesion: 0.25
Nodes (7): build_model(), compute_weights(), load_data(), train_static_mlp.py -- Train an MLP classifier for static ISL hand poses (0-9,…, Load features and labels from CSV., Improved MLP architecture: Input(84) -> GaussianNoise(0.01) -> Dense(256) -> BN…, Compute class weights to handle imbalanced classes.

### Community 21 - "preprocess_static.py"
Cohesion: 0.40
Nodes (5): get_existing_classes(), process_dataset(), preprocess_static.py -- Extract 84-dim hand landmark features from static ISL…, Read existing CSV and return set of class labels already processed., Process dataset images to extract hand landmark features.

## Knowledge Gaps
- **107 isolated node(s):** `TEMPLATES_DIR`, `phraseCache`, `name`, `private`, `version` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `VideoPanel()` connect `VideoPanel.tsx` to `App.tsx`, `sentenceEngine.ts`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `TEMPLATES_DIR`, `phraseCache`, `name` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08705882352941176 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._