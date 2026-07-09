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
| 268-273 | DOM refs | Cached element references (board, stats, overlay) |
| 276-288 | Persistence | `localStorage` reads/writes under key `puzzle15-best` |
| 290-300 | Formatting | Time formatting and timer display updates |
| 303-318 | Rendering | Builds the 4x4 grid of tile divs from the `tiles` state array |
| 321-345 | Game logic | Move handling, adjacency checks via Manhattan distance |
| 348-375 | Win check | Validates solved state, shows glassmorphic overlay on win |
| 378-415 | Shuffling | Solvable shuffle starting from solved state with ~225 random moves |

### State model

- `tiles` -- flat array of 16 elements (0-15), where `0` is the empty square
- `moves`, `timerStart`, `intervalId`, `won` -- runtime counters
- Best time/moves persisted to `localStorage` as `{ time, moves }`

### Public API (attached to `window`)

- `newGame()` -- reset state, reshuffle, re-render
- `resetBest()` -- clear localStorage best entry

## Design Notes

- Dark theme using CSS custom properties (`--bg`, `--surface`, `--accent`, `--win-gold`)
- Responsive layout via `clamp()`, `min()`, `aspect-ratio`
- Touch-friendly: dual handlers (click + touchend), mobile-optimized shuffle depth
- Shuffle guarantees solvability by starting from solved state and making random valid moves only

## Making Changes

Since everything is in one file, any edit touches a single location. The inline comment markers (`// --- Section ---`) delineate logical sections for navigation. Line numbers above are approximate references to the current file layout; re-read `index.html` if the line ranges have shifted after an edit.
