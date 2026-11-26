import type { SamplePoint } from '../lib/mathEngine';

interface GraphPlotProps {
  samples: SamplePoint[];
  compareSamples?: SamplePoint[];
  zeros: number[];
  intersections?: number[];
  xMin: number;
  xMax: number;
  cursorFraction: number | null;
  ariaLabel: string;
  drawKey: string;
}

const W = 800;
const H = 390;
const PAD_Y = 24;

function buildPathSegments(
  samples: SamplePoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): string[] {
  const paths: string[] = [];
  let current = '';
  const ySpan = Math.max(1e-6, yMax - yMin);
  const jumpLimit = ySpan * 0.6;
  let prevY: number | null = null;

  for (const s of samples) {
    if (s.y === null) {
      if (current) {
        paths.push(current);
        current = '';
      }
      prevY = null;
      continue;
    }

    if (prevY !== null && Math.abs(s.y - prevY) > jumpLimit) {
      if (current) {
        paths.push(current);
        current = '';
      }
    }

    const px = ((s.x - xMin) / Math.max(1e-6, xMax - xMin)) * W;
    const py = H - PAD_Y - ((s.y - yMin) / ySpan) * (H - PAD_Y * 2);
    const cmd = current === '' ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    current += cmd;
    prevY = s.y;
  }

  if (current) paths.push(current);
  return paths;
}

export function GraphPlot({
  samples,
  compareSamples,
  zeros,
  intersections = [],
  xMin,
  xMax,
  cursorFraction,
  ariaLabel,
  drawKey,
}: GraphPlotProps) {
  const validYs: number[] = [];
  for (const s of samples) {
    if (s.y !== null) validYs.push(s.y);
  }
  if (compareSamples) {
    for (const s of compareSamples) {
      if (s.y !== null) validYs.push(s.y);
    }
  }

  let yMin = validYs.length ? Math.min(...validYs) : -10;
  let yMax = validYs.length ? Math.max(...validYs) : 10;

  // Clamp extreme asymptote spikes for readable visual scale
  if (validYs.length > 10) {
    const sorted = [...validYs].sort((a, b) => a - b);
    const qLow = sorted[Math.floor(sorted.length * 0.03)];
    const qHigh = sorted[Math.floor(sorted.length * 0.97)];
    if (yMax - yMin > (qHigh - qLow) * 4 && qHigh > qLow) {
      yMin = qLow - (qHigh - qLow) * 0.25;
      yMax = qHigh + (qHigh - qLow) * 0.25;
    }
  }

  if (Math.abs(yMax - yMin) < 1e-4) {
    yMin -= 1;
    yMax += 1;
  }

  const xSpan = Math.max(1e-6, xMax - xMin);
  const ySpan = Math.max(1e-6, yMax - yMin);

  const toPx = (x: number) => ((x - xMin) / xSpan) * W;
  const toPy = (y: number) => H - PAD_Y - ((y - yMin) / ySpan) * (H - PAD_Y * 2);

  const yAxisX = xMin <= 0 && xMax >= 0 ? toPx(0) : null;
  const xAxisY = yMin <= 0 && yMax >= 0 ? toPy(0) : null;

  const fPaths = buildPathSegments(samples, xMin, xMax, yMin, yMax);
  const gPaths = compareSamples ? buildPathSegments(compareSamples, xMin, xMax, yMin, yMax) : [];

  const gridCols = Array.from({ length: 9 }, (_, i) => ((i + 1) * W) / 10);

  return (
    <div className="plot-box">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {gridCols.map((gx) => (
          <line key={gx} x1={gx} y1={0} x2={gx} y2={H} stroke="var(--grid-minor)" strokeWidth="1.5" />
        ))}
        {xAxisY !== null && (
          <line x1={0} y1={xAxisY} x2={W} y2={xAxisY} stroke="var(--line)" strokeWidth="2.5" />
        )}
        {yAxisX !== null && (
          <line x1={yAxisX} y1={0} x2={yAxisX} y2={H} stroke="var(--line)" strokeWidth="2.5" />
        )}

        {gPaths.map((d, idx) => (
          <path
            key={`g-${drawKey}-${idx}`}
            d={d}
            stroke="var(--teal-dark)"
            strokeWidth="4"
            strokeDasharray="10 6"
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {fPaths.map((d, idx) => (
          <path
            key={`f-${drawKey}-${idx}`}
            className="draw"
            d={d}
            stroke="var(--blue)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {xAxisY !== null &&
          zeros.slice(0, 12).map((zx) => (
            <circle
              key={`z-${zx}`}
              cx={toPx(zx)}
              cy={xAxisY}
              r="8"
              fill="var(--teal-dark)"
              stroke="var(--surface)"
              strokeWidth="2"
            />
          ))}

        {intersections.slice(0, 12).map((ix) => {
          const sample = samples.reduce((best, curr) =>
            Math.abs(curr.x - ix) < Math.abs(best.x - ix) ? curr : best
          );
          if (sample.y === null) return null;
          return (
            <circle
              key={`ix-${ix}`}
              cx={toPx(ix)}
              cy={toPy(sample.y)}
              r="9"
              fill="var(--gold)"
              stroke="var(--ink)"
              strokeWidth="3"
            />
          );
        })}
      </svg>

      {cursorFraction !== null && (
        <div
          className="sweep"
          aria-hidden="true"
          style={{ left: `calc(${Math.min(100, Math.max(0, cursorFraction * 100)).toFixed(2)}% - 2px)` }}
        />
      )}
    </div>
  );
}
