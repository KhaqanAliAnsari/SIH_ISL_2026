# Graph Report - SIH_ISL_2026  (2026-08-21)

## Corpus Check
- 43 files · ~24,154 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 275 nodes · 411 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a97aa4b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- measure.cjs
- sentenceEngine.ts
- SignKYC — Bank Official Console (V-CIP Assist View)
- index.ts
- rules/graphify.md
- workflows/graphify.md
- vercel.json
- Action Plan: Tasks to be Completed (In Sequence)
- main.py
- Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)
- VideoPanel.tsx
- train_static_mlp.py
- preprocess_static.py

## God Nodes (most connected - your core abstractions)
1. `VideoPanel()` - 16 edges
2. `compilerOptions` - 16 edges
3. `init_holistic()` - 8 edges
4. `extract_holistic_features()` - 8 edges
5. `draw_holistic_landmarks()` - 8 edges
6. `DemoState` - 8 edges
7. `KYCField` - 8 edges
8. `pushGesture()` - 7 edges
9. `Action Plan: Tasks to be Completed (In Sequence)` - 7 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `pushGesture()`  [EXTRACTED]
  src/App.tsx → src/lib/sentenceEngine.ts
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `LoginProps` --references--> `Customer`  [EXTRACTED]
  src/components/Login.tsx → src/types.ts
- `PhrasedSentenceStripProps` --references--> `PhrasedSentence`  [EXTRACTED]
  src/components/PhrasedSentenceStrip.tsx → src/types.ts
- `RegistrationProps` --references--> `Customer`  [EXTRACTED]
  src/components/Registration.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.07
Nodes (27): dotenv, express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, dotenv (+19 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.08
Nodes (36): App(), AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps (+28 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+17 more)

### Community 5 - "sentenceEngine.ts"
Cohesion: 0.21
Nodes (16): VideoPanelProps, clearIdleTimer(), DispatchReason, dispatchSentence(), getEngineState(), isStopGesture(), manualDispatch(), pushGesture() (+8 more)

### Community 6 - "SignKYC — Bank Official Console (V-CIP Assist View)"
Cohesion: 0.33
Nodes (5): 🎯 Core Pitch & Workflow Loop, 📌 Executive Summary, 🚀 Interactive Demo States, SignKYC — Bank Official Console (V-CIP Assist View), 🛠️ Technology Stack

### Community 7 - "index.ts"
Cohesion: 0.33
Nodes (3): app, phraseCache, TEMPLATES_DIR

### Community 12 - "Action Plan: Tasks to be Completed (In Sequence)"
Cohesion: 0.18
Nodes (10): Action Plan: Tasks to be Completed (In Sequence), Current Status & Completed Items, Phase 1: Core AI Recognition Pipeline, Phase 2: Environment & Backend Polish, Phase 3: Liveness Verification (Optional / Scripted), Phase 4: Data Persistence (Optional), Phase 5: Customer-Side View, Project Flow Reference (+2 more)

### Community 13 - "main.py"
Cohesion: 0.10
Nodes (25): draw_hud(), load_templates(), main(), parse_args(), ndarray, Renders an informative real-time HUD with recognition status, buffer meter, and…, Loads all .npy reference gesture templates from the specified directory. Only…, draw_overlay() (+17 more)

### Community 14 - "Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)"
Cohesion: 0.20
Nodes (9): 1. Install Dependencies, 2. Record Reference Templates, 3. Run Real-time Gesture Recognition, Custom Options:, 🧬 Feature Vector Layout (106 dimensions per frame), 📁 Project Structure, 🚀 Quickstart Guide, Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic) (+1 more)

### Community 15 - "VideoPanel.tsx"
Cohesion: 0.09
Nodes (35): KEY_LANDMARKS, VideoPanel(), clearBuffer(), dtwCurrRow, dtwDistance(), dtwPrevRow, euclideanDistanceSq(), fillRecentFrames() (+27 more)

### Community 20 - "train_static_mlp.py"
Cohesion: 0.25
Nodes (7): build_model(), compute_weights(), load_data(), train_static_mlp.py -- Train an MLP classifier for static ISL hand poses (0-9,…, Load features and labels from CSV., Improved MLP architecture: Input(84) -> GaussianNoise(0.01) -> Dense(256) -> BN…, Compute class weights to handle imbalanced classes.

### Community 21 - "preprocess_static.py"
Cohesion: 0.40
Nodes (5): get_existing_classes(), process_dataset(), preprocess_static.py -- Extract 84-dim hand landmark features from static ISL…, Read existing CSV and return set of class labels already processed., Process dataset images to extract hand landmark features.

## Knowledge Gaps
- **91 isolated node(s):** `TEMPLATES_DIR`, `phraseCache`, `puppeteer`, `name`, `private` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `VideoPanel()` connect `VideoPanel.tsx` to `App.tsx`, `sentenceEngine.ts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `TEMPLATES_DIR`, `phraseCache`, `puppeteer` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08392156862745098 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._