import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { SiteSearch } from '../components/SiteChrome';

export function LandingPage({
  darkMode,
  onToggleDarkMode,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header" style={{ paddingLeft: 32, paddingRight: 32 }}>
        <Logo />
        <button
          type="button"
          className="btn mobile-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="landing-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
        <nav
          id="landing-nav"
          aria-label="Main navigation"
          className={`header-nav ${menuOpen ? 'open' : ''}`}
        >
          <SiteSearch />
          <a className="nav-link" href="#how" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a className="nav-link" href="#who" onClick={() => setMenuOpen(false)}>
            Who it helps
          </a>
          <a className="nav-link" href="#faq" onClick={() => setMenuOpen(false)}>
            FAQ
          </a>
          <Link className="nav-link" to="/accessibility">
            Accessibility
          </Link>
          <button type="button" className="btn" onClick={onToggleDarkMode} aria-pressed={darkMode}>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <Link className="btn p" to="/app">
            Open the player
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="wrap" style={{ paddingTop: 72, paddingBottom: 72 }}>
          <div className="split">
            <div style={{ flex: '1 1 480px', minWidth: 0 }}>
              <p
                className="mono rise"
                style={{
                  margin: '0 0 16px',
                  color: 'var(--amber-text)',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  fontSize: 14,
                }}
              >
                Education &amp; Accessibility
              </p>
              <h1 className="h rise d1" style={{ fontSize: 'clamp(44px,6vw,80px)' }}>
                Hear the shape of a function.
              </h1>
              <p className="rise d2" style={{ fontSize: 22, maxWidth: 560, margin: '24px 0 32px' }}>
                Type any equation. Graphsong plays it as sound and describes it in plain words, so a student who cannot
                see a graph can still understand it.
              </p>
              <div className="rise d3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link className="btn p" to="/app?eq=sin(x)*x">
                  Try sin(x) · x
                </Link>
                <a className="btn" href="#how">
                  See how it works
                </a>
              </div>
            </div>

            <div style={{ flex: '1 1 460px', minWidth: 0 }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '3px solid var(--ink)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span className="mono" style={{ fontSize: 18 }}>
                    f(x) = sin(x) · x
                  </span>
                  <span className="mono" style={{ color: 'var(--teal-dark)', fontSize: 14 }}>
                    pitch up as y rises
                  </span>
                </div>
                <div style={{ position: 'relative', height: 300, background: 'var(--surface)' }}>
                  <svg
                    viewBox="0 0 600 300"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Graph of sine of x times x, oscillating with growing height"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  >
                    <path d="M0 150H600M300 0V300" stroke="var(--line)" strokeWidth="2" />
                    <path
                      className="draw"
                      d="M0 150C40 142 60 172 100 150S160 118 200 150 260 206 300 150 360 80 400 150 460 226 500 150 560 60 600 150"
                      stroke="var(--blue)"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle className="pulse" cx="200" cy="150" r="8" fill="var(--teal-dark)" />
                    <circle className="pulse" cx="400" cy="150" r="8" fill="var(--teal-dark)" />
                  </svg>
                  <div className="sweep sweep-demo" aria-hidden="true" />
                </div>
                <div style={{ padding: '14px 20px', background: 'var(--tint)', borderTop: '3px solid var(--ink)' }}>
                  <b>Spoken:</b> Rising oscillation. Crosses zero 6 times.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '20px 0' }}>
          <div className="wrap" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <span className="mono">Sound</span>
            <span className="mono">Spoken description</span>
            <span className="mono">Keyboard only</span>
            <span className="mono">No eval (safe parser)</span>
            <span className="mono">Runs offline</span>
            <span className="mono">No data leaves the browser</span>
          </div>
        </section>

        <section id="how" className="wrap" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <h2 className="h" style={{ fontSize: 'clamp(34px,4vw,52px)', marginBottom: 12 }}>
            Three steps, no sight needed.
          </h2>
          <p style={{ maxWidth: 620, margin: '0 0 40px' }}>Every step works with a keyboard and a screen reader.</p>
          <div className="grid3">
            <div className="card">
              <p className="mono" style={{ margin: 0, color: 'var(--blue)' }}>
                01
              </p>
              <h3 className="h" style={{ fontSize: 28, margin: '8px 0' }}>
                Type a function
              </h3>
              <p style={{ margin: 0 }}>
                Write it like in class: x^2, sin(x), 1/x. Mistakes are explained in plain words.
              </p>
            </div>
            <div className="card">
              <p className="mono" style={{ margin: 0, color: 'var(--blue)' }}>
                02
              </p>
              <h3 className="h" style={{ fontSize: 28, margin: '8px 0' }}>
                Press play
              </h3>
              <p style={{ margin: 0 }}>
                A tone sweeps left to right. Higher value, higher pitch. A click marks every zero.
              </p>
            </div>
            <div className="card">
              <p className="mono" style={{ margin: 0, color: 'var(--blue)' }}>
                03
              </p>
              <h3 className="h" style={{ fontSize: 28, margin: '8px 0' }}>
                Step through
              </h3>
              <p style={{ margin: 0 }}>
                Use the arrow keys to move point by point and hear x, y and the trend.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            background: 'var(--surface)',
            borderTop: '3px solid var(--ink)',
            borderBottom: '3px solid var(--ink)',
          }}
        >
          <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="split">
              <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                <h2 className="h" style={{ fontSize: 'clamp(34px,4vw,52px)' }}>
                  The description is computed, not guessed.
                </h2>
                <p style={{ margin: '20px 0 0', maxWidth: 520 }}>
                  Graphsong finds zeros, peaks, valleys and breaks in the curve with numerical analysis, then writes a
                  short summary. It runs in your browser. Nothing is uploaded.
                </p>
              </div>
              <div className="card" style={{ flex: '1 1 420px', minWidth: 0 }}>
                <h3 className="h" style={{ fontSize: 24, marginBottom: 14 }}>
                  Key facts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 24px' }}>
                  <b>Zeros</b>
                  <span className="mono">0, 3.14, 6.28</span>
                  <b>Maximum</b>
                  <span className="mono">4.8 at x = 4.9</span>
                  <b>Minimum</b>
                  <span className="mono">-7.9 at x = 7.9</span>
                  <b>Trend</b>
                  <span className="mono">growing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="who" className="wrap" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <h2 className="h" style={{ fontSize: 'clamp(34px,4vw,52px)', marginBottom: 40 }}>
            Built for the classroom.
          </h2>
          <div className="grid3">
            <div className="card" style={{ boxShadow: '6px 6px 0 var(--gold)' }}>
              <h3 className="h" style={{ fontSize: 26, margin: '0 0 8px' }}>
                Blind students
              </h3>
              <p style={{ margin: 0 }}>Understand curves that textbooks only show as pictures.</p>
            </div>
            <div className="card" style={{ boxShadow: '6px 6px 0 var(--blue)' }}>
              <h3 className="h" style={{ fontSize: 26, margin: '0 0 8px' }}>
                Low-vision students
              </h3>
              <p style={{ margin: 0 }}>High contrast, large text and sound as a second channel.</p>
            </div>
            <div className="card" style={{ boxShadow: '6px 6px 0 var(--teal)' }}>
              <h3 className="h" style={{ fontSize: 26, margin: '0 0 8px' }}>
                Teachers
              </h3>
              <p style={{ margin: 0 }}>One tool for the whole class. Share a function by link.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="wrap" style={{ paddingTop: 24, paddingBottom: 88 }}>
          <h2 className="h" style={{ fontSize: 'clamp(34px,4vw,52px)', marginBottom: 28 }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <details className="faq-item">
              <summary>How does Graphsong turn a graph into sound?</summary>
              <p style={{ margin: '12px 0 0' }}>
                It samples 201 points across your x-range and maps each y value onto a logarithmic pitch scale (default
                200 to 1000 Hz) while panning stereo left to right. Zero crossings play a short click, and undefined
                points play a low tone.
              </p>
            </details>
            <details className="faq-item">
              <summary>Does Graphsong work with a screen reader and keyboard only?</summary>
              <p style={{ margin: '12px 0 0' }}>
                Yes. Every control is keyboard reachable with 52px+ targets, 4px gold focus outlines, and an aria-live
                region. Press Space to play/stop, Left/Right arrows to step point by point, and D to hear the summary.
              </p>
            </details>
            <details className="faq-item">
              <summary>Is any student data sent to a server?</summary>
              <p style={{ margin: '12px 0 0' }}>
                No. Parsing, numerical analysis, and Web Audio synthesis all run locally in your browser. Settings and
                lesson progress stay in localStorage.
              </p>
            </details>
          </div>
        </section>

        <section style={{ background: 'var(--blue)', color: '#FFFFFF', borderTop: '3px solid var(--ink)' }}>
          <div
            className="wrap"
            style={{
              paddingTop: 72,
              paddingBottom: 72,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 className="h" style={{ fontSize: 'clamp(32px,4vw,48px)', maxWidth: 640 }}>
              Put on headphones. Press play.
            </h2>
            <Link className="btn" to="/app" style={{ color: 'var(--ink)' }}>
              Open the player
            </Link>
          </div>
        </section>
      </main>

      <footer
        className="wrap"
        style={{
          paddingTop: 28,
          paddingBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span>© 2026 Graphsong · GSIC 2026 · Last updated: Nov 26, 2026</span>
        <span>
          <Link to="/accessibility" style={{ textDecoration: 'underline', marginRight: 16 }}>
            Accessibility
          </Link>
          <Link to="/privacy" style={{ textDecoration: 'underline', marginRight: 16 }}>
            Privacy
          </Link>
          <Link to="/terms" style={{ textDecoration: 'underline', marginRight: 16 }}>
            Terms
          </Link>
          Made by students. AI-assisted development is disclosed in the README.
        </span>
      </footer>
    </div>
  );
}
