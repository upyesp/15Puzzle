# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 15-puzzle sliding tile game implemented as a single self-contained `index.html` file. No build system, no dependencies, no server required -- open directly in any modern browser via `file://`.

## Running

Open `index.html` in a browser. That's it. No npm scripts, no dev server, no tests to run.

## Architecture

The entire application lives in one IIFE inside the `<script>` tag of `index.html` (~447 lines). The CSS is inline in `<style>`. Key sections within the script:

| Lines | Section | Purpose |
|-------|---------|---------|
| 294-309 | State & DOM refs | Cached element references (board, stats, overlay, buttons) |
| 311-323 | Persistence | `localStorage` reads/writes under key `puzzle15-best` |
| 325-365 | Sound | Web Audio synthesized knock at the start of every animated slide (no assets) |
| 367-420 | Rendering/geometry | Measures the board and positions tile slots via `translate()` |
| 422-463 | Board build + game logic | Move handling, adjacency checks via Manhattan distance |
| 465-491 | Win check | Validates solved state, shows glassmorphic overlay on win |
| 493-539 | Shuffling | Solvable shuffle starting from solved state with ~225 random moves |
| 541-726 | Solver | Weighted IDA* (w=2) over walking-distance + Manhattan/linear-conflict heuristics |
| 728-782 | Solve button | Animates the solver's move list; voids the attempt (moves reset, best untouched) |
| 784-798 | New game / Reset best | Public API entry points |

### State model

- `tiles` -- flat array of 16 elements (0-15), where `0` is the empty square
- `moves`, `won` -- runtime counters; `solving`, `solveTimer` -- auto-solve animation state; `resizeRaf` -- resize coalescing; `audioCtx`, `noiseBuffer` -- lazy Web Audio state
- Best moves persisted to `localStorage` under `puzzle15-best` as `{ moves }`

### Public API (attached to `window`)

- `newGame()` -- cancel any running solve, reset state, reshuffle, re-render
- `resetBest()` -- clear localStorage best entry
- `solveGame()` -- compute a near-optimal solution from the current position and play it out slide-by-slide; on completion the move counter resets to 0 and the best record is never touched (the attempt is voided). Tile clicks are ignored and the Solve button is disabled while the animation runs; New Game cancels it mid-flight.

### Solver notes

- The shuffle's 225-move random walk yields positions ~45-55 moves from solved; unweighted IDA* needs seconds-to-minutes in JS, so the search weights f by 2 (`SOLVE_WEIGHT`), trading a little solution length (empirically avg ~69 moves, max ~91 on real shuffles) for milliseconds solve time. Solutions are guaranteed within 2x of optimal and are always valid.
- The walking-distance table (~37k states) is BFS-generated at load in ~16ms; heuristic = max(manhattan + linear conflicts, walking distance).
- Animation cadence adapts (`12000 / solution.length`, clamped 120-200ms) with a matching `--solve-duration` so the show stays ~12s or less.

## Design Notes

- Dark theme using CSS custom properties (`--bg`, `--surface`, `--accent`, `--win-gold`)
- Responsive layout via `clamp()`, `min()`, `aspect-ratio`
- Touch-friendly: dual handlers (click + touchend), mobile-optimized shuffle depth
- Shuffle guarantees solvability by starting from solved state and making random valid moves only
- Auto-solve never updates the best record: a computer-played finish scores nothing, and the move counter resets to zero when its animation completes
- Slide sound: a synthesized filtered-noise knock (Web Audio, no audio files) fires at the START of every animated slide (hooked in `positionTile`), so human moves and auto-solve sound alike. The envelope is short (65ms). An arrival-delayed variant (sound timed to the transition end, via the slot's computed duration) was tried and rejected -- the delay read as device lag, not impact. The AudioContext is unlocked on the first user gesture (`ensureAudio` in `handleClick`/`solveGame`); audio failures are silent no-ops and never affect gameplay

## Making Changes

Since everything is in one file, any edit touches a single location. The inline comment markers (`// --- Section ---`) delineate logical sections for navigation. Line numbers above are approximate references to the current file layout; re-read `index.html` if the line ranges have shifted after an edit.
