# Graphsong — Devpost Submission

## Title
Graphsong

## Tagline
Hear the shape of a function: turning math graphs into stereo sound and spoken descriptions for blind and low-vision students.

## Inspiration / Problem
Graphs are how math teachers explain change, symmetry, peaks, and asymptotes—yet they are almost always presented as silent images. Blind and low-vision students are often left with raw formulas or static alt text that cannot convey how a curve actually behaves.

## What It Does / Solution
Graphsong runs 100% in the browser with zero backend and zero data collection:
- **Type any equation (`f(x)`) or paste CSV data:** Safely parsed via `mathjs` AST validation (no `eval`).
- **Hear the curve:** Sweeps left to right in stereo, mapping `y` to a logarithmic pitch scale (`200–1000 Hz`), clicking at zero crossings, and sounding a low tone at undefined breaks/asymptotes.
- **Computed plain-English descriptions:** Automatically detects zeros, local maxima/minima, asymptotes, and trends, announcing them in an `aria-live="polite"` region and optional Web Speech synthesis.
- **Step-through exploration:** Arrow keys move point by point and announce `"x = 2, y = 4, rising"`.
- **Compare mode:** Hear `f(x)` in the left ear and `g(x)` in the right ear simultaneously, with a two-tone chime at every intersection.
- **Hear the derivative:** Switch to slope audio where a flat middle tone marks peaks and valleys.
- **6 Built-in Lessons:** Keyboard-accessible interactive audio quizzes covering linear, quadratic, sine, exponential, reciprocal (`1/x`), and absolute value functions.

## How We Built It
Built with **Vite + React + TypeScript**, **mathjs** for safe AST parsing, **Web Audio API** (`OscillatorNode`, `StereoPannerNode`, `GainNode`) for real-time stereo synthesis, **Web Speech API** for spoken feedback, and **Vitest** for unit testing. Designed with **Atkinson Hyperlegible**, **Fraunces**, and **JetBrains Mono**, 52px minimum touch targets, 4px gold focus outlines, High Contrast mode, and `prefers-reduced-motion` support.

## Challenges We Ran Into
- Distinguishing vertical asymptotes (like `1/x` at `x = 0`) from true zero crossings when sampling discrete points—solved by checking jump magnitude relative to the curve's span.
- Keeping the visual sweep cursor tightly synchronized with Web Audio scheduling—solved by driving `requestAnimationFrame` from `AudioContext.currentTime`.

## Accomplishments We're Proud Of
- Zero-eval, offline-capable, 100% client-side architecture.
- Stereo function comparison (`f` vs `g`) and derivative sonification built cleanly on top of the core player.
- Full keyboard-only operation and a dedicated `/accessibility` transparency page.

## What's Next
- Exportable audio + tactile-ready SVG graph sheets for classroom printing.
- Multi-language spoken descriptions.

## Team
- [Your Name(s) / Role(s) here]
