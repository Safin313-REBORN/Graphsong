import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Logo />
        <Link className="btn p" to="/app">
          Open the player
        </Link>
      </header>
      <main className="wrap" style={{ paddingTop: 64, paddingBottom: 64, maxWidth: 680 }}>
        <div className="card">
          <p className="mono" style={{ margin: '0 0 8px', color: 'var(--blue)' }}>
            404
          </p>
          <h1 className="h" style={{ fontSize: 'clamp(32px,4vw,48px)', marginBottom: 14 }}>
            Page not found.
          </h1>
          <p style={{ margin: '0 0 24px' }}>
            That link does not match a page in Graphsong. You can return home or open the graph player directly.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn p" to="/app">
              Open the player
            </Link>
            <Link className="btn" to="/">
              Go home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
