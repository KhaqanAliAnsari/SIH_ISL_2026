# Graph Report - SIH_ISL_2026  (2026-08-18)

## Corpus Check
- 36 files · ~21,073 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 253 nodes · 391 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8077162`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- Login.tsx
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

## God Nodes (most connected - your core abstractions)
1. `VideoPanel()` - 16 edges
2. `compilerOptions` - 16 edges
3. `extract_holistic_features()` - 9 edges
4. `DemoState` - 8 edges
5. `KYCField` - 8 edges
6. `main()` - 7 edges
7. `draw_holistic_landmarks()` - 7 edges
8. `pushGesture()` - 7 edges
9. `Action Plan: Tasks to be Completed (In Sequence)` - 7 edges
10. `main()` - 6 edges

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

## Communities (16 total, 3 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.08
Nodes (25): dotenv, express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, dotenv (+17 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.10
Nodes (30): App(), AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps (+22 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+17 more)

### Community 4 - "Login.tsx"
Cohesion: 0.36
Nodes (7): Login(), LoginProps, Registration(), RegistrationProps, isSupabaseConfigured, supabase, Customer

### Community 5 - "sentenceEngine.ts"
Cohesion: 0.23
Nodes (15): VideoPanelProps, clearIdleTimer(), DispatchReason, dispatchSentence(), isStopGesture(), manualDispatch(), pushGesture(), resetEngine() (+7 more)

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
Cohesion: 0.09
Nodes (36): KEY_LANDMARKS, VideoPanel(), clearBuffer(), dtwCurrRow, dtwDistance(), dtwPrevRow, euclideanDistanceSq(), euclidScratch (+28 more)

## Knowledge Gaps
- **89 isolated node(s):** `TEMPLATES_DIR`, `phraseCache`, `name`, `private`, `version` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `VideoPanel()` connect `VideoPanel.tsx` to `App.tsx`, `sentenceEngine.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `TEMPLATES_DIR`, `phraseCache`, `name` to the rest of the system?**
  _89 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._