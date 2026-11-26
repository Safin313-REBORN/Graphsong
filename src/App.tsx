import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingActions, ScrollProgressBar, StorageBanner } from './components/SiteChrome';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { loadSettings, saveSettings, type AppSettings } from './lib/settings';

const PlayerPage = lazy(() =>
  import('./pages/PlayerPage').then((m) => ({ default: m.PlayerPage }))
);

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Graphsong — Hear the shape of a function',
    description:
      'Graphsong turns math functions into stereo sound and plain-word spoken descriptions so blind and low-vision students can understand graphs.',
  },
  '/app': {
    title: 'Player — Graphsong',
    description:
      'Type any math equation or paste CSV data to hear its curve in stereo, inspect key facts, compare two functions, and practice with audio lessons.',
  },
  '/accessibility': {
    title: 'Accessibility & Testing — Graphsong',
    description:
      'Keyboard navigation, screen reader live regions, high contrast mode, reduced motion, and honest accessibility limits in Graphsong.',
  },
  '/privacy': {
    title: 'Privacy Policy — Graphsong',
    description:
      'Graphsong runs 100% locally in your browser with no tracking cookies, no analytics, and no data sent to any server.',
  },
  '/terms': {
    title: 'Terms of Use — Graphsong',
    description: 'Terms of use for Graphsong, a free educational and accessibility tool for GSIC 2026.',
  },
};

function RouteMetaUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[pathname] ?? {
      title: 'Page Not Found — Graphsong',
      description: 'The requested page could not be found in Graphsong.',
    };
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }
    const canonEl = document.querySelector('link[rel="canonical"]');
    if (canonEl) {
      canonEl.setAttribute('href', `${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  return null;
}

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    // Capture UTM parameters locally in sessionStorage without sending externally
    try {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
      const captured: Record<string, string> = {};
      for (const k of utmKeys) {
        const val = params.get(k);
        if (val) captured[k] = val;
      }
      if (Object.keys(captured).length > 0) {
        sessionStorage.setItem('graphsong:utm', JSON.stringify(captured));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    if (settings.highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }

    if (settings.reducedMotion) {
      root.setAttribute('data-motion', 'reduced');
    } else {
      root.removeAttribute('data-motion');
    }
  }, [settings.darkMode, settings.highContrast, settings.reducedMotion]);

  const toggleDarkMode = () => {
    const next = { ...settings, darkMode: !settings.darkMode };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteMetaUpdater />
        <ScrollProgressBar />
        <Routes>
          <Route
            path="/"
            element={<LandingPage darkMode={settings.darkMode} onToggleDarkMode={toggleDarkMode} />}
          />
          <Route
            path="/app"
            element={
              <Suspense fallback={<main className="wrap" style={{ paddingTop: 48 }}>Loading Graphsong player...</main>}>
                <PlayerPage settings={settings} onUpdateSettings={setSettings} />
              </Suspense>
            }
          />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <StorageBanner
          dismissed={settings.noticeDismissed}
          onDismiss={() => {
            const next = { ...settings, noticeDismissed: true };
            setSettings(next);
            saveSettings(next);
          }}
        />
        <FloatingActions />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
