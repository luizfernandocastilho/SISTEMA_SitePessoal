# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`SISTEMA_SitePessoal` is a personal website project managed with **GitHub Spec Kit** (Specify CLI `0.14.1`) using a **Spec-Driven Development (SDD)** workflow. There is **no application code yet** — the repo currently contains only the Spec Kit scaffold under `.specify/` and the `speckit-*` skills under `.claude/skills/`. The tech stack is intentionally undecided until a `/speckit.plan` step chooses it.

The project was initialized with `--integration claude`, POSIX `sh` scripts, and **sequential** feature numbering (`init-options.json`).

## The SDD workflow (how work happens here)

Development is driven by `speckit-*` skills, invoked in Claude Code as `/speckit.*` slash commands. Run them roughly in this order:

1. `/speckit.constitution` — **do this first.** `.specify/memory/constitution.md` is still an unfilled template (`[PLACEHOLDER]` tokens). It must be populated before it can govern anything.
2. `/speckit.specify` — describe *what* and *why* to build (no tech stack). Creates a new numbered feature.
3. `/speckit.clarify` — *(optional)* resolve underspecified areas before planning.
4. `/speckit.plan` — choose tech stack and architecture. **This is where the stack for this repo gets decided.**
5. `/speckit.tasks` — generate the actionable task list.
6. `/speckit.analyze` — *(optional)* cross-artifact consistency check before implementing.
7. `/speckit.implement` — build the feature per the plan.

A bundled multi-step workflow (`.specify/workflows/speckit/workflow.yml`, id `speckit`) chains `specify → plan → tasks → implement` with human **review gates** after the spec and after the plan (`on_reject: abort`).

## Repository structure & conventions

- `.specify/memory/constitution.md` — project principles. Governs all SDD steps. **Currently a template.**
- `.specify/templates/` — templates for spec, plan, tasks, checklist, constitution. Resolved at runtime; the resolution stack is (highest priority first): `.specify/templates/overrides/` → `.specify/presets/templates/` → `.specify/extensions/templates/` → `.specify/templates/`.
- `.specify/scripts/bash/` — shell scripts the skills call (`sh` script mode). Key ones:
  - `create-new-feature.sh` — creates a feature. Numbers are zero-padded 3 digits (`%03d`) and sequential; branch/dir named `NNN-short-suffix`. Specs live in `specs/NNN-.../` at repo root (the `specs/` dir does not exist yet — the first `/speckit.specify` creates it).
  - `common.sh` — shared helpers. Resolves the active feature via `SPECIFY_FEATURE` / `SPECIFY_FEATURE_DIRECTORY` env vars or `.specify/feature.json`.
  - `setup-plan.sh`, `setup-tasks.sh`, `check-prerequisites.sh`.
- `.claude/skills/speckit-*/SKILL.md` — the actual skill definitions backing each `/speckit.*` command.
- `.specify/integration.json` / `init-options.json` — Spec Kit config (integration = `claude`, script = `sh`).

**Not a git repository yet.** `create-new-feature.sh` supports a no-git fallback (resolving features via `.specify/feature.json` and directory basename), but initializing git is recommended so the review-gate / per-feature-branch model works as intended.

## Specify CLI

The `specify` CLI is installed globally (via `uv tool`). Useful commands:

```bash
specify self check          # check for a newer Spec Kit release (read-only)
specify self upgrade        # upgrade the CLI in place
specify integration list    # list available agent integrations
```

Do not edit files under `.specify/templates/` or `.specify/scripts/` to customize behavior — use the override/preset/extension layers described above so upgrades don't clobber changes.
