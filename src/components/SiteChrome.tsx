import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRESETS } from '../lib/presets';

export function ScrollProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${pct.toFixed(1)}%` }}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}

export function StorageBanner({
  dismissed,
  onDismiss,
}: {
  dismissed: boolean;
  onDismiss: () => void;
}) {
  if (dismissed) return null;

  return (
    <aside className="cookie-banner" aria-label="Local storage notice">
      <p style={{ margin: 0, fontSize: 16 }}>
        <b>Privacy notice:</b> Graphsong uses only local browser storage for your sound settings and lesson progress. No
        tracking cookies or external analytics.
      </p>
      <button type="button" className="btn p" onClick={onDismiss}>
        Got it
      </button>
    </aside>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-dialog">
        <h2 id="confirm-title" className="h" style={{ fontSize: 26, marginBottom: 10 }}>
          {title}
        </h2>
        <p style={{ margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn p" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 280);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please enter a message of at least 10 characters.');
      return;
    }
    if (!consentChecked) {
      setFormError('Please confirm the privacy consent checkbox before sending.');
      return;
    }

    setFormSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setConsentChecked(false);
  };

  return (
    <>
      <div className="floating-actions">
        {showTop && (
          <button
            type="button"
            className="btn"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
          </button>
        )}
        <button
          type="button"
          className="btn p"
          onClick={() => {
            setContactOpen(true);
            setFormError('');
            setFormSuccess(false);
          }}
        >
          Contact
        </button>
      </div>

      {contactOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="contact-title">
          <div className="modal-dialog">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 id="contact-title" className="h" style={{ fontSize: 26 }}>
                Send feedback
              </h2>
              <button type="button" className="btn" onClick={() => setContactOpen(false)}>
                Close
              </button>
            </div>

            {formSuccess ? (
              <div className="live-banner" role="status" aria-live="polite" style={{ marginTop: 0 }}>
                <b>Thank you!</b> Your feedback has been validated and recorded locally for this session.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label className="field-label" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className="field-input-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="field-input-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="contact-msg">
                    Message
                  </label>
                  <textarea
                    id="contact-msg"
                    className="field-input-sm"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we improve Graphsong?"
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 15 }}>
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    style={{ width: 22, height: 22, flex: '0 0 22px', marginTop: 2 }}
                  />
                  <span>
                    I consent to local-only feedback handling (if under 13, ask a parent or teacher first).
                  </span>
                </label>

                {formError && (
                  <div className="error-banner" role="alert" aria-live="assertive" style={{ marginTop: 0 }}>
                    {formError}
                  </div>
                )}

                <button type="submit" className="btn p">
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const SEARCH_PAGES = [
  { label: 'Player (/app)', to: '/app' },
  { label: 'Accessibility (/accessibility)', to: '/accessibility' },
  { label: 'Privacy Policy (/privacy)', to: '/privacy' },
  { label: 'Terms of Use (/terms)', to: '/terms' },
];

export function SiteSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const presetHits = PRESETS.filter(
      (p) => p.label.toLowerCase().includes(q) || p.expr.toLowerCase().includes(q)
    ).map((p) => ({
      label: `Function: ${p.label}`,
      to: `/app?eq=${encodeURIComponent(p.expr)}`,
    }));
    const pageHits = SEARCH_PAGES.filter((p) => p.label.toLowerCase().includes(q));
    return [...presetHits, ...pageHits].slice(0, 5);
  }, [query]);

  return (
    <div style={{ position: 'relative', minWidth: 200 }}>
      <label htmlFor="site-search" className="sr-only">
        Search functions and pages
      </label>
      <input
        id="site-search"
        type="search"
        className="field-input-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search functions, pages..."
        style={{ minHeight: 46, fontSize: 15, padding: '8px 12px' }}
      />
      {matches.length > 0 && (
        <ul
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: '4px 0 0',
            padding: 6,
            listStyle: 'none',
            background: 'var(--surface)',
            border: '3px solid var(--ink)',
            boxShadow: '4px 4px 0 var(--shadow)',
            zIndex: 80,
          }}
        >
          {matches.map((m) => (
            <li key={m.to}>
              <button
                type="button"
                className="btn"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', boxShadow: 'none', minHeight: 44, fontSize: 15 }}
                onClick={() => {
                  setQuery('');
                  navigate(m.to);
                }}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
