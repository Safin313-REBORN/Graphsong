# Graphsong — 2:30 Demo Video Script

## 0:00 – 0:20 | Problem (20s)
- **Visual:** Show the Graphsong landing page (`/`).
- **Voiceover:** "When a sighted student looks at `sin(x) * x`, they immediately see waves growing taller. A blind or low-vision student often gets only the raw formula—no shape, no peaks, no crossings. Graphsong turns any math function into stereo sound and plain-word descriptions right in the browser."

## 0:20 – 0:50 | Type `sin(x) * x` and Play (30s)
- **Visual:** Click **Try sin(x) · x** to open `/app`. Press **Play sound** (`Space`). Watch the gold sweep cursor move left to right across the curve.
- **Voiceover:** "I'll press Play. As x moves left to right, the stereo pan follows it. Higher y values produce higher pitches, and each click marks a zero crossing. Graphsong also computes and speaks a plain-English summary and fills in the Key facts panel."

## 0:50 – 1:20 | Compare Mode: `x^2` vs `2*x + 3` (30s)
- **Visual:** Click **Compare f & g**. Enter `x^2` in `f(x)` and `2*x + 3` in `g(x)`. Press **Play sound**.
- **Voiceover:** "In Compare mode, `f(x)` plays in your left ear and `g(x)` in your right ear at the same time. Whenever the curves cross—at `x = -1` and `x = 3`—you hear a distinct two-tone chime, and Graphsong announces which function is higher afterward."

## 1:20 – 1:45 | Derivative Toggle on a Parabola (25s)
- **Visual:** Turn off Compare mode, select `x^2`, and toggle **Hear the derivative** on. Press **Play sound**.
- **Voiceover:** "Turning on Hear the derivative plays the slope instead of the value. On `x^2`, the pitch rises steadily toward the middle and holds a flat middle tone right at the vertex—showing students where the minimum is."

## 1:45 – 2:10 | Lesson Mode, Keyboard Only (25s)
- **Visual:** Use `Tab`, `Enter`, and arrow keys (no mouse) to open **Lessons**, load a lesson, play it, and select an answer in the "What did you hear?" quiz.
- **Voiceover:** "Every control works with a keyboard and screen reader, with 52-pixel targets, 4-pixel gold focus rings, high-contrast mode, and six built-in audio lessons."

## 2:10 – 2:30 | Tech Stack, AI Disclosure & Close (20s)
- **Visual:** Briefly show `/accessibility` and the landing page principles (`No eval`, `Runs offline`, `No data leaves the browser`).
- **Voiceover:** "Graphsong is built with React, TypeScript, mathjs, and the Web Audio API—with AI-assisted development disclosed in our README. Put on headphones, press play, and hear the shape of a function."
