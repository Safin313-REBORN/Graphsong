import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function TermsPage() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Logo />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn" to="/">
            Home
          </Link>
          <Link className="btn p" to="/app">
            Open the player
          </Link>
        </div>
      </header>
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 820 }}>
        <nav aria-label="Breadcrumb" style={{ marginBottom: 14, fontSize: 16 }}>
          <Link to="/" style={{ textDecoration: 'underline' }}>Home</Link> / <span aria-current="page">Terms of Use</span>
        </nav>
        <div className="card">
          <h1 className="h" style={{ fontSize: 'clamp(32px,4vw,44px)', marginBottom: 16 }}>
            Terms of Service &amp; Refund Policy
          </h1>
          <p style={{ margin: '0 0 14px' }}>
            Graphsong is a free educational and accessibility tool created for GSIC 2026.
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 10 }}>
            <li>
              <b>Educational use:</b> You may use Graphsong freely in classrooms, homework, and self-study.
            </li>
            <li>
              <b>Free &amp; Refund Policy:</b> Graphsong is 100% free with no paid plans, subscriptions, or hidden fees,
              so no payments or refunds apply.
            </li>
            <li>
              <b>No warranty:</b> Numerical analysis (zeros, extrema, asymptotes) is computed by sampling and is
              provided as-is for learning support.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
