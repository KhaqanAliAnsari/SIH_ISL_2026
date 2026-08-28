---
name: git
description: "Expert Git version control workflow, branch operations, atomic commits, diff inspection, conflict resolution, rebasing, stashing, and Git MCP server tool execution."
---

# Git Workflow & Management Skill

This skill guides the agent on professional Git workflows, branch strategies, safe commits, conflict resolutions, and using Git MCP / CLI tools effectively across all projects.

---

## Core Guidelines

1. **Verify State First**: Always check `git status` or use Git MCP tools before modifying files, creating branches, or staging changes.
2. **Atomic Commits**: Group related changes logically. Use conventional commit messages (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`).
3. **Protect History**: Avoid destructive commands (e.g. `git push --force` on shared branches, `git reset --hard` without verifying uncommitted work).
4. **Inspect Diffs**: Run `git diff` or check staged changes (`git diff --cached`) before finalizing commits.

---

## Common Workflows

### 1. Repository Inspection
- Check status: `git status -s`
- View branch graph: `git log --oneline --graph --decorate -n 15`
- Check unstaged changes: `git diff`
- Check staged changes: `git diff --cached`
- View recent author activity: `git log -n 5 --stat`

### 2. Branch & Workspace Management
- Create & switch to a new feature branch:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Switch back to base branch:
  ```bash
  git checkout main || git checkout master
  ```
- List local and remote branches:
  ```bash
  git branch -a
  ```

### 3. Staging and Committing
- Stage specific files:
  ```bash
  git add path/to/file.ts
  ```
- Create conventional commit:
  ```bash
  git commit -m "feat(module): add descriptive summary"
  ```
- Amend last commit (without modifying pushed history):
  ```bash
  git commit --amend --no-edit
  ```

### 4. Handling Stashes and Work in Progress
- Stash uncommitted changes with a message:
  ```bash
  git stash push -m "WIP: description of work"
  ```
- List stashes:
  ```bash
  git stash list
  ```
- Pop latest stash:
  ```bash
  git stash pop
  ```

### 5. Syncing and Rebasing
- Fetch remote changes cleanly:
  ```bash
  git fetch origin
  ```
- Rebase current branch on updated upstream:
  ```bash
  git rebase origin/main
  ```
- Abort rebase on unexpected conflicts:
  ```bash
  git rebase --abort
  ```
- Continue rebase after resolving conflict files:
  ```bash
  git add <resolved-files>
  git rebase --continue
  ```

### 6. Conflict Resolution Protocol
1. Identify conflicting files via `git status`.
2. Open conflicting files and look for standard conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Retain intended logic, remove markers, and test code.
4. Stage resolved files: `git add <file>`.
5. Complete merge/rebase: `git commit` or `git rebase --continue`.

---

## MCP Git Tool Integration

When the Git MCP server (`mcp-server-git`) is active, you can also leverage direct MCP tools:
- `git_status`: Query repository status.
- `git_diff_unstaged`: Inspect unstaged working directory differences.
- `git_diff_staged`: Inspect staged differences.
- `git_commit`: Create commits with structured messages.
- `git_log`: Inspect commit history.
- `git_create_branch`: Create new branches programmatically.
- `git_checkout`: Switch branches cleanly.
