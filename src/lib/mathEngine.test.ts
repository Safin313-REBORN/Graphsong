import { describe, expect, it } from 'vitest';
import {
  analyzeSamples,
  findIntersections,
  formatStepAnnouncement,
  parseCsvTable,
  parseEquation,
  sampleFunction,
} from './mathEngine';

describe('parseEquation safety and parsing', () => {
  it('rejects unsafe input such as eval, window, import, and assignments', () => {
    expect(parseEquation('eval("1+1")').ok).toBe(false);
    expect(parseEquation('window.location').ok).toBe(false);
    expect(parseEquation('import("fs")').ok).toBe(false);
    expect(parseEquation('x = 5').ok).toBe(false);
    expect(parseEquation('foo + 1').ok).toBe(false);
    expect(parseEquation('').ok).toBe(false);
  });

  it('accepts valid math expressions', () => {
    const res = parseEquation('sin(x) * x');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.evaluate(0)).toBe(0);
    }
  });
});

describe('analyzeSamples on x^2, sin(x), and 1/x', () => {
  it('detects zero and minimum on x^2 and includes "minimum" in description', () => {
    const parsed = parseEquation('x^2');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const samples = sampleFunction(parsed.evaluate, -10, 10, 201);
    const analysis = analyzeSamples(samples, parsed.evaluate);

    expect(analysis.zeros.some((z) => Math.abs(z) < 0.05)).toBe(true);
    expect(analysis.localMinima.length).toBe(1);
    expect(analysis.localMinima[0].x).toBe(0);
    expect(analysis.localMinima[0].y).toBe(0);
    expect(analysis.description.toLowerCase()).toContain('minimum');
  });

  it('detects multiple zeros and extrema on sin(x)', () => {
    const parsed = parseEquation('sin(x)');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const samples = sampleFunction(parsed.evaluate, -10, 10, 201);
    const analysis = analyzeSamples(samples, parsed.evaluate);

    expect(analysis.zeros.length).toBeGreaterThanOrEqual(6);
    expect(analysis.localMaxima.length).toBeGreaterThanOrEqual(2);
    expect(analysis.localMinima.length).toBeGreaterThanOrEqual(2);
    expect(analysis.trend).toBe('oscillating');
  });

  it('detects asymptote/undefined break on 1/x', () => {
    const parsed = parseEquation('1/x');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const samples = sampleFunction(parsed.evaluate, -10, 10, 201);
    const analysis = analyzeSamples(samples, parsed.evaluate);

    expect(analysis.undefinedAt.length).toBeGreaterThanOrEqual(1);
    expect(analysis.undefinedAt.some((u) => Math.abs(u) < 0.2)).toBe(true);
  });
});

describe('compare mode intersections and step formatting', () => {
  it('finds intersections between x^2 and 2*x + 3 at x = -1 and x = 3', () => {
    const f = parseEquation('x^2');
    const g = parseEquation('2*x + 3');
    expect(f.ok && g.ok).toBe(true);
    if (!f.ok || !g.ok) return;

    const cmp = findIntersections(f.evaluate, g.evaluate, -10, 10, 201);
    expect(cmp.intersections.some((x) => Math.abs(x - -1) < 0.1)).toBe(true);
    expect(cmp.intersections.some((x) => Math.abs(x - 3) < 0.1)).toBe(true);
    expect(cmp.summary).toContain('f is higher');
  });

  it('formats step-through announcement with x, y, and direction', () => {
    expect(formatStepAnnouncement({ x: 2, y: 4, slope: 4 })).toBe('x = 2, y = 4, rising');
    expect(formatStepAnnouncement({ x: 0, y: null, slope: null })).toBe('x = 0, undefined');
  });

  it('parses CSV x,y table', () => {
    const csv = parseCsvTable('x,y\n-2, 4\n0, 0\n2, 4');
    expect(csv.ok).toBe(true);
    if (csv.ok) {
      expect(csv.points.length).toBe(3);
    }
  });
});
