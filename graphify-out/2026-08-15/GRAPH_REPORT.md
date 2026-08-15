# Graph Report - SIH_ISL_2026  (2026-08-15)

## Corpus Check
- 32 files · ~13,951 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 190 nodes · 257 edges · 15 communities (11 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0cb01890`
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
- extract_landmarks
- 🚀 Quickstart Guide

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `extract_landmarks()` - 9 edges
3. `DemoState` - 8 edges
4. `KYCField` - 8 edges
5. `main()` - 7 edges
6. `HandDetector` - 7 edges
7. `get_hand_detector()` - 7 edges
8. `draw_landmarks_on_frame()` - 7 edges
9. `Action Plan: Tasks to be Completed (In Sequence)` - 7 edges
10. `main()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `LoginProps` --references--> `Customer`  [EXTRACTED]
  src/components/Login.tsx → src/types.ts
- `RegistrationProps` --references--> `Customer`  [EXTRACTED]
  src/components/Registration.tsx → src/types.ts
- `VideoPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/VideoPanel.tsx → src/types.ts
- `main()` --calls--> `draw_landmarks_on_frame()`  [EXTRACTED]
  isl_dtw/main.py → isl_dtw/utils.py

## Import Cycles
- None detected.

## Communities (15 total, 4 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.09
Nodes (23): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+15 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.11
Nodes (26): App(), AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps (+18 more)

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

### Community 13 - "extract_landmarks"
Cohesion: 0.11
Nodes (24): draw_hud(), load_templates(), main(), parse_args(), ndarray, Loads all .npy reference gesture templates from the specified directory.…, Renders an informative real-time HUD with recognition status, buffer meter, and…, draw_overlay() (+16 more)

### Community 14 - "🚀 Quickstart Guide"
Cohesion: 0.22
Nodes (8): 1. Install Dependencies, 2. Record Reference Templates, 3. Run Real-time Gesture Recognition, Custom Options:, 📁 Project Structure, 🚀 Quickstart Guide, Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition, 🧠 Technical Highlights

## Knowledge Gaps
- **71 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10810810810810811 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._