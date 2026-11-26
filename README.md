# Graphsong

**Hear the shape of a function.**

Graphsong is a client-side web app built for **GSIC 2026 (Education & Accessibility)** that turns mathematical functions and data tables into stereo sound and plain-word spoken descriptions so blind and low-vision students can understand graphs.

## Problem

Math textbooks, homework platforms, and classroom whiteboards rely heavily on visual curves. A student who cannot see a graph often hears only a raw equation—missing where the curve crosses zero, where it peaks or dips, or where it breaks at an asymptote.

## Who It Helps

- **Blind students:** Explore curves through pitch, stereo panning, zero-crossing clicks, and computed plain-English summaries.
- **Low-vision students:** Use high-contrast mode, 52px+ interactive targets, Atkinson Hyperlegible typography, and audio as a second channel.
- **Teachers:** Share any equation with the class via URL (`?eq=sin(x)*x`) or run the 6 built-in guided lessons.

## How to Use

1. Open `/` for the overview or `/app` for the Graphsong Player.
2. Type an equation like `sin(x) * x`, `x^2`, `1/x`, or `e^x` (or click **Paste CSV** to enter `x, y` data).
3. Press **Play sound** (or `Space` outside text inputs) to hear the curve sweep left to right.
4. Press **Describe graph** (or `D`) to hear and read the computed summary in the `aria-live` banner and **Key facts** panel.
5. Use **Left / Right arrow keys** (or **Step through points**) to inspect individual `(x, y)` coordinates and slopes.
6. Toggle **Compare f & g** to hear two functions simultaneously in stereo (left ear vs. right ear) with a two-tone chime at intersections.
7. Toggle **Hear the derivative** to listen to the slope instead of the value (`Flat tone = peak or valley`).
8. Open **Lessons** for 6 interactive audio quizzes with keyboard navigation and progress saved in `localStorage`.

## How It Works (Mapping y to Pitch)

1. **Safe AST Parsing (`mathjs`):** Every equation is parsed into an abstract syntax tree and validated against an allowlist of math symbols and functions—never `eval` or `Function`.
2. **Numerical Sampling & Analysis:** Graphsong samples 201 points across `[xMin, xMax]`, detects sign changes and refines zeros via bisection, locates local maxima/minima, flags undefined breaks/asymptotes, and classifies the overall trend in pure TypeScript.
3. **Log-Scale Sonification (Web Audio API):**
   - Each valid `y` value is mapped onto a logarithmic frequency scale (default `200 Hz` to `1000 Hz`):
     `freq = minFreq * (maxFreq / minFreq) ^ ((y - yMin) / (yMax - yMin))`
   - Stereo panning follows `x` from left (`-0.85`) to right (`+0.85`).
   - Short percussive clicks mark zero crossings; a low tone (`92 Hz`) signals undefined points or asymptotes.
   - In **Compare mode**, `f(x)` plays in the left ear (`sine`) and `g(x)` in the right ear (`triangle`), with a two-tone chime (`880 Hz -> 1175 Hz`) at intersections.

## Why Not Just a Screen Reader or Tactile Graph?

| Method | Strengths | Limitations | How Graphsong Complements It |
| --- | --- | --- | --- |
| **Standard screen reader** | Reads equations and table cells accurately | Cannot convey the continuous shape, curvature, or symmetry of a graph | Adds continuous pitch sweep, zero clicks, and computed shape summaries |
| **Tactile / embossed graph** | Great spatial feel under the fingers | Requires specialized embosser hardware, time to print, and cannot be edited live | Instant, zero-cost, works on any laptop or phone browser with headphones |
| **Graphsong** | Instant, interactive, stereo compare, derivative audio, zero data uploaded | Relies on 201-point sampling and OS speech synthesis | Pairs directly with screen readers via `aria-live` and keyboard shortcuts |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router
- **Math & Analysis:** `mathjs` (AST-validated safe parser), custom numerical sampler, bisection root-finder, and description generator
- **Audio & Speech:** Web Audio API (`OscillatorNode`, `StereoPannerNode`, `GainNode`), Web Speech API (`speechSynthesis`)
- **Testing:** Vitest

## Built During Nov 23–25, 2026

- Safe `mathjs` AST parser, CSV table importer, numerical sampler, zero/extrema/asymptote/trend analyzer, and plain-English summary generator.
- Web Audio API stereo sonification engine with log-scale pitch, zero clicks, undefined rumble, derivative slope mode, and stereo `f` vs. `g` comparison with intersection chimes.
- Landing page (`/`), Player (`/app`), 6-lesson interactive curriculum, Settings & High Contrast persistence (`localStorage`), and Accessibility statement (`/accessibility`).

## AI Tools Used

- **Google Antigravity** (AI coding assistant) was used to scaffold the Vite + React + TypeScript project, implement the math analysis/audio modules, port the design system, and write unit tests. All code was reviewed, tested with Vitest, and verified locally.

## Limitations & Future Work

- **Limitations:** Supports explicit `f(x)` functions and `x, y` CSV tables (not implicit equations like `x^2 + y^2 = 1`); built-in speech quality varies by browser/OS.
- **Future Work:** SVG/audio export for teachers, printable tactile-ready SVG templates, and multi-language spoken descriptions.

## Local Development

```bash
npm install
npm test
npm run dev
npm run build
```
