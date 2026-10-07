# AGENTS.md

## Project guidance

`CLAUDE.md` is the source of truth for project-specific guidance: the
single-file architecture map, state model, design notes, and change
workflow. Coding agents read AGENTS.md and CLAUDE.md together; add new
project guidance to CLAUDE.md rather than duplicating it here.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `upyesp/15Puzzle` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default triage vocabulary — the five canonical role names used as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root (to be created when the project takes shape). See `docs/agents/domain.md`.
