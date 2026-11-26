import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function AccessibilityPage() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#a11y-main">
        Skip to main content
      </a>

      <header className="app-header">
        <Logo />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link className="btn" to="/">
            Home
          </Link>
          <Link className="btn p" to="/app">
            Open the player
          </Link>
        </div>
      </header>

      <main id="a11y-main" className="wrap" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 900 }}>
        <nav aria-label="Breadcrumb" style={{ marginBottom: 14, fontSize: 16 }}>
          <Link to="/" style={{ textDecoration: 'underline' }}>Home</Link> / <span aria-current="page">Accessibility</span>
        </nav>
        <h1 className="h" style={{ fontSize: 'clamp(32px,4vw,48px)', marginBottom: 16 }}>
          Accessibility &amp; Testing
        </h1>
        <p style={{ fontSize: 20, marginBottom: 32 }}>
          Graphsong is designed for blind and low-vision students first. Here is what was tested and what limits
          remain.
        </p>

        <div style={{ display: 'grid', gap: 24 }}>
          <section className="card">
            <h2 className="h" style={{ fontSize: 26, marginBottom: 12 }}>
              What we built and verified
            </h2>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 10 }}>
              <li>
                <b>Keyboard-only operation:</b> Every control (equation input, presets, play/stop, describe, step
                through, derivative toggle, compare mode, lessons, settings) is reachable with Tab and operable via
                Enter or Space. Shortcuts: <span className="mono">Space</span> plays/stops,{' '}
                <span className="mono">Left/Right</span> arrows step point by point, and{' '}
                <span className="mono">D</span> speaks the description.
              </li>
              <li>
                <b>Screen reader announcements:</b> Spoken summaries, error messages, and step-through coordinates
                update an <span className="mono">aria-live="polite"</span> status region (and{' '}
                <span className="mono">role="alert"</span> for equation syntax errors).
              </li>
              <li>
                <b>Focus &amp; targets:</b> Visible 4px gold focus outline (<span className="mono">#FCA311</span>) on
                all interactive elements; minimum 52px button and input heights.
              </li>
              <li>
                <b>Contrast &amp; motion:</b> Built-in High Contrast mode (<span className="mono">#000000</span> on{' '}
                <span className="mono">#FFFFFF</span>) and full support for{' '}
                <span className="mono">prefers-reduced-motion</span> plus a manual Reduced Motion toggle.
              </li>
              <li>
                <b>No auto-play:</b> Audio and speech never start automatically on page load.
              </li>
            </ul>
          </section>

          <section className="card">
            <h2 className="h" style={{ fontSize: 26, marginBottom: 12 }}>
              Honest limitations
            </h2>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 10 }}>
              <li>
                <b>Browser speech synthesis:</b> Built-in Web Speech API voice quality and speed depend on the user&apos;s
                operating system and browser. Screen reader users can turn off built-in speech in Settings and rely on
                their own screen reader reading the <span className="mono">aria-live</span> region.
              </li>
              <li>
                <b>Explicit functions of x:</b> Equations must be written as <span className="mono">f(x)</span> (e.g.{' '}
                <span className="mono">x^2</span>). Implicit curves like <span className="mono">x^2 + y^2 = 1</span> are
                not supported yet.
              </li>
              <li>
                <b>Numerical sampling:</b> Zeros, peaks, and intersections are detected across 201 sample points in the
                chosen x-range, so very narrow spikes between samples may be missed.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
