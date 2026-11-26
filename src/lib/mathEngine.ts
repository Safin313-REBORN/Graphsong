import { parse, type MathNode } from 'mathjs';

export interface SamplePoint {
  x: number;
  y: number | null;
  slope: number | null;
}

export interface ExtremaPoint {
  x: number;
  y: number;
}

export interface GraphAnalysis {
  zeros: number[];
  localMaxima: ExtremaPoint[];
  localMinima: ExtremaPoint[];
  globalMax: ExtremaPoint | null;
  globalMin: ExtremaPoint | null;
  undefinedAt: number[];
  trend: 'increasing' | 'decreasing' | 'oscillating' | 'growing oscillation' | 'flat' | 'mixed';
  description: string;
}

export type ParseResult = {
  ok: true;
  evaluate: (x: number) => number | null;
} | {
  ok: false;
  error: string;
};

const ALLOWED_SYMBOLS = new Set(['x', 'e', 'pi', 'tau', 'phi']);

const ALLOWED_FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'sqrt', 'cbrt', 'abs',
  'exp', 'log', 'log10', 'log2', 'ln',
  'floor', 'ceil', 'round', 'sign',
  'min', 'max', 'pow', 'mod',
]);

const FORBIDDEN_PATTERN = /\b(eval|Function|import|require|window|document|globalThis|process|fetch|constructor|prototype|__proto__|createUnit|evaluate|parse|simplify|derivative|compile)\b/i;

export function roundNum(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  const r = Math.round(n * factor) / factor;
  return Object.is(r, -0) ? 0 : r;
}

export function formatNum(n: number, decimals = 2): string {
  const r = roundNum(n, decimals);
  return Number.isInteger(r) ? String(r) : String(r);
}

/**
 * Safely parses a mathematical expression using mathjs AST validation.
 * Rejects assignments, property access, unknown symbols, and unsafe identifiers.
 */
export function parseEquation(rawExpr: string): ParseResult {
  const expr = rawExpr.trim();
  if (!expr) {
    return { ok: false, error: 'Please enter an equation, like sin(x) * x or x^2.' };
  }
  if (expr.length > 200) {
    return { ok: false, error: 'Equation is too long. Please keep it under 200 characters.' };
  }
  if (FORBIDDEN_PATTERN.test(expr)) {
    return { ok: false, error: 'Unsupported keyword in equation. Use standard math like x^2, sin(x), or 1/x.' };
  }

  let ast: MathNode;
  try {
    ast = parse(expr);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Syntax error';
    return { ok: false, error: `Could not read equation: ${msg}` };
  }

  let validationError: string | null = null;

  ast.traverse((node: MathNode, _path: string, parent: MathNode | null) => {
    if (validationError) return;

    const type = node.type;
    if (
      type === 'AssignmentNode' ||
      type === 'FunctionAssignmentNode' ||
      type === 'AccessorNode' ||
      type === 'ObjectNode' ||
      type === 'ArrayNode' ||
      type === 'BlockNode' ||
      type === 'IndexNode'
    ) {
      validationError = 'Assignments, arrays, and property access are not allowed. Enter a function of x.';
      return;
    }

    if (type === 'FunctionNode') {
      const fnNode = node as unknown as { fn: MathNode };
      if (fnNode.fn.type !== 'SymbolNode') {
        validationError = 'Only named math functions like sin(x) or sqrt(x) are allowed.';
        return;
      }
      const fnName = (fnNode.fn as unknown as { name: string }).name;
      if (!ALLOWED_FUNCTIONS.has(fnName)) {
        validationError = `Unknown or unsupported function "${fnName}". Try sin, cos, tan, sqrt, abs, exp, or log.`;
        return;
      }
    }

    if (type === 'SymbolNode') {
      const name = (node as unknown as { name: string }).name;
      const isFnCallee =
        parent?.type === 'FunctionNode' &&
        (parent as unknown as { fn: MathNode }).fn === node;
      if (!isFnCallee && !ALLOWED_SYMBOLS.has(name)) {
        validationError = `Unknown symbol "${name}". Use x as your variable (for example, 2*x + 1).`;
      }
    }
  });

  if (validationError) {
    return { ok: false, error: validationError };
  }

  let compiled: { evaluate: (scope: Record<string, unknown>) => unknown };
  try {
    compiled = ast.compile();
  } catch {
    return { ok: false, error: 'Could not compile equation. Check parentheses and operators.' };
  }

  const evaluate = (x: number): number | null => {
    try {
      const val = compiled.evaluate({
        x,
        ln: Math.log,
      });
      if (typeof val !== 'number' || !Number.isFinite(val) || Math.abs(val) > 1e6) {
        return null;
      }
      return val;
    } catch {
      return null;
    }
  };

  return { ok: true, evaluate };
}

export function parseCsvTable(csvText: string): { ok: true; points: { x: number; y: number }[] } | { ok: false; error: string } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[,\t;]+/).map((p) => p.trim());
    if (parts.length < 2) continue;
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y });
    } else if (i > 0) {
      return { ok: false, error: `Invalid number on line ${i + 1}: "${lines[i]}". Expected "x, y".` };
    }
  }

  if (points.length < 2) {
    return { ok: false, error: 'Please paste at least 2 numeric "x, y" rows.' };
  }

  points.sort((a, b) => a.x - b.x);
  return { ok: true, points };
}

export function makeCsvEvaluator(points: { x: number; y: number }[]): (x: number) => number | null {
  return (x: number): number | null => {
    if (points.length === 0) return null;
    if (x < points[0].x || x > points[points.length - 1].x) return null;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (x >= p1.x && x <= p2.x) {
        if (p2.x === p1.x) return p1.y;
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
      }
    }
    return points[points.length - 1].y;
  };
}

export function sampleFunction(
  evaluate: (x: number) => number | null,
  xMin: number,
  xMax: number,
  numSamples = 201
): SamplePoint[] {
  const samples: SamplePoint[] = [];
  const step = (xMax - xMin) / (numSamples - 1);

  for (let i = 0; i < numSamples; i++) {
    const x = xMin + i * step;
    const y = evaluate(x);
    samples.push({ x, y, slope: null });
  }

  for (let i = 0; i < numSamples; i++) {
    const curr = samples[i];
    if (curr.y === null) continue;
    const prev = i > 0 ? samples[i - 1] : null;
    const next = i < numSamples - 1 ? samples[i + 1] : null;

    if (prev && prev.y !== null && next && next.y !== null) {
      curr.slope = (next.y - prev.y) / (next.x - prev.x);
    } else if (next && next.y !== null) {
      curr.slope = (next.y - curr.y) / (next.x - curr.x);
    } else if (prev && prev.y !== null) {
      curr.slope = (curr.y - prev.y) / (curr.x - prev.x);
    }
  }

  return samples;
}

function bisectZero(
  evaluate: (x: number) => number | null,
  a: number,
  b: number,
  ya: number
): number {
  let lo = a;
  let hi = b;
  let yLo = ya;
  for (let iter = 0; iter < 20; iter++) {
    const mid = (lo + hi) / 2;
    const yMid = evaluate(mid);
    if (yMid === null) return mid;
    if (Math.abs(yMid) < 1e-7) return mid;
    if ((yLo < 0 && yMid < 0) || (yLo > 0 && yMid > 0)) {
      lo = mid;
      yLo = yMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function analyzeSamples(
  samples: SamplePoint[],
  evaluate?: (x: number) => number | null
): GraphAnalysis {
  const zeros: number[] = [];
  const localMaxima: ExtremaPoint[] = [];
  const localMinima: ExtremaPoint[] = [];
  const undefinedAt: number[] = [];
  let globalMax: ExtremaPoint | null = null;
  let globalMin: ExtremaPoint | null = null;

  const validValues = samples.filter((s): s is { x: number; y: number; slope: number | null } => s.y !== null);
  if (validValues.length === 0) {
    return {
      zeros: [],
      localMaxima: [],
      localMinima: [],
      globalMax: null,
      globalMin: null,
      undefinedAt: samples.map((s) => roundNum(s.x, 2)),
      trend: 'flat',
      description: 'No defined values found in this range. Try widening x-min and x-max.',
    };
  }

  for (const s of validValues) {
    if (!globalMax || s.y > globalMax.y) globalMax = { x: s.x, y: s.y };
    if (!globalMin || s.y < globalMin.y) globalMin = { x: s.x, y: s.y };
  }

  const ySpan = globalMax && globalMin ? Math.max(1, globalMax.y - globalMin.y) : 1;
  const jumpThreshold = Math.max(25, ySpan * 0.45);

  const addUnique = (arr: number[], val: number) => {
    const rounded = roundNum(val, 2);
    if (!arr.some((v) => Math.abs(v - rounded) < 0.08)) {
      arr.push(rounded);
    }
  };

  for (let i = 0; i < samples.length; i++) {
    const curr = samples[i];
    if (curr.y === null) {
      addUnique(undefinedAt, curr.x);
      continue;
    }

    if (Math.abs(curr.y) < 1e-4) {
      addUnique(zeros, curr.x);
    }

    if (i < samples.length - 1) {
      const next = samples[i + 1];
      if (next.y !== null) {
        const diff = Math.abs(next.y - curr.y);
        const oppositeSigns = (curr.y < 0 && next.y > 0) || (curr.y > 0 && next.y < 0);
        if (oppositeSigns) {
          if (diff > jumpThreshold) {
            // Likely a vertical asymptote (e.g. 1/x) rather than a zero
            addUnique(undefinedAt, (curr.x + next.x) / 2);
          } else {
            const root = evaluate
              ? bisectZero(evaluate, curr.x, next.x, curr.y)
              : curr.x - (curr.y * (next.x - curr.x)) / (next.y - curr.y);
            addUnique(zeros, root);
          }
        }
      }
    }

    if (i > 0 && i < samples.length - 1) {
      const prev = samples[i - 1];
      const next = samples[i + 1];
      if (prev.y !== null && next.y !== null) {
        const prevDiff = Math.abs(curr.y - prev.y);
        const nextDiff = Math.abs(next.y - curr.y);
        if (prevDiff < jumpThreshold && nextDiff < jumpThreshold) {
          if (curr.y > prev.y && curr.y >= next.y && curr.y - Math.min(prev.y, next.y) > 1e-5) {
            localMaxima.push({ x: roundNum(curr.x, 2), y: roundNum(curr.y, 2) });
          } else if (curr.y < prev.y && curr.y <= next.y && Math.max(prev.y, next.y) - curr.y > 1e-5) {
            localMinima.push({ x: roundNum(curr.x, 2), y: roundNum(curr.y, 2) });
          }
        }
      }
    }
  }

  // Trend detection
  let upSteps = 0;
  let downSteps = 0;
  let dirChanges = 0;
  let lastDir = 0;

  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1].y;
    const b = samples[i].y;
    if (a === null || b === null) continue;
    if (Math.abs(b - a) > jumpThreshold) continue;
    const delta = b - a;
    if (Math.abs(delta) < 1e-5) continue;
    const dir = delta > 0 ? 1 : -1;
    if (dir > 0) upSteps++;
    else downSteps++;
    if (lastDir !== 0 && dir !== lastDir) {
      dirChanges++;
    }
    lastDir = dir;
  }

  let trend: GraphAnalysis['trend'] = 'mixed';
  if (upSteps === 0 && downSteps === 0) {
    trend = 'flat';
  } else if (dirChanges >= 3) {
    // Check if amplitude grows from middle/start to edges
    const firstQuarterMax = Math.max(
      ...samples.slice(0, Math.floor(samples.length / 3)).map((s) => Math.abs(s.y ?? 0))
    );
    const lastQuarterMax = Math.max(
      ...samples.slice(Math.floor((samples.length * 2) / 3)).map((s) => Math.abs(s.y ?? 0))
    );
    const midMax = Math.max(
      ...samples.slice(Math.floor(samples.length / 3), Math.floor((samples.length * 2) / 3)).map((s) => Math.abs(s.y ?? 0))
    );
    if ((lastQuarterMax > midMax * 1.4 || firstQuarterMax > midMax * 1.4) && Math.abs(lastQuarterMax - midMax) > 0.5) {
      trend = 'growing oscillation';
    } else {
      trend = 'oscillating';
    }
  } else if (upSteps > 0 && downSteps === 0) {
    trend = 'increasing';
  } else if (downSteps > 0 && upSteps === 0) {
    trend = 'decreasing';
  }

  // Build 2-3 plain sentences
  const sentences: string[] = [];

  if (trend === 'growing oscillation') {
    sentences.push('Growing oscillation across the range.');
  } else if (trend === 'oscillating') {
    sentences.push(`Periodic wave oscillating between ${formatNum(globalMin!.y)} and ${formatNum(globalMax!.y)}.`);
  } else if (trend === 'increasing') {
    sentences.push(`Steady increasing curve from ${formatNum(globalMin!.y)} up to ${formatNum(globalMax!.y)}.`);
  } else if (trend === 'decreasing') {
    sentences.push(`Decreasing curve from ${formatNum(globalMax!.y)} down to ${formatNum(globalMin!.y)}.`);
  } else if (trend === 'flat') {
    sentences.push(`Constant flat line at y = ${formatNum(validValues[0].y)}.`);
  } else if (localMinima.length === 1 && localMaxima.length === 0) {
    sentences.push(
      `U-shaped curve with a minimum of ${formatNum(localMinima[0].y)} at x = ${formatNum(localMinima[0].x)}.`
    );
  } else if (localMaxima.length === 1 && localMinima.length === 0) {
    sentences.push(
      `Arch-shaped curve with a maximum of ${formatNum(localMaxima[0].y)} at x = ${formatNum(localMaxima[0].x)}.`
    );
  } else {
    sentences.push(
      `Curve ranging from ${formatNum(globalMin!.y)} to ${formatNum(globalMax!.y)}.`
    );
  }

  if (zeros.length === 0) {
    sentences.push('Does not cross zero in this range.');
  } else if (zeros.length === 1) {
    sentences.push(`Crosses zero at x = ${formatNum(zeros[0])}.`);
  } else if (zeros.length <= 3) {
    sentences.push(`Crosses zero ${zeros.length} times at x = ${zeros.map((z) => formatNum(z)).join(', ')}.`);
  } else {
    sentences.push(`Crosses zero ${zeros.length} times.`);
  }

  if (undefinedAt.length > 0) {
    sentences.push(`Has a break or asymptote near x = ${formatNum(undefinedAt[0])}.`);
  } else if (globalMax && globalMin && trend !== 'flat' && localMinima.length !== 1 && localMaxima.length !== 1) {
    sentences.push(`Highest point is ${formatNum(globalMax.y)} at x = ${formatNum(globalMax.x)}.`);
  }

  return {
    zeros,
    localMaxima,
    localMinima,
    globalMax: globalMax ? { x: roundNum(globalMax.x, 2), y: roundNum(globalMax.y, 2) } : null,
    globalMin: globalMin ? { x: roundNum(globalMin.x, 2), y: roundNum(globalMin.y, 2) } : null,
    undefinedAt,
    trend,
    description: sentences.slice(0, 3).join(' '),
  };
}

export interface CompareResult {
  intersections: number[];
  summary: string;
}

export function findIntersections(
  evalF: (x: number) => number | null,
  evalG: (x: number) => number | null,
  xMin: number,
  xMax: number,
  numSamples = 201
): CompareResult {
  const step = (xMax - xMin) / (numSamples - 1);
  const intersections: number[] = [];

  const diff = (x: number): number | null => {
    const yf = evalF(x);
    const yg = evalG(x);
    if (yf === null || yg === null) return null;
    return yf - yg;
  };

  for (let i = 0; i < numSamples - 1; i++) {
    const x1 = xMin + i * step;
    const x2 = xMin + (i + 1) * step;
    const d1 = diff(x1);
    const d2 = diff(x2);
    if (d1 === null || d2 === null) continue;
    if (Math.abs(d1 - d2) > 40) continue; // skip asymptote jumps

    if (Math.abs(d1) < 1e-4) {
      const r = roundNum(x1, 2);
      if (!intersections.some((v) => Math.abs(v - r) < 0.08)) intersections.push(r);
    } else if ((d1 < 0 && d2 > 0) || (d1 > 0 && d2 < 0)) {
      const root = bisectZero(diff, x1, x2, d1);
      const r = roundNum(root, 2);
      if (!intersections.some((v) => Math.abs(v - r) < 0.08)) intersections.push(r);
    }
  }

  const endF = evalF(xMax);
  const endG = evalG(xMax);
  let tailNote = '';
  if (endF !== null && endG !== null) {
    if (endF > endG + 0.01) tailNote = ' After that, f is higher.';
    else if (endG > endF + 0.01) tailNote = ' After that, g is higher.';
  }

  let summary = '';
  if (intersections.length === 0) {
    summary = `f and g do not cross in this range.${tailNote}`;
  } else if (intersections.length === 1) {
    summary = `f and g cross at x = ${formatNum(intersections[0])}.${tailNote}`;
  } else {
    summary = `f and g cross at x = ${intersections.slice(0, 4).map((x) => formatNum(x)).join(' and x = ')}.${tailNote}`;
  }

  return { intersections, summary };
}

export function formatStepAnnouncement(sample: SamplePoint): string {
  const xStr = formatNum(sample.x);
  if (sample.y === null) {
    return `x = ${xStr}, undefined`;
  }
  const yStr = formatNum(sample.y);
  let dir = 'flat';
  if (sample.slope !== null) {
    if (sample.slope > 0.08) dir = 'rising';
    else if (sample.slope < -0.08) dir = 'falling';
  }
  return `x = ${xStr}, y = ${yStr}, ${dir}`;
}
