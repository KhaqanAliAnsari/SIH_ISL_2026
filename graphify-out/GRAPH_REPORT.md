# Graph Report - SIH_ISL_2026  (2026-08-16)

## Corpus Check
<<<<<<< Updated upstream
- 34 files · ~17,423 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 221 nodes · 315 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f285c323`
=======
- 267 files · ~479,866 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3587 nodes · 6737 edges · 259 communities (199 shown, 60 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 118 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a97aa4b7`
>>>>>>> Stashed changes
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- App.tsx
- devDependencies
<<<<<<< Updated upstream
- Login.tsx
- package.json
=======
- _read_text
- sentenceEngine.ts
>>>>>>> Stashed changes
- SignKYC — Bank Official Console (V-CIP Assist View)
- index.ts
- rules/graphify.md
- workflows/graphify.md
- vercel.json
- Action Plan: Tasks to be Completed (In Sequence)
- extract_holistic_features
- Real-time Dynamic Time Warping (DTW) ISL Gesture Recognition (Holistic)
- VideoPanel.tsx
<<<<<<< Updated upstream

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
=======
- _make_id
- extract.py
- Path
- watch.py
- train_static_mlp.py
- preprocess_static.py
- reflect.py
- cli.py
- cache.py
- hooks.py
- export.py
- serve.py
- dispatch_install_cli
- symbol_resolution.py
- Obsidian Flavored Markdown Skill
- analyze.py
- _is_type_like_definition
- /graphify
- prs.py
- write_callflow_html
- /graphify
- sanitize_metadata
- extract_files_direct
- What You Must Do When Invoked
- JSON Canvas Skill
- What You Must Do When Invoked
- paths.py
- Path
- scip_ingest.py
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- What You Must Do When Invoked
- generate_section_flowchart
- detect.py
- _call_llm
- _call_bedrock
- callflow_html.py
- diagnostics.py
- ingest.py
- Path
- llm.py
- security.py
- build_merge
- Counter
- detect
- file_slice.py
- pick_text
- __main__.py
- manifest_ingest.py
- mcp_ingest.py
- build_from_json
- deduplicate_entities
- CsharpNameResolver
- _install_claude_hook
- dtwEngine.ts
- build.py
- objc.py
- affected.py
- MinHash
- transcribe.py
- cluster.py
- save_manifest
- install.py
- semantic_cleanup.py
- _is_ignored
- google_workspace.py
- _ImageRef
- default_graph_json
- benchmark.py
- make_id
- _run_hook_guard
- dedup.py
- _always_on
- _extract_with_adaptive_retry
- _build_server
- verilog.py
- _agents_install
- _ip_is_blocked
- attach_graph_impact
- resolver_registry.py
- _norm
- tree_html.py
- Obsidian CLI
- Login.tsx
- _GraphContextCache
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- first_present
- introspect_cargo
- _is_sensitive
- Migrating a language extractor out of extract.py
- _collision_rank
- _query_terms
- normalize_sections
- humanize_label
- _kotlin_package_index
- _label_batch_with_retry
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- scripts
- pascal_resolution.py
- introspect_postgres
- package.json
- _content_token_swap
- _format_backend_env_keys
- _ApiKeyMiddleware
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- PhrasedSentence
- graphify/__init__.py
- _NoFileRedirectHandler
- _QueryScores
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- agents-md.md
- antigravity-rules.md
- claude-md.md
- gemini-md.md
- vscode-instructions.md
- _cut_lines_to_budget
- agents/references/extraction-spec.md
- amp/references/extraction-spec.md
- claude/references/extraction-spec.md
- claw/references/extraction-spec.md
- codex/references/extraction-spec.md
- copilot/references/extraction-spec.md
- droid/references/extraction-spec.md
- kilo/references/extraction-spec.md
- kiro/references/extraction-spec.md
- opencode/references/extraction-spec.md
- pi/references/extraction-spec.md
- trae/references/extraction-spec.md
- vscode/references/extraction-spec.md
- windows/references/extraction-spec.md
- dotenv
- lucide-react
- motion
- react-dom
- vite
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `_read_text()` - 122 edges
2. `dispatch_command()` - 117 edges
3. `_make_id()` - 112 edges
4. `_file_stem()` - 75 edges
5. `_rebuild_code()` - 56 edges
6. `_extract_generic()` - 40 edges
7. `extract()` - 37 edges
8. `dispatch_install_cli()` - 35 edges
9. `write_callflow_html()` - 32 edges
10. `_collect_js_symbol_resolution_facts()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `_UF` --uses--> `MinHash`  [INFERRED]
  .agents/skills/graphify/dedup.py → .agents/skills/graphify/_minhash.py
- `_UF` --uses--> `MinHashLSH`  [INFERRED]
  .agents/skills/graphify/dedup.py → .agents/skills/graphify/_minhash.py
- `dispatch_command()` --calls--> `to_html()`  [INFERRED]
  .agents/skills/graphify/cli.py → .agents/skills/graphify/exporters/html.py
- `dispatch_command()` --calls--> `_gh()`  [INFERRED]
  .agents/skills/graphify/cli.py → .agents/skills/graphify/prs.py
- `dispatch_command()` --calls--> `_load_graph()`  [INFERRED]
  .agents/skills/graphify/cli.py → .agents/skills/graphify/serve.py
>>>>>>> Stashed changes

## Import Cycles
- None detected.

<<<<<<< Updated upstream
## Communities (16 total, 4 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.08
Nodes (25): dotenv, express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, dotenv (+17 more)
=======
## Communities (259 total, 60 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.13
Nodes (15): express, @google/genai, @mediapipe/tasks-vision, dependencies, express, @google/genai, @mediapipe/tasks-vision, react (+7 more)
>>>>>>> Stashed changes

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 2 - "App.tsx"
Cohesion: 0.11
<<<<<<< Updated upstream
Nodes (25): App(), AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps (+17 more)
=======
Nodes (24): AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps, EditFieldModal() (+16 more)
>>>>>>> Stashed changes

### Community 3 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

<<<<<<< Updated upstream
### Community 4 - "Login.tsx"
Cohesion: 0.36
Nodes (7): Login(), LoginProps, Registration(), RegistrationProps, isSupabaseConfigured, supabase, Customer

### Community 5 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, start (+2 more)
=======
### Community 4 - "_read_text"
Cohesion: 0.02
Nodes (174): _get_c_func_name(), _import_js(), _import_lua(), _import_swift(), Emit module-level ``imports`` edges and report the imported modules. A Swift…, Get the name from a node using config.name_field, falling back to child types., Recursively unwrap declarator to find the innermost identifier (C)., Extract require('module') from Lua variable_declaration nodes. (+166 more)

### Community 5 - "sentenceEngine.ts"
Cohesion: 0.19
Nodes (18): App(), VideoPanelProps, clearIdleTimer(), DispatchReason, dispatchSentence(), getCurrentTokens(), initSentenceEngine(), isStopGesture() (+10 more)
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
Cohesion: 0.12
Nodes (28): KEY_LANDMARKS, VideoPanel(), clearBuffer(), dtwDistance(), euclideanDistance(), frameBuffer, GestureTemplate, getBufferFill() (+20 more)
=======
Cohesion: 0.17
Nodes (21): KEY_LANDMARKS, VideoPanel(), getBufferFill(), getTemplateCount(), getTemplateNames(), pushFrame(), closeHolisticLandmarker(), createWithGpuFallback() (+13 more)

### Community 16 - "_make_id"
Cohesion: 0.03
Nodes (126): extract_lazarus_package(), _import_java(), _import_php(), _import_scala(), Extract package metadata from Lazarus .lpk package files (XML format). .lpk is…, extract_apex(), Path, Apex extractor. Moved verbatim from graphify/extract.py. (+118 more)

### Community 17 - "extract.py"
Cohesion: 0.04
Nodes (122): _augment_js_reexport_edges(), _canonicalize_csharp_namespace_nodes(), _check_tree_sitter_version(), extract(), extract_vue(), _raise_recursion_limit(), Deterministic structural extraction from source code using tree-sitter. Outputs…, Collapse whitespace and truncate ``text`` to ``width`` chars for a rationale… (+114 more)

### Community 18 - "Path"
Cohesion: 0.02
Nodes (117): _augment_cpp_string_tests(), _emit_rescued_import(), extract_astro(), extract_c(), extract_cpp(), extract_csharp(), extract_csproj(), extract_groovy() (+109 more)

### Community 19 - "watch.py"
Cohesion: 0.05
Nodes (67): dedupe_edges(), dedupe_nodes(), Collapse nodes sharing an ``id``, last-writer-wins on attributes. Mirrors what…, Collapse exact parallel edges by ``(source, target, relation)``, keeping the…, community_member_sigs(), Per-community membership fingerprints: ``{cid: sha256(sorted member ids)}``.…, Remap community IDs to maximize overlap with a previous assignment. Uses greedy…, remap_communities_to_previous() (+59 more)

### Community 20 - "train_static_mlp.py"
Cohesion: 0.25
Nodes (7): build_model(), compute_weights(), load_data(), train_static_mlp.py -- Train an MLP classifier for static ISL hand poses (0-9,…, Load features and labels from CSV., Improved MLP architecture: Input(84) -> GaussianNoise(0.01) -> Dense(256) -> BN…, Compute class weights to handle imbalanced classes.

### Community 21 - "preprocess_static.py"
Cohesion: 0.40
Nodes (5): get_existing_classes(), process_dataset(), preprocess_static.py -- Extract 84-dim hand landmark features from static ISL…, Read existing CSV and return set of class labels already processed., Process dataset images to extract hand landmark features.
>>>>>>> Stashed changes

### Community 23 - "reflect.py"
Cohesion: 0.05
Nodes (71): _log_path(), log_query(), _log_responses(), nodes_from_result(), Any, Path, Query logging for graphify — append-only JSONL, fail-silent., Append one JSONL record to the query log. Never raises. (+63 more)

### Community 24 - "cli.py"
Cohesion: 0.06
Nodes (63): distinct_repo_tags(), prefix_graph_for_global(), prune_repo_from_graph(), Return a copy of G with all node IDs prefixed with repo_tag::. Labels are…, Return a unique, human-meaningful repo tag per input graph for merge-graphs.…, Remove all nodes tagged with repo_tag from G in-place. Returns count removed., _clone_repo(), _default_graph_path() (+55 more)

### Community 25 - "cache.py"
Cohesion: 0.06
Nodes (64): _absolutize_ids_in(), _absolutize_source_files_in(), _body_content(), cache_dir(), cached_files(), cached_word_count(), check_semantic_cache(), _cleanup_stale_ast_entries() (+56 more)

### Community 26 - "hooks.py"
Cohesion: 0.07
Nodes (51): _detached_launch(), _git_root(), _has_merge_attr(), _hooks_dir(), install(), _install_hook(), _load_graphifyrc(), _merge_attr_line() (+43 more)

### Community 27 - "export.py"
Cohesion: 0.06
Nodes (51): _node_community_map(), Invert communities dict: node_id -> community_id., attach_hyperedges(), _cap_filename(), _cypher_escape(), _cypher_label(), _dedup_node_filenames(), _git_head() (+43 more)

### Community 28 - "serve.py"
Cohesion: 0.08
Nodes (50): edge_datas(), Return every edge attribute dict for (u, v); always a list., Strip control characters and cap length. Safe for embedding in JSON data…, sanitize_label(), _bfs(), _community_header(), _complete_induced_edges(), _compute_idf() (+42 more)

### Community 29 - "dispatch_install_cli"
Cohesion: 0.08
Nodes (44): _agents_platform_uninstall(), _agents_uninstall(), _amp_uninstall(), claude_uninstall(), codebuddy_uninstall(), _cursor_uninstall(), _devin_rules_uninstall(), dispatch_install_cli() (+36 more)

### Community 30 - "symbol_resolution.py"
Cohesion: 0.09
Nodes (40): disambiguate_ambiguous_candidates(), _is_test_path(), _path_proximity_winner(), Classify a source path as a test path (case-insensitive, segment-aware). Shared…, Pick the candidate whose source file is closest to the call site.…, Resolve an ambiguous bare-name call to one candidate, or ``None``. Shared god-…, _bash_make_id(), build_label_index() (+32 more)

### Community 31 - "Obsidian Flavored Markdown Skill"
Cohesion: 0.05
Nodes (33): Basic Callout, Callouts Reference, Custom Callouts (CSS), Foldable Callouts, Nested Callouts, Supported Callout Types, Embed Audio, Embed Bases (+25 more)

### Community 32 - "analyze.py"
Cohesion: 0.11
Nodes (33): _cross_community_surprises(), _cross_file_surprises(), _cross_language(), _file_category(), find_import_cycles(), god_nodes(), graph_diff(), _is_concept_node() (+25 more)

### Community 33 - "_is_type_like_definition"
Cohesion: 0.07
Nodes (32): _is_top_level_function_definition(), _lang_family(), _lang_is_case_insensitive(), _merge_swift_extensions(), _node_label_key(), True when the file's language resolves identifiers case-insensitively (#1581)., Interop family of the file's language, or None when unknown/not code., A free/top-level function def (label ``name()``), not a method or type. Methods… (+24 more)

### Community 34 - "/graphify"
Cohesion: 0.06
Nodes (32): For always-on context in Devin sessions, For --cluster-only, For git commit hook, For /graphify add, For /graphify explain, For /graphify path, For /graphify query, For --update (incremental re-extraction) (+24 more)

### Community 35 - "prs.py"
Cohesion: 0.19
Nodes (28): _default_model_for_backend(), _get_backend_api_key(), Return the first configured API key for backend, or an empty string., Return configured model override or backend default model., bold(), _c(), _ci_icon(), _classify() (+20 more)

### Community 36 - "write_callflow_html"
Cohesion: 0.09
Nodes (30): CallflowOptions, classify_edges(), first_list(), html_comment_text(), infer_project_name(), load_graph(), load_labels(), load_report() (+22 more)

### Community 37 - "/graphify"
Cohesion: 0.06
Nodes (30): For --cluster-only, For git commit hook, For /graphify add, For /graphify explain, For /graphify path, For /graphify query, For native CLAUDE.md integration, For --update (incremental re-extraction) (+22 more)

### Community 38 - "sanitize_metadata"
Cohesion: 0.09
Nodes (27): _import_csharp(), _import_kotlin(), _bash_assignment_base(), _bash_source_suffix(), extract_bash(), Path, Bash extractor. Moved verbatim from graphify/extract.py., Extract functions, source imports, and cross-function calls from a .sh file. (+19 more)

### Community 39 - "extract_files_direct"
Cohesion: 0.11
Nodes (28): Read just this slice's characters from its parent file., read_slice_text(), _backend_supports_vision(), _bind_node_evidence(), _build_image_refs(), _dispatched_source_text(), _estimate_file_tokens(), extract_files_direct() (+20 more)

### Community 40 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 41 - "JSON Canvas Skill"
Cohesion: 0.07
Nodes (25): Flowchart, JSON Canvas Complete Examples, Project Board with Groups, Research Canvas with Files and Links, Simple Canvas with Text and Connections, 1. Create a New Canvas, 2. Add a Node to an Existing Canvas, 3. Connect Two Nodes (+17 more)

### Community 42 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Kilo-specific rules (+17 more)

### Community 43 - "paths.py"
Cohesion: 0.13
Nodes (23): edge_data(), Return one edge attribute dict for (u, v), tolerating MultiGraph. For…, _atomic_replace(), Path, Single source of truth for the graphify output-directory name. The output…, Atomically replace ``path`` with content written by ``write_fn(f)``. Writes a…, Largest filename stem an exporter may write directly into ``output_dir``.…, Atomically write ``text`` (UTF-8) to ``path``. See :func:`_atomic_replace`. (+15 more)

### Community 44 - "Path"
Cohesion: 0.15
Nodes (25): _antigravity_finalize(), _antigravity_install(), _canonical_platform(), _copy_skill_file(), _cursor_install(), _devin_rules_install(), gemini_install(), install() (+17 more)

### Community 45 - "scip_ingest.py"
Cohesion: 0.14
Nodes (24): _build_scip_metadata(), _coerce_str(), _emit_relationships(), _emit_symbol_node(), _first_occurrence_line(), ingest_scip_json(), _is_true(), _make_scip_node_id() (+16 more)

### Community 46 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 47 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 48 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 49 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 50 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 51 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 52 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 53 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 54 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 55 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 56 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 57 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 58 - "generate_section_flowchart"
Cohesion: 0.11
Nodes (24): generate_overview_graph(), generate_section_flowchart(), group_nodes_by_file(), mermaid_class_defs(), mermaid_init(), mermaid_section_id(), node_kind(), node_label() (+16 more)

### Community 59 - "detect.py"
Cohesion: 0.12
Nodes (23): _auto_follow_symlinks(), classify_file(), _env_command_args(), FileType, _is_graphable_source(), _looks_like_paper(), _match_anchored_ignore_pattern(), Match an anchored gitignore pattern without letting ``*`` cross ``/``. (+15 more)

### Community 60 - "_call_llm"
Cohesion: 0.10
Nodes (24): _anthropic_response_text(), _bedrock_inference_config(), _bedrock_response_text(), _call_claude_cli(), _call_llm(), _claude_cli_envelope(), _claude_cli_error(), _claude_cli_supports_json_schema() (+16 more)

### Community 61 - "_call_bedrock"
Cohesion: 0.13
Nodes (24): _azure_client(), _backend_pkg_hint(), _call_azure(), _call_bedrock(), _call_claude(), _call_openai_compat(), _extraction_system(), _parse_llm_json() (+16 more)

### Community 62 - "callflow_html.py"
Cohesion: 0.11
Nodes (22): build_community_index(), build_section_node_map(), _community_text(), derive_sections_from_communities(), detect_lang(), generate_header(), generate_nav(), _keyword_score() (+14 more)

### Community 63 - "diagnostics.py"
Cohesion: 0.19
Nodes (22): _canonical_edge(), _count_extra(), diagnose_extraction(), diagnose_file(), _edge_list(), _exact_signature(), format_diagnostic_json(), format_diagnostic_report() (+14 more)

### Community 64 - "ingest.py"
Cohesion: 0.16
Nodes (22): _detect_url_type(), _download_binary(), _fetch_arxiv(), _fetch_html(), _fetch_tweet(), _fetch_webpage(), _html_to_markdown(), ingest() (+14 more)

### Community 65 - "Path"
Cohesion: 0.15
Nodes (22): convert_office_file(), count_words(), docx_to_markdown(), extract_pdf_text(), _file_within_size_cap(), _md5_file(), _os_path(), Path (+14 more)

### Community 66 - "llm.py"
Cohesion: 0.13
Nodes (21): _community_label_lines(), detect_backend(), generate_community_labels(), _get_tokenizer(), label_communities(), _neutralise_injection_sentinels(), _ollama_host_is_link_local_or_metadata(), _placeholder_community_labels() (+13 more)

### Community 67 - "security.py"
Cohesion: 0.10
Nodes (19): _build_opener(), _max_graph_file_bytes(), Path, urllib handler that routes http:// through _SSRFGuardedHTTPConnection., urllib handler that routes https:// through _SSRFGuardedHTTPSConnection., Fetch *url* and return raw bytes. Protections applied: - URL scheme validated…, Fetch *url* and return decoded text (UTF-8, replacing bad bytes). Wraps…, Resolve *path* and verify it stays inside *base*. *base* defaults to the… (+11 more)

### Community 68 - "build_merge"
Cohesion: 0.16
Nodes (21): _abs_identity(), build_merge(), _build_prune_sets(), _derive_prune_root(), _infer_merge_root(), _is_ast_tier(), _load_existing_graph(), merge_raw_extraction() (+13 more)

### Community 69 - "Counter"
Cohesion: 0.12
Nodes (21): derive_flow_chain(), edge_score(), generate_overview_cards(), node_degree_scores(), node_importance(), preferred_edges(), Counter, Aggregate inter-section edge counts and relation names. (+13 more)

### Community 70 - "detect"
Cohesion: 0.13
Nodes (21): detect(), _find_vcs_root(), _git_info_exclude(), _git_tracked_path_keys(), ignored_predicate(), _is_regular_file(), _load_dir_own_ignore(), _load_graphifyignore() (+13 more)

### Community 71 - "file_slice.py"
Cohesion: 0.13
Nodes (20): _best_cut(), bisect_slice(), expand_oversized_files(), FileSlice, is_splittable_text(), Path, Intra-file slicing for oversized text documents (#1369). The extraction packer…, Replace each oversized splittable-text file with a list of ``FileSlice``s.… (+12 more)

### Community 72 - "pick_text"
Cohesion: 0.13
Nodes (20): _describe_node(), format_node_refs(), generate_call_table_rows(), generate_section_cards(), generate_section_intro(), is_zh(), pick_text(), Render node references as readable labels instead of internal IDs. (+12 more)

### Community 73 - "__main__.py"
Cohesion: 0.13
Nodes (19): _antigravity_uninstall(), _kilo_uninstall(), _kilo_uninstall_global(), _platform_skill_destination(), _print_banner(), Remove graphify Antigravity rules, workflow, and skill files., Remove Kilo always-on project wiring and global skill/command files., Amber brain banner on graphify install. TTY-only, never raises. (+11 more)

### Community 74 - "manifest_ingest.py"
Cohesion: 0.13
Nodes (17): _coerce_deps(), extract_package_manifest(), _parse_apm(), _parse_apm_fallback(), _parse_cargo(), _parse_pyproject(), _pep508_name(), _pkg_id() (+9 more)

### Community 75 - "mcp_ingest.py"
Cohesion: 0.17
Nodes (19): _add_edge(), _add_node(), _detect_package_from_args(), _emit_server(), extract_mcp_config(), is_mcp_config_path(), _make_id(), Any (+11 more)

### Community 76 - "build_from_json"
Cohesion: 0.13
Nodes (19): build(), build_from_json(), _coerce_hyperedge_member_refs(), _coerce_id(), _coerce_non_string_ids(), _doc_twin_remap(), _fold_edge_aliases(), _fold_node_aliases() (+11 more)

### Community 77 - "deduplicate_entities"
Cohesion: 0.18
Nodes (15): _crossfile_fileanchored_blocked(), deduplicate_entities(), _is_variant_pair(), _llm_tiebreak(), _numeric_tokens_differ(), _pick_winner(), Block label-based merging of file-anchored non-code nodes across files (#1284).…, Deduplicate near-identical entities in a knowledge graph. Args: nodes: list of… (+7 more)

### Community 78 - "CsharpNameResolver"
Cohesion: 0.18
Nodes (10): _build_csharp_type_def_index(), CsharpNameResolver, _metadata(), Path, Namespace/using/alias-aware C# simple-name resolution. Factored out of…, Return deterministic ``(namespace, name) -> node_id`` C# type definitions., Resolve a simple type name to a definition node id, with a verdict. Returns…, Re-point resolvable C# ``using`` import edges to canonical internal nodes.… (+2 more)

### Community 79 - "_install_claude_hook"
Cohesion: 0.16
Nodes (19): _claude_pretooluse_hooks(), _gemini_hook(), _install_claude_hook(), _install_codebuddy_hook(), _install_codex_hook(), _install_gemini_hook(), Return the absolute path to the graphify executable, with forward slashes.…, Add graphify PreToolUse hook to .codex/hooks.json. (+11 more)

### Community 80 - "dtwEngine.ts"
Cohesion: 0.13
Nodes (15): clearBuffer(), dtwCurrRow, dtwDistance(), dtwPrevRow, euclideanDistanceSq(), euclidScratch, GestureTemplate, getRingBufferSnapshot() (+7 more)

### Community 81 - "build.py"
Cohesion: 0.15
Nodes (16): deduplicate_by_label(), disambiguate_file_labels_in_nodes(), _disambiguate_file_node_labels(), _file_label_reassignments(), _norm_label(), Canonical dedup key — Unicode-aware, preserves CJK/word characters., Merge nodes that share a normalised label, rewriting edge references. Prefers…, Shortest trailing path suffix (basename + k parent dirs) of *sf* that is unique… (+8 more)

### Community 82 - "objc.py"
Cohesion: 0.14
Nodes (17): _import_c(), _cpp_declarator_name(), _cpp_local_var_types(), Return the bare variable name from a C++ declaration declarator, unwrapping…, Collect ``var -> ClassName`` from local variable declarations in a C++ function…, extract_objc(), _objc_category_base_stem(), _objc_is_category() (+9 more)

### Community 83 - "affected.py"
Cohesion: 0.26
Nodes (16): affected_nodes(), AffectedHit, _as_repo_relative(), _bare_name(), format_affected(), _format_location(), load_graph(), _node_label() (+8 more)

### Community 84 - "MinHash"
Cohesion: 0.16
Nodes (11): _lsh_integrate(), _mh_coeffs(), MinHash, MinHashLSH, _optimal_lsh_params(), ndarray, MinHash + band-LSH — datasketch-compatible drop-in (no scipy). datasketch.lsh…, MinHash sketch — same API as datasketch.MinHash for the subset used here. (+3 more)

### Community 85 - "transcribe.py"
Cohesion: 0.18
Nodes (16): Raise ValueError if *url* is not http or https, or targets a private/internal…, validate_url(), build_whisper_prompt(), download_audio(), _get_whisper(), _get_yt_dlp(), is_url(), _model_name() (+8 more)

### Community 86 - "cluster.py"
Cohesion: 0.22
Nodes (15): cluster(), cohesion_score(), label_communities_by_hub(), _partition(), Graph, Community detection on NetworkX graphs. Uses Leiden (graspologic) if available,…, Context manager to suppress stdout/stderr during library calls. graspologic's…, Run Leiden community detection. Returns {community_id: [node_ids]}. Community… (+7 more)

### Community 87 - "save_manifest"
Cohesion: 0.17
Nodes (15): detect_incremental(), load_manifest(), _mtime_may_hide_a_rewrite(), _nfc(), NFC-normalize a path string used as a manifest key. On macOS, ``os.walk`` /…, Return ``key`` as a forward-slash relative path from ``root``. Keys outside…, Inverse of :func:`_to_relative_for_storage`. Re-anchor a stored key against…, Load the manifest from a previous run. Returns {} on any error. When ``root``… (+7 more)

### Community 88 - "install.py"
Cohesion: 0.19
Nodes (15): _install_kilo_plugin(), _kilo_config_path(), _kilo_config_write_path(), _load_json_like(), graphify install/uninstall subsystem. The per-platform skill/hook installers…, Remove JSONC-style comments while leaving string content intact., Write automated Kilo edits to kilo.json so existing JSONC stays untouched., Write graphify.js plugin and register it without rewriting user JSONC. (+7 more)

### Community 89 - "semantic_cleanup.py"
Cohesion: 0.19
Nodes (14): _normalize_hyperedge_members(), Canonicalize a hyperedge's member list onto the `nodes` key, in place. If…, _append_rationale_attr(), _is_sentence_like_rationale_label(), load_validated_semantic_fragment(), Path, Load and validate a semantic chunk, rejecting oversize files before parsing.…, Clean up a semantic extraction fragment in-place. Operations: 1. Removes nodes… (+6 more)

### Community 90 - "_is_ignored"
Cohesion: 0.13
Nodes (15): _has_coverage_artifacts(), _has_venv_markers(), _is_ignored(), _is_noise_dir(), _is_scan_ignored(), _path_identity(), Portable comparison key for an existing filesystem path., Return True if the path should be ignored per .graphifyignore patterns. Uses… (+7 more)

### Community 91 - "google_workspace.py"
Cohesion: 0.24
Nodes (14): convert_google_workspace_file(), _extract_file_id_from_url(), _extract_resource_key(), Any, Path, Optional Google Workspace shortcut export support. Google Drive for desktop…, Export a Google Workspace shortcut to a Markdown sidecar. Returns the converted…, Extract a Drive file ID from common Google Docs/Drive URL shapes. (+6 more)

### Community 92 - "_ImageRef"
Cohesion: 0.17
Nodes (13): _anthropic_content(), _bedrock_content(), _image_notes(), _ImageRef, _openai_content(), A single image destined for a vision request. `raw` is None when the image is…, Return refs with pixel data dropped (for non-vision backends)., Text block listing the images so the model emits one node per image. Always… (+5 more)

### Community 93 - "default_graph_json"
Cohesion: 0.15
Nodes (13): default_graph_json(), Default ``graph.json`` path under the configured output dir. The package-wide…, _build_http_app(), _filter_blank_stdin(), _main(), _MCPASGIApp, Filter blank lines from stdin before MCP reads it. Some MCP clients (Claude…, Start the MCP server over stdio (the default, per-developer transport). (+5 more)

### Community 94 - "benchmark.py"
Cohesion: 0.20
Nodes (13): _estimate_tokens(), _hr(), print_benchmark(), Graph, _query_subgraph_tokens(), Token-reduction benchmark - measures how much context graphify saves vs naive…, Print a human-readable benchmark report., Return unicode_char if stdout can encode it, else ascii_fallback. Windows… (+5 more)

### Community 95 - "make_id"
Cohesion: 0.20
Nodes (13): graph_has_legacy_ids(), _has_global_id(), _old_file_stems(), Pre-migration stem forms a semantic fragment may have used for ``rel``. Ordered…, Re-derive non-AST node ids from ``source_file`` using the canonical full-path…, Whether ``node``'s ID is global by construction rather than file-derived., Whether a loaded graph still uses pre-#1504 node IDs (parent-dir / filename…, _semantic_id_remap() (+5 more)

### Community 96 - "_run_hook_guard"
Cohesion: 0.18
Nodes (14): _hook_strict_enabled(), _is_cwd_relative(), _mark_session_denied(), _query_stamp_fresh(), Resolve strict mode: GRAPHIFY_HOOK_STRICT env overrides the baked-in flag…, True if a query/explain/path ran within GRAPHIFY_HOOK_STRICT_TTL (default…, Atomically claim a one-time strict block for this session. Returns True only on…, Shell-agnostic PreToolUse guard (#522). Reads the tool-call JSON from stdin… (+6 more)

### Community 97 - "dedup.py"
Cohesion: 0.17
Nodes (12): _is_code(), _make_minhash(), _merge_missing_attributes(), Entity deduplication pipeline for graphify knowledge graphs. Pipeline: exact…, True for AST-extracted code symbols. Code-node identity is the node ID (which…, True when exact-ID records came from the same source file. Exact IDs can also…, Fill the survivor's absent/None attributes from a same-source duplicate,…, Return k-gram character shingles of text. (+4 more)

### Community 98 - "_always_on"
Cohesion: 0.18
Nodes (13): _always_on(), claude_install(), codebuddy_install(), _install_skill_references(), Atomically install a packaged references/ sidecar next to SKILL.md. Stages the…, Write the graphify section to the local CLAUDE.md., Install the graphify skill and CODEBUDDY.md section for CodeBuddy., Read a packaged always-on instruction block from graphify/always_on/. The six… (+5 more)

### Community 99 - "_extract_with_adaptive_retry"
Cohesion: 0.17
Nodes (13): _chunk_partial_files(), _extract_with_adaptive_retry(), _looks_like_context_exceeded(), _looks_like_timeout(), _mark_partial(), _merged_partial_files(), Heuristically classify an exception as a context-window overflow. Different…, Classify an exception as a recognized subprocess or SDK timeout. (+5 more)

### Community 100 - "_build_server"
Cohesion: 0.21
Nodes (13): _detect_default_branch(), fetch_prs(), fetch_worktrees(), format_prs_text(), _gh(), _parse_ci(), Auto-detect the repo's default branch via gh, then git, then fall back to…, Plain-text PR summary for MCP output (no ANSI). (+5 more)

### Community 101 - "verilog.py"
Cohesion: 0.24
Nodes (10): _augment_systemverilog_semantics(), extract_verilog(), Path, Verilog extractor. Moved verbatim from graphify/extract.py., First `simple_identifier` under node in pre-order, or None. tree-sitter-verilog…, Extract modules, functions, tasks, package imports, instantiations, and…, _sv_collect_type_refs(), _sv_first_identifier() (+2 more)

### Community 102 - "_agents_install"
Cohesion: 0.17
Nodes (12): _agents_install(), _agents_platform_install(), _amp_install(), _amp_legacy_cleanup(), _install_opencode_plugin(), _kilo_install(), Write graphify.js plugin and register it in opencode.json., Write the graphify section to the local AGENTS.md for always-on platforms. (+4 more)

### Community 103 - "_ip_is_blocked"
Cohesion: 0.17
Nodes (10): _ip_is_blocked(), Resolve *host* once and return (family, validated_ip) for the first address…, HTTPConnection that resolves + validates DNS once, then connects to the exact…, HTTPSConnection variant of _SSRFGuardedHTTPConnection. Connects to the…, Return True if *ip* falls in a private/reserved/internal range. Shared by…, _resolve_and_validate(), _SSRFGuardedHTTPConnection, _SSRFGuardedHTTPSConnection (+2 more)

### Community 104 - "attach_graph_impact"
Cohesion: 0.20
Nodes (11): attach_graph_impact(), build_community_labels(), compute_pr_impact(), fetch_pr_files(), _load_graph_json(), _path_match(), Path, True if graph_src and pr_file refer to the same file (path-boundary safe). (+3 more)

### Community 105 - "resolver_registry.py"
Cohesion: 0.24
Nodes (10): LanguageResolver, Path, Registry for cross-file, language-specific resolution passes. Some…, One cross-file, language-specific resolution pass. ``resolve`` has the…, Append a resolver to the global registry and return it (for inline use)., Return a copy of the registered resolvers, in registration order., Run every resolver whose suffix appears in ``paths``. Behaviorally identical to…, register() (+2 more)

### Community 106 - "_norm"
Cohesion: 0.20
Nodes (10): _defines_id(), _entropy(), _id_prefixes(), _norm(), Lowercase + collapse non-alphanumeric runs to space (Unicode-aware)., The ID prefixes a node extracted from ``source_file`` may legitimately mint. An…, True when the node's own source_file is the file its ID encodes. A doc that…, Shannon entropy in bits/char of the normalised label. (+2 more)

### Community 107 - "tree_html.py"
Cohesion: 0.38
Nodes (9): build_tree(), _common_root(), emit_html(), _make_truncation_leaf(), Any, Path, tree_html — emit a D3 v7 collapsible-tree HTML view of a graph. A self-…, Build a ``{name, total_count, children}`` hierarchy. Each leaf is either a code… (+1 more)

### Community 108 - "Obsidian CLI"
Cohesion: 0.20
Nodes (9): Additional developer commands, Command reference, Common patterns, Develop/test cycle, File targeting, Obsidian CLI, Plugin development, Syntax (+1 more)

### Community 109 - "Login.tsx"
Cohesion: 0.36
Nodes (7): Login(), LoginProps, Registration(), RegistrationProps, isSupabaseConfigured, supabase, Customer

### Community 110 - "_GraphContextCache"
Cohesion: 0.25
Nodes (6): _communities_from_graph(), _GraphContextCache, Thread-safe graph contexts: one pinned default plus an LRU of projects., Build one entry for an already-resolved path and known file key.…, Return a fresh context, retaining project contexts by LRU order.…, Reconstruct community dict from community property stored on nodes.

### Community 111 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 112 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 113 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 114 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 115 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 116 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 117 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 118 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 119 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 120 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 121 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 122 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 123 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 124 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 125 - "first_present"
Cohesion: 0.29
Nodes (8): endpoint_id(), first_present(), normalize_edge(), normalize_node(), Return the first non-empty value for any candidate key., Normalize edge endpoints that may be strings or node-like objects., Normalize a graphify node across common graph.json schema variants., Normalize graphify edges while preserving original fields.

### Community 126 - "introspect_cargo"
Cohesion: 0.46
Nodes (7): introspect_cargo(), _load_toml(), _member_manifest_paths(), Any, Path, Cargo manifest introspection for workspace-internal crate dependencies., Return crate nodes and internal dependency edges from Cargo manifests.

### Community 127 - "_is_sensitive"
Cohesion: 0.25
Nodes (8): _generic_keyword_hit(), _is_env_template(), _is_prose_note(), _is_sensitive(), True for `.env.example` / `.envrc.sample` style committed templates (#2184)., A prose/note file (.md/.rst/...) whose stem is a multi-word topic slug is…, True if a generic secret keyword appears load-bearing in the filename. Secret-…, Return True if this file likely contains secrets and should be skipped.

### Community 128 - "Migrating a language extractor out of extract.py"
Cohesion: 0.25
Nodes (7): Helper classification, Invariants (non-negotiable), Migrating a language extractor out of extract.py, Pre-flight, Status, Steps, What NOT to do

### Community 129 - "_collision_rank"
Cohesion: 0.33
Nodes (7): _collision_rank(), _lifecycle_penalty(), Path, _rank_path(), 0 for active/in-progress paths, 2 for archived/done paths, 1 otherwise. Judged…, The root-relative form of ``source_file`` used for collision ranking. Mirrors…, A total order for choosing the survivor of an ID collision, independent of the…

### Community 130 - "_query_terms"
Cohesion: 0.29
Nodes (7): _has_chinese(), _is_searchable(), _query_terms(), Segment Chinese text and keep the original term for exact matching., True if term is Chinese, non-English, or an English word longer than 2 chars., Split a query into searchable terms, segmenting Chinese text, then drop…, _segment_chinese()

### Community 131 - "normalize_sections"
Cohesion: 0.33
Nodes (6): html_anchor_id(), normalize_communities(), normalize_sections(), Generate a stable, unique HTML anchor ID., Normalize section community lists from JSON or simple strings., Ensure sections have safe unique IDs and an overview section first.

### Community 132 - "humanize_label"
Cohesion: 0.33
Nodes (6): humanize_label(), node_display_name(), Readable node label for tables and summaries., Truncate without splitting Mermaid syntax., Convert graph labels into short labels people can scan in a diagram., truncate_text()

### Community 133 - "_kotlin_package_index"
Cohesion: 0.33
Nodes (6): _kotlin_package_index(), Group per-file results by the Kotlin package they declare. ``kotlin_package``…, Rewrite Kotlin ``imports`` edge targets from the bare last segment to the node…, Resolve Kotlin fully-qualified call expressions (#2550).…, _resolve_kotlin_import_targets(), _resolve_kotlin_qualified_calls()

### Community 134 - "_label_batch_with_retry"
Cohesion: 0.33
Nodes (6): _label_batch_with_retry(), _parse_label_response(), Parse the backend's JSON ``{cid: name}`` reply. Raises on non-JSON or a non-…, Label a batch of communities, splitting in half and retrying on parse failure.…, Honour GRAPHIFY_MAX_OUTPUT_TOKENS env var override, else use backend default., _resolve_max_tokens()

### Community 135 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 136 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 137 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 138 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 139 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 140 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 141 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 142 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 143 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 144 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 145 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 146 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 147 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 148 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 149 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, start

### Community 150 - "pascal_resolution.py"
Cohesion: 0.50
Nodes (4): _pascal_raw_calls(), Cross-file resolution for Pascal/Delphi calls to inherited methods. The per-…, Resolve Pascal/Delphi calls to a method inherited across file boundaries.…, resolve_pascal_inherited_calls()

### Community 151 - "introspect_postgres"
Cohesion: 0.50
Nodes (4): introspect_postgres(), _quote_ident(), Connect to PostgreSQL, reconstruct DDL, and extract via extract_sql()., Double-quote a PostgreSQL identifier, escaping embedded double-quotes.

### Community 152 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 153 - "_content_token_swap"
Cohesion: 0.50
Nodes (4): _content_token_swap(), True when tokens x and y read as one word misspelt, not two words (#2576). A…, True when two equal-token-count labels differ in at least one swapped content…, _same_word_variant()

### Community 154 - "_format_backend_env_keys"
Cohesion: 0.50
Nodes (4): _backend_env_keys(), _format_backend_env_keys(), Return accepted API-key environment variables for a backend., Return user-facing accepted API-key variable names.

### Community 156 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 157 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 158 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 159 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 160 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 161 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 162 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 163 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 164 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 165 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 166 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 167 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 168 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 169 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 170 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 171 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 172 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 173 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 174 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 175 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 176 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 177 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 178 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 179 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 180 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 181 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 182 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 183 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 184 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 185 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 186 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 187 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 188 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 189 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 190 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration (Trae), graphify reference: commit hook and native AGENTS.md integration

### Community 191 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 192 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 193 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 194 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 195 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 196 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 197 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 198 - "PhrasedSentence"
Cohesion: 0.67
Nodes (3): PhrasedSentenceStrip(), PhrasedSentenceStripProps, PhrasedSentence

### Community 201 - "_QueryScores"
Cohesion: 0.67
Nodes (3): _QueryScores, Per-query scoring result, returned by the private `_score_query` helper.…, NamedTuple

## Knowledge Gaps
<<<<<<< Updated upstream
- **81 isolated node(s):** `TEMPLATES_DIR`, `name`, `private`, `version`, `type` (+76 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
=======
- **790 isolated node(s):** `TEMPLATES_DIR`, `phraseCache`, `name`, `private`, `version` (+785 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
>>>>>>> Stashed changes

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

<<<<<<< Updated upstream
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `VideoPanel()` connect `VideoPanel.tsx` to `App.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `TEMPLATES_DIR`, `name`, `private` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
=======
- **Why does `dispatch_command()` connect `cli.py` to `extract.py`, `watch.py`, `introspect_postgres`, `reflect.py`, `cache.py`, `hooks.py`, `export.py`, `serve.py`, `_format_backend_env_keys`, `analyze.py`, `prs.py`, `write_callflow_html`, `paths.py`, `_call_bedrock`, `diagnostics.py`, `ingest.py`, `llm.py`, `build_merge`, `detect`, `file_slice.py`, `__main__.py`, `build_from_json`, `build.py`, `affected.py`, `cluster.py`, `save_manifest`, `semantic_cleanup.py`, `benchmark.py`, `make_id`, `_run_hook_guard`, `_build_server`, `tree_html.py`, `introspect_cargo`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `_file_stem()` connect `_make_id` to `_read_text`, `verilog.py`, `sanitize_metadata`, `mcp_ingest.py`, `build_from_json`, `build.py`, `Path`, `extract.py`, `objc.py`, `symbol_resolution.py`, `make_id`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `extract()` connect `extract.py` to `_is_type_like_definition`, `resolver_registry.py`, `CsharpNameResolver`, `_make_id`, `Path`, `watch.py`, `cli.py`, `cache.py`, `symbol_resolution.py`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `dispatch_command()` (e.g. with `to_html()` and `_file_hash()`) actually correct?**
  _`dispatch_command()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEMPLATES_DIR`, `phraseCache`, `name` to the rest of the system?**
  _790 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
>>>>>>> Stashed changes
