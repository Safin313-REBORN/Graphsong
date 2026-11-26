import { Link } from 'react-router-dom';

export function Logo({ size = 36, fontSize = 28 }: { size?: number; fontSize?: number }) {
  return (
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }} aria-label="Graphsong home">
      <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
        <rect x="1.5" y="1.5" width="31" height="31" rx="6" fill="#14213D" />
        <path
          d="M5 22c4-14 8 6 12-6s8 4 12-6"
          stroke="#FCA311"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="h" style={{ fontSize }}>
        Graphsong
      </span>
    </Link>
  );
}
