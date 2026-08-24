# Graph Report - SIH_ISL_2026  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2707 nodes · 5987 edges · 173 communities (125 shown, 48 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `853dc1be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- _read_text
- cli.py
- watch.py
- _file_stem
- extract.py
- Path
- cache.py
- reflect.py
- Path
- analyze.py
- build.py
- serve.py
- _extract_generic
- dispatch_install_cli
- symbol_resolution.py
- llm.py
- hooks.py
- VideoPanel.tsx
- export.py
- extract_files_direct
- App.tsx
- write_callflow_html
- Path
- GeminiKeyPool
- __main__.py
- _call_claude_cli
- build_merge
- prs.py
- extract_holistic_features
- make_id
- _call_llm
- pascal.py
- install.py
- scip_ingest.py
- generate_section_flowchart
- detect.py
- CsharpNameResolver
- callflow_html.py
- diagnostics.py
- ingest.py
- Path
- html.py
- compilerOptions
- benchmark.py
- Counter
- detect
- extract_xaml
- security.py
- dependencies
- pick_text
- manifest_ingest.py
- _key
- objc.py
- multigraph_compat.py
- affected.py
- MinHash
- cluster.py
- save_manifest
- _is_ignored
- sentenceEngine.ts
- semantic_cleanup.py
- dedup.py
- dm.py
- google_workspace.py
- _ImageRef
- default_graph_json
- transcribe.py
- devDependencies
- deduplicate_entities
- wiki.py
- graphify CLI tool
- markdown.py
- _always_on
- _build_server
- dtwWorker.ts
- verilog.py
- _NoFileRedirectHandler
- graphify (OpenCode)
- bash.py
- file_slice.py
- attach_graph_impact
- resolver_registry.py
- package.json
- _norm
- _load_graph
- SignKYC — Bank Official Console
- Login.tsx
- PhrasedSentenceStrip.tsx
- normalize_id
- Graphify Pipeline
- dependencies
- first_present
- introspect_cargo
- _is_sensitive
- Obsidian Flavored Markdown Skill
- _collision_rank
- extract_sql
- sanitize_metadata
- detect_incremental
- mem0-memory/package.json
- normalize_sections
- humanize_label
- _kotlin_package_index
- _platform_skill_destination
- index.mjs
- _StageTimer
- _UF
- extract_blade
- commonlisp.py
- sln.py
- extract_terraform
- _looks_like_context_exceeded
- pascal_resolution.py
- introspect_postgres
- _resolve_lua_import_target
- _php_name_text
- _python_param_names
- _uninstall_claude_hook
- _ApiKeyMiddleware
- graphify skill-agents
- graphify.ingest
- update_config.cjs
- graphify/__init__.py
- Graphify Skill Definition
- graphify.serve
- Incremental Update
- vercel.json
- _remap_hyperedge_members
- _get_c_func_name
- _csharp_classify_base
- _js_dispatch_value_idents
- _kotlin_property_type_node
- _swift_classify_base
- _swift_property_type_node
- _php_fqn_from_raw
- Transcription Pipeline
- react
- graphify save-result
- reflect
- graphify.transcribe
- react-dom
- Constrained Query Expansion
- Video/Audio Transcription Flow
- Extractor Migration Playbook
- graphify (Generic)
- graphify (Pi)
- graphify (Trae)
- graphify (VSCode)
- Git Hooks and Agent Integration
- Graphify Workflow
- FastDTW
- 106-dim Feature Vector
- graph_diff
- _stamped_manifest_files
- save_manifest
- graphify.serve
- ISL DTW README
- MediaPipe Holistic
- Customer Side Modal
- Extraction Subagent Prompt (AMP)
- GitHub Clone and Cross-Repo Merge (AMP)
- Commit Hook and AGENTS.md Integration (AMP)
- Extraction Spec Reference
- GitHub and Merge Reference
- Commit Hook and CLAUDE.md Integration (Claude)
- Extraction Subagent Prompt Compact (Claw)
- Hooks Reference
- Graph Exports

## God Nodes (most connected - your core abstractions)
1. `_read_text()` - 122 edges
2. `dispatch_command()` - 115 edges
3. `_make_id()` - 112 edges
4. `_file_stem()` - 75 edges
5. `_rebuild_code()` - 54 edges
6. `_extract_generic()` - 40 edges
7. `extract()` - 37 edges
8. `dispatch_install_cli()` - 35 edges
9. `write_callflow_html()` - 32 edges
10. `_collect_js_symbol_resolution_facts()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Transcribe Video and Audio (AMP)` --calls--> `transcribe_all`  [EXTRACTED]
  .agents/skills/graphify/skills/amp/references/transcribe.md → graphify/transcribe.py
- `Incremental Update and Cluster-Only (AMP)` --calls--> `build_merge`  [EXTRACTED]
  .agents/skills/graphify/skills/amp/references/update.md → graphify/build.py
- `Incremental Update and Cluster-Only (AMP)` --calls--> `detect_incremental`  [EXTRACTED]
  .agents/skills/graphify/skills/amp/references/update.md → graphify/detect.py
- `Video Panel` --shares_data_with--> `Sentence Engine`  [INFERRED]
  README.md → needToDone.md
- `_extract_generic()` --uses--> `LanguageConfig`  [INFERRED]
  .agents/skills/graphify/extractors/engine.py → .agents/skills/graphify/extractors/models.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **AI Recognition Pipeline** — readme_videopanel, needtodone_sentenceengine, needtodone_gemini_api [EXTRACTED 0.90]
- **Graphify Core Pipeline** — agents_skills_graphify_skill, agents_skills_graphify_skills_agents_references_extraction_spec, agents_skills_graphify_skills_agents_references_update [EXTRACTED 0.90]
- **Graphify Maintenance & Automation** — skills_droid_references_update_incremental_update, skills_kilo_references_hooks_git_integration, skills_kilo_references_github_and_merge_cross_repo_merge [EXTRACTED 0.90]
- **Obsidian Ecosystem Skills** — agents_skills_json_canvas_skill, agents_skills_obsidian_cli_skill, agents_skills_obsidian_markdown_skill [EXTRACTED 0.90]
- **KYC Workflow Loop** — readme_videopanel, readme_aiassistpanel, readme_kycprogressstrip, needtodone_auditmodal [EXTRACTED 0.95]
- **Graphify Agent Skill Implementations** — agents_skills_graphify_skill_copilot, agents_skills_graphify_skill_devin, agents_skills_graphify_skill_droid, agents_skills_graphify_skill_kilo, agents_skills_graphify_skill_kiro [EXTRACTED 1.00]
- **Graphify Always-On Instructions** — agents_skills_graphify_always_on_agents_md, agents_skills_graphify_always_on_antigravity_rules, agents_skills_graphify_always_on_claude_md, agents_skills_graphify_always_on_gemini_md, agents_skills_graphify_always_on_kiro_steering, agents_skills_graphify_always_on_vscode_instructions [EXTRACTED 1.00]
- **Graphify Pipeline Components** — graphify_detect, agents_skills_graphify_extract, agents_skills_graphify_build, agents_skills_graphify_cluster, graphify_analyze, graphify_report, graphify_export, graphify_cache, graphify_diagnostics, graphify_cli [EXTRACTED 1.00]
- **Graphify Skill Reference Set** — skills_claude_references_add_watch, skills_claude_references_exports, skills_claude_references_extraction_spec, skills_claude_references_github_and_merge, skills_claude_references_query, skills_claude_references_transcribe, skills_claude_references_update [EXTRACTED 1.00]
- **Graphify Skill Set (AMP)** — skills_amp_references_add_watch, skills_amp_references_exports, skills_amp_references_extraction_spec, skills_amp_references_github_and_merge, skills_amp_references_hooks, skills_amp_references_query, skills_amp_references_transcribe, skills_amp_references_update [EXTRACTED 1.00]
- **Graphify Skill Platform Variants** — agents_skills_graphify_skill_agents, agents_skills_graphify_skill_aider, agents_skills_graphify_skill_amp, agents_skills_graphify_skill_claw, agents_skills_graphify_skill_codex [EXTRACTED 1.00]
- **Incremental Update Flow** — graphify_detect_detect_incremental, graphify_build_build_merge, graphify_detect_save_manifest [EXTRACTED 1.00]
- **Query Feedback Loop** — graphify_save_result, graphify_reflect, graphify_detect_detect_incremental [INFERRED 0.85]
- **Graphify Platform Variants** — agents_skills_graphify_skill_opencode_graphify, agents_skills_graphify_skill_pi_graphify, agents_skills_graphify_skill_trae_graphify, agents_skills_graphify_skill_vscode_graphify, agents_skills_graphify_skill_windows_graphify, agents_skills_graphify_skill_graphify [INFERRED 0.90]

## Communities (173 total, 48 thin omitted)

### Community 0 - "_read_text"
Cohesion: 0.02
Nodes (151): _import_c(), _import_csharp(), _import_java(), _import_js(), _import_kotlin(), _import_php(), _import_scala(), _import_swift() (+143 more)

### Community 1 - "cli.py"
Cohesion: 0.04
Nodes (87): print_benchmark(), Print a human-readable benchmark report., distinct_repo_tags(), prune_repo_from_graph(), Return a unique, human-meaningful repo tag per input graph for merge-graphs.…, Remove all nodes tagged with repo_tag from G in-place. Returns count removed., _clone_repo(), _default_graph_path() (+79 more)

### Community 2 - "watch.py"
Cohesion: 0.05
Nodes (71): dedupe_edges(), dedupe_nodes(), _is_ast_tier(), AST vs semantic tier. _origin wins when present; unstamped legacy items…, Collapse nodes sharing an ``id``, last-writer-wins on attributes. Mirrors what…, Collapse exact parallel edges by ``(source, target, relation)``, keeping the…, community_member_sigs(), Per-community membership fingerprints: ``{cid: sha256(sorted member ids)}``.… (+63 more)

### Community 3 - "_file_stem"
Cohesion: 0.05
Nodes (56): extract_apex(), Path, Apex extractor. Moved verbatim from graphify/extract.py., Extract classes, interfaces, enums, methods, and Salesforce constructs from…, _file_stem(), Path, Stem used as the node-ID prefix for a file and its symbols. The full path…, extract_dart() (+48 more)

### Community 4 - "extract.py"
Cohesion: 0.07
Nodes (65): _augment_js_reexport_edges(), _import_python(), Deterministic structural extraction from source code using tree-sitter. Outputs…, Collapse whitespace and truncate ``text`` to ``width`` chars for a rationale…, Compatibility wrapper for the JS/TS symbol-resolution post-pass., Get the name from a node using config.name_field, falling back to child types., _resolve_name(), _shorten_rationale_label() (+57 more)

### Community 5 - "Path"
Cohesion: 0.05
Nodes (66): _augment_cpp_string_tests(), _canonicalize_csharp_namespace_nodes(), _check_tree_sitter_version(), extract(), extract_cpp(), extract_csharp(), extract_groovy(), extract_js() (+58 more)

### Community 6 - "cache.py"
Cohesion: 0.06
Nodes (64): _absolutize_ids_in(), _absolutize_source_files_in(), _body_content(), cache_dir(), cached_files(), cached_word_count(), check_semantic_cache(), _cleanup_stale_ast_entries() (+56 more)

### Community 7 - "reflect.py"
Cohesion: 0.06
Nodes (63): _log_path(), log_query(), _log_responses(), nodes_from_result(), Any, Path, Query logging for graphify — append-only JSONL, fail-silent., Append one JSONL record to the query log. Never raises. (+55 more)

### Community 8 - "Path"
Cohesion: 0.06
Nodes (52): _emit_rescued_import(), extract_astro(), extract_svelte(), extract_vue(), Recover ``import('…')`` edges the AST pass does not emit for plain JS/TS. tree-…, Resolve a regex-rescued import specifier the way ``_import_js`` does. Returns…, Shared edge/stub emit for the Svelte/Astro/Vue regex-rescue import passes.…, Extract imports from .svelte files: script-block via JS AST + template regex… (+44 more)

### Community 9 - "analyze.py"
Cohesion: 0.08
Nodes (45): _cross_community_surprises(), _cross_file_surprises(), _cross_language(), _file_category(), find_import_cycles(), god_nodes(), graph_diff(), _is_concept_node() (+37 more)

### Community 10 - "build.py"
Cohesion: 0.07
Nodes (43): build(), build_from_json(), _coerce_hyperedge_member_refs(), _coerce_id(), _coerce_non_string_ids(), deduplicate_by_label(), disambiguate_file_labels_in_nodes(), _disambiguate_file_node_labels() (+35 more)

### Community 11 - "serve.py"
Cohesion: 0.09
Nodes (42): Strip control characters and cap length. Safe for embedding in JSON data…, sanitize_label(), _bfs(), _community_header(), _complete_induced_edges(), _compute_idf(), _cut_lines_to_budget(), _dfs() (+34 more)

### Community 12 - "_extract_generic"
Cohesion: 0.05
Nodes (42): extract_c(), extract_java(), extract_kotlin(), extract_lua(), extract_php(), extract_python(), _extract_python_rationale(), extract_ruby() (+34 more)

### Community 13 - "dispatch_install_cli"
Cohesion: 0.09
Nodes (41): _agents_platform_uninstall(), _agents_uninstall(), _amp_uninstall(), _antigravity_uninstall(), claude_uninstall(), codebuddy_uninstall(), _cursor_uninstall(), dispatch_install_cli() (+33 more)

### Community 14 - "symbol_resolution.py"
Cohesion: 0.09
Nodes (40): disambiguate_ambiguous_candidates(), _is_test_path(), _path_proximity_winner(), Classify a source path as a test path (case-insensitive, segment-aware). Shared…, Pick the candidate whose source file is closest to the call site.…, Resolve an ambiguous bare-name call to one candidate, or ``None``. Shared god-…, _bash_make_id(), build_label_index() (+32 more)

### Community 15 - "llm.py"
Cohesion: 0.07
Nodes (37): _backend_supports_vision(), _community_label_lines(), detect_backend(), generate_community_labels(), _get_tokenizer(), _label_batch_with_retry(), label_communities(), _label_identifiers() (+29 more)

### Community 16 - "hooks.py"
Cohesion: 0.11
Nodes (36): _detached_launch(), _git_root(), _has_merge_attr(), _hooks_dir(), install(), _install_hook(), _load_graphifyrc(), _merge_attr_line() (+28 more)

### Community 17 - "VideoPanel.tsx"
Cohesion: 0.11
Nodes (32): TemplateRecorderModal(), TemplateRecorderModalProps, KEY_LANDMARKS, VideoPanel(), cachedTemplateNames, clearBuffer(), encodeNpy(), FEATURE_DIM (+24 more)

### Community 18 - "export.py"
Cohesion: 0.09
Nodes (35): _cap_filename(), _cypher_escape(), _cypher_label(), _dedup_node_filenames(), existing_graph_node_count(), _git_head(), _obsidian_safe_stem(), _obsidian_tag() (+27 more)

### Community 19 - "extract_files_direct"
Cohesion: 0.10
Nodes (36): bisect_slice(), FileSlice, Read just this slice's characters from its parent file., Split a slice into two halves at a newline near its midpoint, or None. Used by…, A contiguous ``[start, end)`` character range of a splittable text file.…, The on-disk path a unit belongs to (the parent file for a slice)., read_slice_text(), unit_path() (+28 more)

### Community 20 - "App.tsx"
Cohesion: 0.12
Nodes (23): AppView, AIAssistPanel(), AIAssistPanelProps, AuditModal(), AuditModalProps, CustomerSideModal(), CustomerSideModalProps, EditFieldModal() (+15 more)

### Community 21 - "write_callflow_html"
Cohesion: 0.09
Nodes (30): build_section_node_map(), CallflowOptions, classify_edges(), first_list(), html_comment_text(), infer_project_name(), load_graph(), load_labels() (+22 more)

### Community 22 - "Path"
Cohesion: 0.12
Nodes (31): _agents_install(), _agents_platform_install(), _amp_install(), _canonical_platform(), _copy_skill_file(), _cursor_install(), _devin_rules_install(), gemini_install() (+23 more)

### Community 23 - "GeminiKeyPool"
Cohesion: 0.10
Nodes (9): buildPhraseCacheKey(), CacheEntry, GeminiKeyPool, geminiPool, GenerateOptions, KeyState, LRUCache, app (+1 more)

### Community 24 - "__main__.py"
Cohesion: 0.09
Nodes (29): _amp_legacy_cleanup(), _devin_rules_uninstall(), _install_kilo_plugin(), _kilo_config_path(), _kilo_config_write_path(), _load_json_like(), _print_banner(), Remove .windsurf/rules/graphify.md. (+21 more)

### Community 25 - "_call_claude_cli"
Cohesion: 0.10
Nodes (30): _azure_client(), _backend_pkg_hint(), _call_azure(), _call_bedrock(), _call_claude(), _call_claude_cli(), _call_openai_compat(), _claude_cli_supports_json_schema() (+22 more)

### Community 26 - "build_merge"
Cohesion: 0.11
Nodes (29): _abs_identity(), build_merge(), _build_prune_sets(), _derive_prune_root(), graph_has_legacy_ids(), _has_global_id(), _infer_merge_root(), _load_existing_graph() (+21 more)

### Community 27 - "prs.py"
Cohesion: 0.23
Nodes (24): bold(), _c(), _ci_icon(), _classify(), cmd_prs(), cyan(), dim(), green() (+16 more)

### Community 28 - "extract_holistic_features"
Cohesion: 0.14
Nodes (24): compute_dtw_distance(), load_templates(), ndarray, Load all .npy files in TEMPLATES_DIR. Groups them into a dictionary by gesture…, Compute DTW distance between two feature sequences., run_pipeline(), draw_overlay(), main() (+16 more)

### Community 29 - "make_id"
Cohesion: 0.13
Nodes (24): _extract_spock_fallback(), Regex-based fallback for Spock spec files where tree-sitter-groovy cannot parse…, make_id(), Single source of truth for node-ID normalization. Three independent producers…, Build a canonical node ID from one or more name parts. Parts are joined with…, _add_edge(), _add_node(), _detect_package_from_args() (+16 more)

### Community 30 - "_call_llm"
Cohesion: 0.09
Nodes (26): _anthropic_response_text(), _backend_env_keys(), _bedrock_inference_config(), _bedrock_response_text(), _call_llm(), _claude_cli_envelope(), _claude_cli_error(), _default_model_for_backend() (+18 more)

### Community 31 - "pascal.py"
Cohesion: 0.13
Nodes (24): extract_pascal(), _extract_pascal_regex(), _pascal_find_body(), _pascal_split_bases(), _pascal_split_sections(), _pascal_split_uses(), _pascal_strip_comments(), Path (+16 more)

### Community 32 - "install.py"
Cohesion: 0.15
Nodes (24): _claude_pretooluse_hooks(), _gemini_hook(), _install_claude_hook(), _install_codebuddy_hook(), _install_codex_hook(), _install_gemini_hook(), _kilo_uninstall(), _kilo_uninstall_global() (+16 more)

### Community 33 - "scip_ingest.py"
Cohesion: 0.14
Nodes (24): _build_scip_metadata(), _coerce_str(), _emit_relationships(), _emit_symbol_node(), _first_occurrence_line(), ingest_scip_json(), _is_true(), _make_scip_node_id() (+16 more)

### Community 34 - "generate_section_flowchart"
Cohesion: 0.11
Nodes (24): generate_overview_graph(), generate_section_flowchart(), group_nodes_by_file(), mermaid_class_defs(), mermaid_init(), mermaid_section_id(), node_kind(), node_label() (+16 more)

### Community 35 - "detect.py"
Cohesion: 0.12
Nodes (23): classify_file(), _env_command_args(), FileType, _is_graphable_source(), _looks_like_paper(), _match_anchored_ignore_pattern(), Match an anchored gitignore pattern without letting ``*`` cross ``/``., # NOTE: aws_credentials/gcloud_credentials/service_account moved to the (+15 more)

### Community 36 - "CsharpNameResolver"
Cohesion: 0.16
Nodes (14): _build_csharp_type_def_index(), CsharpNameResolver, _is_cs_file(), _metadata(), Path, C# cross-file resolution. The config-driven C# *extractor* (``extract_csharp``…, Namespace/using/alias-aware C# simple-name resolution. Factored out of…, Return deterministic ``(namespace, name) -> node_id`` C# type definitions. (+6 more)

### Community 37 - "callflow_html.py"
Cohesion: 0.11
Nodes (22): build_community_index(), _community_text(), derive_sections_from_communities(), detect_lang(), generate_header(), generate_nav(), _keyword_score(), label_for_community() (+14 more)

### Community 38 - "diagnostics.py"
Cohesion: 0.19
Nodes (22): _canonical_edge(), _count_extra(), diagnose_extraction(), diagnose_file(), _edge_list(), _exact_signature(), format_diagnostic_json(), format_diagnostic_report() (+14 more)

### Community 39 - "ingest.py"
Cohesion: 0.14
Nodes (26): _detect_url_type(), _download_binary(), _fetch_arxiv(), _fetch_html(), _fetch_tweet(), _fetch_webpage(), _html_to_markdown(), ingest() (+18 more)

### Community 40 - "Path"
Cohesion: 0.15
Nodes (22): _auto_follow_symlinks(), convert_office_file(), count_words(), docx_to_markdown(), extract_pdf_text(), _file_within_size_cap(), _md5_file(), _os_path() (+14 more)

### Community 41 - "html.py"
Cohesion: 0.14
Nodes (19): Shared constants/helpers for the graphify exporters package. Symbols used by…, _html_document_title(), _html_script(), _html_styles(), _hyperedge_script(), Graph, html — moved verbatim from graphify/export.py., Return a portable label for the graph.html <title>. Tracked artifacts must not… (+11 more)

### Community 42 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2022, node, vite/client, compilerOptions, allowImportingTsExtensions, allowJs (+13 more)

### Community 43 - "benchmark.py"
Cohesion: 0.12
Nodes (20): _estimate_tokens(), _hr(), Graph, _query_subgraph_tokens(), Token-reduction benchmark - measures how much context graphify saves vs naive…, Return unicode_char if stdout can encode it, else ascii_fallback. Windows…, Horizontal rule that survives non-UTF-8 stdout (e.g. Windows cp1252 console)., Run BFS from best-matching nodes and return estimated tokens in the subgraph… (+12 more)

### Community 44 - "Counter"
Cohesion: 0.12
Nodes (21): derive_flow_chain(), edge_score(), generate_overview_cards(), node_degree_scores(), node_importance(), preferred_edges(), Counter, Aggregate inter-section edge counts and relation names. (+13 more)

### Community 45 - "detect"
Cohesion: 0.13
Nodes (21): detect(), _find_vcs_root(), _git_info_exclude(), _git_tracked_path_keys(), ignored_predicate(), _is_regular_file(), _load_dir_own_ignore(), _load_graphifyignore() (+13 more)

### Community 46 - "extract_xaml"
Cohesion: 0.12
Nodes (21): extract_csproj(), extract_lazarus_package(), extract_slnx(), extract_xaml(), _project_xml_is_safe(), Reject XML that declares DTDs or entities. Stdlib ``xml.etree.ElementTree``…, Extract package metadata from Lazarus .lpk package files (XML format). .lpk is…, Extract projects and inter-project dependencies from a .slnx file. .slnx is the… (+13 more)

### Community 47 - "security.py"
Cohesion: 0.09
Nodes (19): _build_opener(), _ip_is_blocked(), Path, Resolve *host* once and return (family, validated_ip) for the first address…, HTTPConnection that resolves + validates DNS once, then connects to the exact…, HTTPSConnection variant of _SSRFGuardedHTTPConnection. Connects to the…, urllib handler that routes http:// through _SSRFGuardedHTTPConnection., urllib handler that routes https:// through _SSRFGuardedHTTPSConnection. (+11 more)

### Community 48 - "dependencies"
Cohesion: 0.10
Nodes (21): express, @google/genai, lucide-react, @mediapipe/tasks-vision, motion, dependencies, express, @google/genai (+13 more)

### Community 49 - "pick_text"
Cohesion: 0.13
Nodes (20): _describe_node(), format_node_refs(), generate_call_table_rows(), generate_section_cards(), generate_section_intro(), is_zh(), pick_text(), Render node references as readable labels instead of internal IDs. (+12 more)

### Community 50 - "manifest_ingest.py"
Cohesion: 0.13
Nodes (17): _coerce_deps(), extract_package_manifest(), _parse_apm(), _parse_apm_fallback(), _parse_cargo(), _parse_pyproject(), _pep508_name(), _pkg_id() (+9 more)

### Community 51 - "_key"
Cohesion: 0.12
Nodes (18): Resolve cross-file Swift member calls (``recv.method()``) to the real…, Resolve cross-file Python qualified class-method calls (``ClassName.method()``)…, Resolve cross-file TS/JS member calls via constructor-injection type tables…, Resolve cross-file C++ member calls (``f.bar()``, ``f->bar()``, ``Foo::bar()``,…, Resolve C# member calls (``recv.Method()``) to the receiver's declared type…, Resolve cross-file Objective-C message sends (``[recv sel]``) to the real…, _resolve_cpp_member_calls(), _resolve_csharp_member_calls() (+10 more)

### Community 52 - "objc.py"
Cohesion: 0.13
Nodes (18): _cpp_declarator_name(), _cpp_local_var_types(), Return the bare variable name from a C++ declaration declarator, unwrapping…, Collect ``var -> ClassName`` from local variable declarations in a C++ function…, _semantic_reference_edge(), _source_location(), extract_objc(), _objc_category_base_stem() (+10 more)

### Community 53 - "multigraph_compat.py"
Cohesion: 0.19
Nodes (15): _build_probe_graph(), CapabilityCheck, _check(), MultigraphCapabilityResult, _probe_duplicate_key_overwrite_semantics(), _probe_keyed_parallel_edges(), probe_multigraph_capabilities(), _probe_node_link_round_trip() (+7 more)

### Community 54 - "affected.py"
Cohesion: 0.26
Nodes (16): affected_nodes(), AffectedHit, _as_repo_relative(), _bare_name(), format_affected(), _format_location(), load_graph(), _node_label() (+8 more)

### Community 55 - "MinHash"
Cohesion: 0.15
Nodes (11): _lsh_integrate(), _mh_coeffs(), MinHash, MinHashLSH, _optimal_lsh_params(), ndarray, MinHash + band-LSH — datasketch-compatible drop-in (no scipy). datasketch.lsh…, MinHash sketch — same API as datasketch.MinHash for the subset used here. (+3 more)

### Community 56 - "cluster.py"
Cohesion: 0.22
Nodes (15): cluster(), cohesion_score(), label_communities_by_hub(), _partition(), Graph, Community detection on NetworkX graphs. Uses Leiden (graspologic) if available,…, Context manager to suppress stdout/stderr during library calls. graspologic's…, Run Leiden community detection. Returns {community_id: [node_ids]}. Community… (+7 more)

### Community 57 - "save_manifest"
Cohesion: 0.17
Nodes (15): detect_incremental(), load_manifest(), _mtime_may_hide_a_rewrite(), _nfc(), NFC-normalize a path string used as a manifest key. On macOS, ``os.walk`` /…, Return ``key`` as a forward-slash relative path from ``root``. Keys outside…, Inverse of :func:`_to_relative_for_storage`. Re-anchor a stored key against…, Load the manifest from a previous run. Returns {} on any error. When ``root``… (+7 more)

### Community 58 - "_is_ignored"
Cohesion: 0.13
Nodes (16): _has_coverage_artifacts(), _has_venv_markers(), _is_ignored(), _is_noise_dir(), _is_scan_ignored(), _path_identity(), Portable comparison key for an existing filesystem path., Return True if the path should be ignored per .graphifyignore patterns. Uses… (+8 more)

### Community 59 - "sentenceEngine.ts"
Cohesion: 0.22
Nodes (14): App(), clearIdleTimer(), DispatchReason, dispatchSentence(), getCurrentTokens(), getEngineState(), initSentenceEngine(), isStopGesture() (+6 more)

### Community 60 - "semantic_cleanup.py"
Cohesion: 0.19
Nodes (14): _normalize_hyperedge_members(), Canonicalize a hyperedge's member list onto the `nodes` key, in place. If…, _append_rationale_attr(), _is_sentence_like_rationale_label(), load_validated_semantic_fragment(), Path, Load and validate a semantic chunk, rejecting oversize files before parsing.…, Clean up a semantic extraction fragment in-place. Operations: 1. Removes nodes… (+6 more)

### Community 61 - "dedup.py"
Cohesion: 0.15
Nodes (14): _content_token_swap(), _is_code(), _make_minhash(), _merge_missing_attributes(), Entity deduplication pipeline for graphify knowledge graphs. Pipeline: exact…, True when tokens x and y read as one word misspelt, not two words (#2576). A…, True when two equal-token-count labels differ in at least one swapped content…, True for AST-extracted code symbols. Code-node identity is the node ID (which… (+6 more)

### Community 62 - "dm.py"
Cohesion: 0.19
Nodes (14): _dmm_type_path(), extract_dm(), extract_dmf(), extract_dmi(), extract_dmm(), Path, Dm extractor. Moved verbatim from graphify/extract.py., Extract types, procs, includes, and calls from a .dm/.dme file. (+6 more)

### Community 63 - "google_workspace.py"
Cohesion: 0.24
Nodes (14): convert_google_workspace_file(), _extract_file_id_from_url(), _extract_resource_key(), Any, Path, Optional Google Workspace shortcut export support. Google Drive for desktop…, Export a Google Workspace shortcut to a Markdown sidecar. Returns the converted…, Extract a Drive file ID from common Google Docs/Drive URL shapes. (+6 more)

### Community 64 - "_ImageRef"
Cohesion: 0.17
Nodes (13): _anthropic_content(), _bedrock_content(), _image_notes(), _ImageRef, _openai_content(), A single image destined for a vision request. `raw` is None when the image is…, Return refs with pixel data dropped (for non-vision backends)., Text block listing the images so the model emits one node per image. Always… (+5 more)

### Community 65 - "default_graph_json"
Cohesion: 0.15
Nodes (13): default_graph_json(), Default ``graph.json`` path under the configured output dir. The package-wide…, _build_http_app(), _filter_blank_stdin(), _main(), _MCPASGIApp, Filter blank lines from stdin before MCP reads it. Some MCP clients (Claude…, Start the MCP server over stdio (the default, per-developer transport). (+5 more)

### Community 66 - "transcribe.py"
Cohesion: 0.18
Nodes (16): Raise ValueError if *url* is not http or https, or targets a private/internal…, validate_url(), build_whisper_prompt(), download_audio(), _get_whisper(), _get_yt_dlp(), is_url(), _model_name() (+8 more)

### Community 67 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

### Community 68 - "deduplicate_entities"
Cohesion: 0.20
Nodes (14): _crossfile_fileanchored_blocked(), deduplicate_entities(), _is_variant_pair(), _llm_tiebreak(), _numeric_tokens_differ(), _pick_winner(), Block label-based merging of file-anchored non-code nodes across files (#1284).…, Deduplicate near-identical entities in a knowledge graph. Args: nodes: list of… (+6 more)

### Community 69 - "wiki.py"
Cohesion: 0.26
Nodes (13): _community_article(), _cross_community_links(), _god_node_article(), _index_md(), _md_link(), Graph, Path, Generate a Wikipedia-style wiki from the graph. Writes: - index.md — agent… (+5 more)

### Community 70 - "graphify CLI tool"
Cohesion: 0.15
Nodes (13): graphify rules, graphify always-on agents-md, graphify always-on antigravity-rules, graphify always-on claude-md, graphify always-on gemini-md, graphify always-on kiro-steering, graphify always-on vscode-instructions, graphify command-kilo (+5 more)

### Community 71 - "markdown.py"
Cohesion: 0.21
Nodes (12): extract_markdown(), _parse_frontmatter(), _parse_frontmatter_fallback(), Path, Markdown extractor. Moved verbatim from graphify/extract.py., Extract structural nodes and edges from a Markdown file. Produces nodes for: -…, Split leading YAML frontmatter off *lines*. Returns ``(frontmatter_lines,…, Parse frontmatter lines into a plain dict. Values are passed through… (+4 more)

### Community 72 - "_always_on"
Cohesion: 0.18
Nodes (13): _always_on(), claude_install(), codebuddy_install(), _install_skill_references(), Atomically install a packaged references/ sidecar next to SKILL.md. Stages the…, Write the graphify section to the local CLAUDE.md., Install the graphify skill and CODEBUDDY.md section for CodeBuddy., Read a packaged always-on instruction block from graphify/always_on/. The six… (+5 more)

### Community 73 - "_build_server"
Cohesion: 0.21
Nodes (13): _detect_default_branch(), fetch_prs(), fetch_worktrees(), format_prs_text(), _gh(), _parse_ci(), Auto-detect the repo's default branch via gh, then git, then fall back to…, Plain-text PR summary for MCP output (no ANSI). (+5 more)

### Community 74 - "dtwWorker.ts"
Cohesion: 0.19
Nodes (11): dtwCurrRow, dtwDistance(), dtwPrevRow, euclideanDistanceSq(), fillSnapshot(), GestureTemplateClass, GestureVariation, matchGesture() (+3 more)

### Community 75 - "verilog.py"
Cohesion: 0.24
Nodes (10): _augment_systemverilog_semantics(), extract_verilog(), Path, Verilog extractor. Moved verbatim from graphify/extract.py., First `simple_identifier` under node in pre-order, or None. tree-sitter-verilog…, Extract modules, functions, tasks, package imports, instantiations, and…, _sv_collect_type_refs(), _sv_first_identifier() (+2 more)

### Community 77 - "graphify (OpenCode)"
Cohesion: 0.26
Nodes (12): graphify (OpenCode), graphify (Windows), graphify.analyze, graphify.build, graphify.cache, graphify.cli, graphify.detect, graphify.diagnostics (+4 more)

### Community 78 - "bash.py"
Cohesion: 0.24
Nodes (10): _bash_assignment_base(), _bash_source_suffix(), extract_bash(), Path, Bash extractor. Moved verbatim from graphify/extract.py., Extract functions, source imports, and cross-function calls from a .sh file., Return the literal path suffix of a variable-built `source` argument, or None…, True if *target* is *ceiling* or lives beneath it, compared lexically… (+2 more)

### Community 79 - "file_slice.py"
Cohesion: 0.25
Nodes (10): _best_cut(), expand_oversized_files(), is_splittable_text(), Path, Intra-file slicing for oversized text documents (#1369). The extraction packer…, Replace each oversized splittable-text file with a list of ``FileSlice``s.…, True for plain-text document types that may be sliced., Return a cut index in ``(start, end]`` at the strongest nearby boundary.… (+2 more)

### Community 80 - "attach_graph_impact"
Cohesion: 0.20
Nodes (11): attach_graph_impact(), build_community_labels(), compute_pr_impact(), fetch_pr_files(), _load_graph_json(), _path_match(), Path, True if graph_src and pr_file refer to the same file (path-boundary safe). (+3 more)

### Community 81 - "resolver_registry.py"
Cohesion: 0.24
Nodes (10): LanguageResolver, Path, Registry for cross-file, language-specific resolution passes. Some…, One cross-file, language-specific resolution pass. ``resolve`` has the…, Append a resolver to the global registry and return it (for inline use)., Return a copy of the registered resolvers, in registration order., Run every resolver whose suffix appears in ``paths``. Behaviorally identical to…, register() (+2 more)

### Community 82 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, start (+2 more)

### Community 83 - "_norm"
Cohesion: 0.20
Nodes (10): _defines_id(), _entropy(), _id_prefixes(), _norm(), Lowercase + collapse non-alphanumeric runs to space (Unicode-aware)., The ID prefixes a node extracted from ``source_file`` may legitimately mint. An…, True when the node's own source_file is the file its ID encodes. A doc that…, Shannon entropy in bits/char of the normalised label. (+2 more)

### Community 84 - "_load_graph"
Cohesion: 0.22
Nodes (7): _communities_from_graph(), _GraphContextCache, _load_graph(), Thread-safe graph contexts: one pinned default plus an LRU of projects., Build one entry for an already-resolved path and known file key.…, Return a fresh context, retaining project contexts by LRU order.…, Reconstruct community dict from community property stored on nodes.

### Community 85 - "SignKYC — Bank Official Console"
Cohesion: 0.22
Nodes (10): Audit Modal, Gemini API, Sentence Engine, Supabase, AI Assist Panel, Indian Sign Language (ISL), KYC Progress Strip, SignKYC — Bank Official Console (+2 more)

### Community 86 - "Login.tsx"
Cohesion: 0.36
Nodes (7): Login(), LoginProps, Registration(), RegistrationProps, isSupabaseConfigured, supabase, Customer

### Community 87 - "PhrasedSentenceStrip.tsx"
Cohesion: 0.38
Nodes (9): PhrasedSentenceStrip(), PhrasedSentenceStripProps, VideoPanelProps, getStopGestureName(), manualDispatch(), SentenceEngineCallbacks, PhrasedSentence, SentenceEngineState (+1 more)

### Community 88 - "normalize_id"
Cohesion: 0.31
Nodes (8): extract_json(), _is_config_json(), Path, Json_config extractor. Moved verbatim from graphify/extract.py., True if a .json file is a recognized config/manifest worth AST-extracting.…, Extract structure and dependency edges from a *config/manifest* .json file.…, normalize_id(), r"""Normalize a single ID string to its canonical form. Guarantees, all…

### Community 89 - "Graphify Pipeline"
Cohesion: 0.22
Nodes (9): Graphify Skill (Copilot), Graphify Skill (Devin), Graphify Skill (Droid), Graphify Skill (Kilo), Graphify Skill (Kiro), AST Extraction, Graphify Pipeline, Graphify Query (+1 more)

### Community 90 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, dotenv, mem0ai, @modelcontextprotocol/sdk, mem0ai, @modelcontextprotocol/sdk, dotenv, dotenv

### Community 91 - "first_present"
Cohesion: 0.29
Nodes (8): endpoint_id(), first_present(), normalize_edge(), normalize_node(), Return the first non-empty value for any candidate key., Normalize edge endpoints that may be strings or node-like objects., Normalize a graphify node across common graph.json schema variants., Normalize graphify edges while preserving original fields.

### Community 92 - "introspect_cargo"
Cohesion: 0.46
Nodes (7): introspect_cargo(), _load_toml(), _member_manifest_paths(), Any, Path, Cargo manifest introspection for workspace-internal crate dependencies., Return crate nodes and internal dependency edges from Cargo manifests.

### Community 93 - "_is_sensitive"
Cohesion: 0.25
Nodes (8): _generic_keyword_hit(), _is_env_template(), _is_prose_note(), _is_sensitive(), True for `.env.example` / `.envrc.sample` style committed templates (#2184)., A prose/note file (.md/.rst/...) whose stem is a multi-word topic slug is…, True if a generic secret keyword appears load-bearing in the filename. Secret-…, Return True if this file likely contains secrets and should be skipped.

### Community 94 - "Obsidian Flavored Markdown Skill"
Cohesion: 0.25
Nodes (8): JSON Canvas Examples, JSON Canvas Skill, Obsidian CLI Skill, Callouts Reference, Embeds Reference, Properties Reference, Obsidian Flavored Markdown Skill, JSON Canvas Spec 1.0

### Community 95 - "_collision_rank"
Cohesion: 0.33
Nodes (7): _collision_rank(), _lifecycle_penalty(), Path, _rank_path(), 0 for active/in-progress paths, 2 for archived/done paths, 1 otherwise. Judged…, The root-relative form of ``source_file`` used for collision ranking. Mirrors…, A total order for choosing the survivor of an ID collision, independent of the…

### Community 96 - "extract_sql"
Cohesion: 0.33
Nodes (6): extract_sql(), _norm_ident(), Path, Sql extractor. Moved verbatim from graphify/extract.py., Normalize a SQL identifier for name-based reference resolution. Splits on `.`,…, Extract tables, views, functions, and relationships from .sql files via tree-…

### Community 97 - "sanitize_metadata"
Cohesion: 0.33
Nodes (7): Any, Return a control-character-free, HTML-escaped, bounded string., Sanitize a metadata value while preserving simple JSON-compatible types., Sanitize metadata keys and values before graph export. Metadata is less…, sanitize_metadata(), _sanitize_metadata_string(), _sanitize_metadata_value()

### Community 98 - "detect_incremental"
Cohesion: 0.33
Nodes (7): build_merge, detect_incremental, ingest, transcribe_all, graphify.watch, Transcribe Video and Audio (AMP), Incremental Update and Cluster-Only (AMP)

### Community 99 - "mem0-memory/package.json"
Cohesion: 0.33
Nodes (5): description, main, name, type, version

### Community 100 - "normalize_sections"
Cohesion: 0.33
Nodes (6): html_anchor_id(), normalize_communities(), normalize_sections(), Generate a stable, unique HTML anchor ID., Normalize section community lists from JSON or simple strings., Ensure sections have safe unique IDs and an overview section first.

### Community 101 - "humanize_label"
Cohesion: 0.33
Nodes (6): humanize_label(), node_display_name(), Readable node label for tables and summaries., Truncate without splitting Mermaid syntax., Convert graph labels into short labels people can scan in a diagram., truncate_text()

### Community 102 - "_kotlin_package_index"
Cohesion: 0.33
Nodes (6): _kotlin_package_index(), Group per-file results by the Kotlin package they declare. ``kotlin_package``…, Rewrite Kotlin ``imports`` edge targets from the bare last segment to the node…, Resolve Kotlin fully-qualified call expressions (#2550).…, _resolve_kotlin_import_targets(), _resolve_kotlin_qualified_calls()

### Community 103 - "_platform_skill_destination"
Cohesion: 0.33
Nodes (6): _antigravity_finalize(), _antigravity_install(), _platform_skill_destination(), Install graphify for Google Antigravity (global skill + .agents/rules +…, Return the skill destination for a platform and scope., Write Antigravity's always-on layer next to an installed skill. Injects the…

### Community 104 - "index.mjs"
Cohesion: 0.40
Nodes (4): __dirname, MEMORY_FILE, server, transport

### Community 107 - "extract_blade"
Cohesion: 0.40
Nodes (4): extract_blade(), Path, Laravel Blade template extractor. Moved verbatim from graphify/extract.py., Extract @include, <livewire:> components, and wire:click bindings from Blade…

### Community 108 - "commonlisp.py"
Cohesion: 0.40
Nodes (4): extract_commonlisp(), Path, Common Lisp extractor for .lisp/.cl/.lsp/.asd, backed by tree-sitter-commonlisp., Extract packages, classes, functions, methods, macros, and calls from a Common…

### Community 109 - "sln.py"
Cohesion: 0.40
Nodes (4): extract_sln(), Path, Sln extractor. Moved verbatim from graphify/extract.py., Extract projects and inter-project dependencies from a .sln file.

### Community 110 - "extract_terraform"
Cohesion: 0.40
Nodes (4): extract_terraform(), Path, Terraform extractor. Moved verbatim from graphify/extract.py., Extract Terraform/HCL blocks and the references between them via tree-sitter.…

### Community 111 - "_looks_like_context_exceeded"
Cohesion: 0.40
Nodes (5): _looks_like_context_exceeded(), _looks_like_timeout(), Heuristically classify an exception as a context-window overflow. Different…, Classify an exception as a recognized subprocess or SDK timeout., BaseException

### Community 112 - "pascal_resolution.py"
Cohesion: 0.50
Nodes (4): _pascal_raw_calls(), Cross-file resolution for Pascal/Delphi calls to inherited methods. The per-…, Resolve Pascal/Delphi calls to a method inherited across file boundaries.…, resolve_pascal_inherited_calls()

### Community 113 - "introspect_postgres"
Cohesion: 0.50
Nodes (4): introspect_postgres(), _quote_ident(), Connect to PostgreSQL, reconstruct DDL, and extract via extract_sql()., Double-quote a PostgreSQL identifier, escaping embedded double-quotes.

### Community 114 - "_resolve_lua_import_target"
Cohesion: 0.50
Nodes (4): _import_lua(), Extract require('module') from Lua variable_declaration nodes., Resolve a Lua require() module name to a node id. Lua module names use dots as…, _resolve_lua_import_target()

### Community 115 - "_php_name_text"
Cohesion: 0.50
Nodes (4): _php_collect_type_refs(), _php_name_text(), Return the unqualified name text from a PHP `name`/`qualified_name` node., Walk a PHP type expression; append (name, role) tuples.

### Community 116 - "_python_param_names"
Cohesion: 0.50
Nodes (4): _python_local_bound_names(), _python_param_names(), Plain parameter identifiers declared on a Python `parameters` node. Covers…, Names bound LOCALLY inside a Python function: parameters plus assignment,…

### Community 117 - "_uninstall_claude_hook"
Cohesion: 0.50
Nodes (4): Remove the graphify PreToolUse hook from .claude/settings.json and its local-…, Drop graphify PreToolUse hooks from a single Claude settings file, if present., _strip_graphify_hook(), _uninstall_claude_hook()

### Community 119 - "graphify skill-agents"
Cohesion: 0.50
Nodes (4): graphify skill-agents, graphify skill-amp, graphify reference: exports, graphify reference: github-and-merge

### Community 120 - "graphify.ingest"
Cohesion: 0.67
Nodes (4): graphify.ingest, graphify.watch, Add URL and Watch Folder (AMP), Add Watch Reference

### Community 123 - "Graphify Skill Definition"
Cohesion: 0.67
Nodes (3): Graphify Skill Definition, Extraction Specification, Query and Traversal Logic

### Community 124 - "graphify.serve"
Cohesion: 0.67
Nodes (3): graphify.serve, Extra Exports and Benchmark (AMP), Exports Reference

### Community 125 - "Incremental Update"
Cohesion: 0.67
Nodes (3): Incremental Update, Cross-Repo Merge, Git & Claude Integration

## Knowledge Gaps
- **167 isolated node(s):** `TemplateRecorderModalProps`, `AppView`, `CustomerSideModalProps`, `FooterControlsProps`, `InterpreterModalProps` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dispatch_command()` connect `cli.py` to `watch.py`, `Path`, `cache.py`, `reflect.py`, `analyze.py`, `build.py`, `serve.py`, `llm.py`, `hooks.py`, `export.py`, `extract_files_direct`, `write_callflow_html`, `__main__.py`, `_call_claude_cli`, `build_merge`, `prs.py`, `_call_llm`, `diagnostics.py`, `ingest.py`, `html.py`, `benchmark.py`, `detect`, `affected.py`, `cluster.py`, `save_manifest`, `semantic_cleanup.py`, `wiki.py`, `_build_server`, `_load_graph`, `introspect_cargo`, `_StageTimer`, `introspect_postgres`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `extract()` connect `Path` to `_read_text`, `cli.py`, `watch.py`, `_file_stem`, `extract.py`, `CsharpNameResolver`, `cache.py`, `Path`, `symbol_resolution.py`, `resolver_registry.py`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `_file_stem()` connect `_file_stem` to `_read_text`, `extract_sql`, `extract.py`, `Path`, `markdown.py`, `build.py`, `verilog.py`, `_extract_generic`, `extract_xaml`, `bash.py`, `symbol_resolution.py`, `objc.py`, `normalize_id`, `build_merge`, `make_id`, `dm.py`, `pascal.py`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `dispatch_command()` (e.g. with `to_html()` and `_file_hash()`) actually correct?**
  _`dispatch_command()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TemplateRecorderModalProps`, `AppView`, `CustomerSideModalProps` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `_read_text` be split into smaller, more focused modules?**
  _Cohesion score 0.022703818369453045 - nodes in this community are weakly interconnected._
- **Should `cli.py` be split into smaller, more focused modules?**
  _Cohesion score 0.043945068664169785 - nodes in this community are weakly interconnected._