# Graph Report - 32423423423  (2026-08-11)

## Corpus Check
- 20 files · ~8,383 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 116 nodes · 147 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
- types.ts
- package.json
- SignKYC — Bank Official Console (V-CIP Assist View)
- rules/graphify.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `DemoState` - 8 edges
3. `KYCField` - 8 edges
4. `scripts` - 6 edges
5. `SignKYC — Bank Official Console (V-CIP Assist View)` - 5 edges
6. `SessionStatus` - 4 edges
7. `ProgressStep` - 4 edges
8. `SessionData` - 4 edges
9. `lib` - 4 edges
10. `AIAssistPanelProps` - 3 edges

## Surprising Connections (you probably didn't know these)
- `EditFieldModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/EditFieldModal.tsx → src/types.ts
- `VideoPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/VideoPanel.tsx → src/types.ts
- `AIAssistPanelProps` --references--> `DemoState`  [EXTRACTED]
  src/components/AIAssistPanel.tsx → src/types.ts
- `AIAssistPanelProps` --references--> `KYCField`  [EXTRACTED]
  src/components/AIAssistPanel.tsx → src/types.ts
- `AuditModalProps` --references--> `KYCField`  [EXTRACTED]
  src/components/AuditModal.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.10
Nodes (21): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+13 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules (+10 more)

### Community 2 - "App.tsx"
Cohesion: 0.17
Nodes (11): App(), AuditModal(), CustomerSideModal(), CustomerSideModalProps, FooterControls(), FooterControlsProps, InterpreterModal(), InterpreterModalProps (+3 more)

### Community 3 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

### Community 4 - "types.ts"
Cohesion: 0.18
Nodes (14): AIAssistPanel(), AIAssistPanelProps, AuditModalProps, EditFieldModal(), EditFieldModalProps, HeaderBar(), HeaderBarProps, VideoPanel() (+6 more)

### Community 5 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, start (+2 more)

### Community 6 - "SignKYC — Bank Official Console (V-CIP Assist View)"
Cohesion: 0.33
Nodes (5): 🎯 Core Pitch & Workflow Loop, 📌 Executive Summary, 🚀 Interactive Demo States, SignKYC — Bank Official Console (V-CIP Assist View), 🛠️ Technology Stack

## Knowledge Gaps
- **52 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._