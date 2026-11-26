import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { resetAllStorage } from '../lib/settings';

export function PrivacyPage() {
  const [deleted, setDeleted] = useState(false);

  const handleDeleteLocalData = () => {
    resetAllStorage();
    try {
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    setDeleted(true);
  };

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
          <Link to="/" style={{ textDecoration: 'underline' }}>Home</Link> / <span aria-current="page">Privacy Policy</span>
        </nav>
        <div className="card" style={{ display: 'grid', gap: 20 }}>
          <div>
            <h1 className="h" style={{ fontSize: 'clamp(32px,4vw,44px)', marginBottom: 12 }}>
              Privacy &amp; Cookie Policy
            </h1>
            <p style={{ margin: 0 }}>
              Graphsong runs 100% locally in your web browser. We do not require accounts, logins, or API keys, and we
              only store the minimum preferences needed for the player to remember your sound settings.
            </p>
          </div>

          <section>
            <h2 className="h" style={{ fontSize: 24, marginBottom: 8 }}>
              Data we process
            </h2>
            <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 8 }}>
              <li>
                <b>No data leaves your browser:</b> Equations, CSV tables, and Web Audio synthesis are processed
                entirely on your device.
              </li>
              <li>
                <b>Student &amp; children&apos;s privacy:</b> Graphsong does not collect personal information from
                students or children under 13. Teachers can use it in classrooms without accounts.
              </li>
              <li>
                <b>Third-party SDKs:</b> Zero analytics, advertising, or tracking SDKs are loaded. Google Fonts
                (Fraunces, Atkinson Hyperlegible, JetBrains Mono, SIL Open Font License) are used for typography.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="h" style={{ fontSize: 24, marginBottom: 8 }}>
              Cookie &amp; local storage policy
            </h2>
            <p style={{ margin: 0 }}>
              Graphsong sets <b>no tracking or advertising cookies</b>. It uses browser{' '}
              <span className="mono">localStorage</span> only to save your high-contrast, dark mode, pitch, duration,
              and lesson progress, plus <span className="mono">sessionStorage</span> for optional local UTM tags.
            </p>
          </section>

          <section>
            <h2 className="h" style={{ fontSize: 24, marginBottom: 8 }}>
              Data deletion requests
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Because no data is stored on any server, you can delete all Graphsong data immediately from your browser:
            </p>
            <button type="button" className="btn" onClick={handleDeleteLocalData}>
              Delete all my local data
            </button>
            {deleted && (
              <p className="live-banner" role="status" aria-live="polite" style={{ marginTop: 12 }}>
                <b>Deleted:</b> All Graphsong settings, lesson progress, and session data have been cleared from this
                browser.
              </p>
            )}
          </section>

          <section>
            <h2 className="h" style={{ fontSize: 24, marginBottom: 8 }}>
              Project details
            </h2>
            <p style={{ margin: 0 }}>
              Graphsong · GSIC 2026 Education &amp; Accessibility student entry. Free, open educational web tool.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
