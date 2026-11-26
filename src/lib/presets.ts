export interface PresetItem {
  id: string;
  label: string;
  expr: string;
}

export const PRESETS: PresetItem[] = [
  { id: 'sinxx', label: 'sin(x)·x', expr: 'sin(x) * x' },
  { id: 'x2', label: 'x^2', expr: 'x^2' },
  { id: 'sinx', label: 'sin(x)', expr: 'sin(x)' },
  { id: 'invx', label: '1/x', expr: '1/x' },
  { id: 'ex', label: 'e^x', expr: 'e^x' },
];

export interface LessonItem {
  id: string;
  title: string;
  expr: string;
  xMin: number;
  xMax: number;
  teaching: string;
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackWrong: string;
}

export const LESSONS: LessonItem[] = [
  {
    id: 'linear',
    title: '1. Linear growth',
    expr: '2*x + 1',
    xMin: -10,
    xMax: 10,
    teaching: 'A straight line changes at a constant rate. Listen for a smooth, steady rise in pitch.',
    question: 'What did you hear as x moved from left to right?',
    options: [
      'Pitch rose steadily the whole time',
      'Pitch went down then back up',
      'Pitch jumped back and forth',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. A positive slope (2) means the pitch rises at a steady pace.',
    feedbackWrong: 'Listen again: the line has a constant positive slope, so the pitch rises steadily.',
  },
  {
    id: 'quadratic',
    title: '2. Quadratic symmetry',
    expr: 'x^2',
    xMin: -10,
    xMax: 10,
    teaching: 'A parabola is symmetric around its vertex. Notice the pitch drops to a zero click, then rises identically.',
    question: 'What happens at x = 0?',
    options: [
      'A click at the lowest pitch, then the tone rises again',
      'A low undefined rumble',
      'The tone stays flat forever',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. The vertex at (0, 0) is the minimum and also a zero crossing.',
    feedbackWrong: 'Try again: at x = 0, y reaches its minimum of 0, so you hear a zero click and the lowest pitch.',
  },
  {
    id: 'sine',
    title: '3. Sine wave period',
    expr: 'sin(x)',
    xMin: -10,
    xMax: 10,
    teaching: 'Sine repeats its wave every 2*pi units. Listen for regular rises, falls, and evenly spaced zero clicks.',
    question: 'What did you hear?',
    options: [
      'A repeating up-and-down wave with regular zero clicks',
      'A single sharp jump at zero',
      'A pitch that only goes up',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. Periodic functions repeat the same pitch pattern at regular intervals.',
    feedbackWrong: 'Listen closely: sin(x) oscillates smoothly between -1 and 1 with evenly spaced clicks.',
  },
  {
    id: 'exponential',
    title: '4. Exponential growth',
    expr: 'e^x',
    xMin: -5,
    xMax: 5,
    teaching: 'Exponential growth starts almost flat on the left, then climbs faster and faster.',
    question: 'How does the pitch change from left to right?',
    options: [
      'Starts low and flat, then climbs rapidly at the end',
      'Crosses zero many times',
      'Drops to a minimum in the middle',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. e^x stays close to 0 for negative x and shoots upward for positive x.',
    feedbackWrong: 'Listen to the left half vs the right half: it stays low on the left and accelerates upward.',
  },
  {
    id: 'reciprocal',
    title: '5. Asymptote in 1/x',
    expr: '1/x',
    xMin: -10,
    xMax: 10,
    teaching: 'At x = 0, 1/x is undefined and jumps from negative to positive. You will hear a low rumble at the break.',
    question: 'What signals the asymptote at x = 0?',
    options: [
      'A low undefined rumble where the curve breaks',
      'A smooth flat tone',
      'Three evenly spaced clicks',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. Undefined points and asymptotes trigger the low warning tone.',
    feedbackWrong: 'Listen at the center (x = 0): Graphsong plays a low rumble when y is undefined.',
  },
  {
    id: 'abs',
    title: '6. Absolute value corner',
    expr: 'abs(x)',
    xMin: -10,
    xMax: 10,
    teaching: 'Absolute value forms a sharp V-shape. Try turning on "Hear the derivative" to hear the sudden slope flip!',
    question: 'How does abs(x) sound compared to x^2?',
    options: [
      'Drops in a straight line to a sharp corner at x = 0, then rises in a straight line',
      'Oscillates up and down like a wave',
      'Breaks into two disconnected pieces',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Correct. Its slope is -1 on the left and jumps straight to +1 on the right.',
    feedbackWrong: 'Listen to the steady straight descent and ascent meeting at x = 0.',
  },
];
