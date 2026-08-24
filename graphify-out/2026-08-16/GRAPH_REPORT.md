# Graph Report - SIH_ISL_2026  (2026-08-16)

## Corpus Check
- 34 files · ~16,972 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 216 nodes · 308 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f285c323`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- Login.tsx
- package.json
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
1. `compilerOptions` - 16 edges
2. `VideoPanel()` - 13 edges
3. `extract_holistic_features()` - 9 edges
4. `DemoState` - 8 edges
5. `KYCField` - 8 edges
6. `main()` - 7 edges
7. `draw_holistic_landmarks()` - 7 edges
8. `Action Plan: Tasks to be Completed (In Sequence)` - 7 edges
9. `main()` - 6 edges
10. `init_holistic()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `LoginProps` --references--> `Customer`  [EXTRACTED]
  src/components/Login.tsx → src/types.ts
- `RegistrationProps` --references--> `Customer`  [EXTRACTED]
  src/components/Registration.tsx → src/types.ts
- `VideoPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/VideoPanel.tsx → src/types.ts
- `main()` --calls--> `draw_holistic_landmarks()`  [EXTRACTED]
  isl_dtw/main.py → isl_dtw/utils.py

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.08
Nodes (25): dotenv, express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, dotenv (+17 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.11
Nodes (25): App(), AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps (+17 more)

### Community 3 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

### Community 4 - "Login.tsx"
Cohesion: 0.36
Nodes (7): Login(), LoginProps, Registration(), RegistrationProps, isSupabaseConfigured, supabase, Customer

### Community 5 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, start (+2 more)

### Community 6 - "SignKYC — Bank Official Console (V-CIP Assist View)"
Cohesion: 0.33
Nodes (5): 🎯 Core Pitch & Workflow Loop, 📌 Executive Summary, 🚀 Interactive Demo States, SignKYC — Bank Official Console (V-CIP Assist View), 🛠️ Technology Stack

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
Cohesion: 0.15
Nodes (23): KEY_LANDMARKS, VideoPanel(), clearBuffer(), dtwDistance(), euclideanDistance(), frameBuffer, GestureTemplate, getBufferFill() (+15 more)

## Knowledge Gaps
- **78 isolated node(s):** `TEMPLATES_DIR`, `name`, `private`, `version`, `type` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `VideoPanel()` connect `VideoPanel.tsx` to `App.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `TEMPLATES_DIR`, `name`, `private` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._