# Graph Report - SIH_ISL_2026  (2026-08-12)

## Corpus Check
- 24 files · ~9,347 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 140 nodes · 171 edges · 14 communities (9 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74f2bbff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- AuditModal.tsx
- package.json
- SignKYC — Bank Official Console (V-CIP Assist View)
- index.ts
- rules/graphify.md
- workflows/graphify.md
- vercel.json
- Action Plan: Tasks to be Completed (In Sequence)
- CustomerSideModal.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `DemoState` - 8 edges
3. `KYCField` - 8 edges
4. `Action Plan: Tasks to be Completed (In Sequence)` - 7 edges
5. `scripts` - 6 edges
6. `SignKYC — Bank Official Console (V-CIP Assist View)` - 5 edges
7. `SessionStatus` - 4 edges
8. `ProgressStep` - 4 edges
9. `SessionData` - 4 edges
10. `lib` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AuditModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/AuditModal.tsx → src/types.ts
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `VideoPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/VideoPanel.tsx → src/types.ts
- `AIAssistPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/AIAssistPanel.tsx → src/types.ts
- `AIAssistPanelProps` --references--> `KYCField`  [EXTRACTED]
  src/components/AIAssistPanel.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (14 total, 5 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.09
Nodes (23): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+15 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.14
Nodes (20): App(), AIAssistPanel(), AIAssistPanelProps, EditFieldModal(), EditFieldModalProps, FooterControls(), FooterControlsProps, HeaderBar() (+12 more)

### Community 3 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

### Community 4 - "AuditModal.tsx"
Cohesion: 0.47
Nodes (4): AuditModal(), AuditModalProps, supabase, SessionData

### Community 5 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, start (+2 more)

### Community 6 - "SignKYC — Bank Official Console (V-CIP Assist View)"
Cohesion: 0.33
Nodes (5): 🎯 Core Pitch & Workflow Loop, 📌 Executive Summary, 🚀 Interactive Demo States, SignKYC — Bank Official Console (V-CIP Assist View), 🛠️ Technology Stack

### Community 12 - "Action Plan: Tasks to be Completed (In Sequence)"
Cohesion: 0.18
Nodes (10): Action Plan: Tasks to be Completed (In Sequence), Current Status & Completed Items, Phase 1: Core AI Recognition Pipeline, Phase 2: Environment & Backend Polish, Phase 3: Liveness Verification (Optional / Scripted), Phase 4: Data Persistence (Optional), Phase 5: Customer-Side View, Project Flow Reference (+2 more)

## Knowledge Gaps
- **65 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13793103448275862 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._