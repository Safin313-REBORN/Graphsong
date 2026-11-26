import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraphPlot } from '../components/GraphPlot';
import { Logo } from '../components/Logo';
import { ConfirmModal } from '../components/SiteChrome';
import { GraphAudioEngine, speakText, stopSpeech } from '../lib/audioEngine';
import {
  analyzeSamples,
  findIntersections,
  formatNum,
  formatStepAnnouncement,
  makeCsvEvaluator,
  parseCsvTable,
  parseEquation,
  sampleFunction,
} from '../lib/mathEngine';
import { LESSONS, PRESETS } from '../lib/presets';
import {
  DEFAULT_SETTINGS,
  loadCompletedLessons,
  resetAllStorage,
  saveCompletedLessons,
  saveSettings,
  type AppSettings,
} from '../lib/settings';

const SAMPLE_COUNT = 201;

export function PlayerPage({
  settings,
  onUpdateSettings,
}: {
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEq = searchParams.get('eq') || 'sin(x) * x';

  const [expr, setExpr] = useState(initialEq);
  const [compareMode, setCompareMode] = useState(false);
  const [exprG, setExprG] = useState('2*x + 3');
  const [xMinStr, setXMinStr] = useState('-10');
  const [xMaxStr, setXMaxStr] = useState('10');

  const [csvMode, setCsvMode] = useState(false);
  const [csvText, setCsvText] = useState('-4, 16\n-2, 4\n0, 0\n2, 4\n4, 16');

  const [derivativeMode, setDerivativeMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorFraction, setCursorFraction] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>('');

  const [showSettings, setShowSettings] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [lessonFeedback, setLessonFeedback] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => loadCompletedLessons());

  const engineRef = useRef<GraphAudioEngine | null>(null);

  useEffect(() => {
    engineRef.current = new GraphAudioEngine();
    return () => {
      engineRef.current?.stop();
      stopSpeech();
    };
  }, []);

  const rawXMin = Number(xMinStr);
  const rawXMax = Number(xMaxStr);
  const rangeError =
    !Number.isFinite(rawXMin) || !Number.isFinite(rawXMax)
      ? 'x min and x max must be valid numbers.'
      : rawXMax <= rawXMin
        ? 'x max must be greater than x min.'
        : null;

  const xMin = useMemo(() => (Number.isFinite(rawXMin) ? rawXMin : -10), [rawXMin]);

  const xMax = useMemo(
    () => (Number.isFinite(rawXMax) && rawXMax > xMin ? rawXMax : xMin + 20),
    [rawXMax, xMin]
  );

  const parsedF = useMemo(() => {
    if (csvMode) {
      const csv = parseCsvTable(csvText);
      if (!csv.ok) return { ok: false as const, error: csv.error };
      return { ok: true as const, evaluate: makeCsvEvaluator(csv.points) };
    }
    return parseEquation(expr);
  }, [csvMode, csvText, expr]);

  const parsedG = useMemo(() => {
    if (!compareMode) return null;
    return parseEquation(exprG);
  }, [compareMode, exprG]);

  const samples = useMemo(() => {
    if (!parsedF.ok) return [];
    return sampleFunction(parsedF.evaluate, xMin, xMax, SAMPLE_COUNT);
  }, [parsedF, xMin, xMax]);

  const compareSamples = useMemo(() => {
    if (!compareMode || !parsedG || !parsedG.ok) return undefined;
    return sampleFunction(parsedG.evaluate, xMin, xMax, SAMPLE_COUNT);
  }, [compareMode, parsedG, xMin, xMax]);

  const analysis = useMemo(() => {
    if (!parsedF.ok || samples.length === 0) return null;
    return analyzeSamples(samples, parsedF.evaluate);
  }, [parsedF, samples]);

  const compareInfo = useMemo(() => {
    if (!compareMode || !parsedF.ok || !parsedG || !parsedG.ok) return null;
    return findIntersections(parsedF.evaluate, parsedG.evaluate, xMin, xMax, SAMPLE_COUNT);
  }, [compareMode, parsedF, parsedG, xMin, xMax]);

  const activeSpoken = liveMessage || (compareInfo ? compareInfo.summary : analysis?.description) || '';

  const stopAll = useCallback(() => {
    engineRef.current?.stop();
    stopSpeech();
    setIsPlaying(false);
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      stopAll();
      return;
    }
    if (!parsedF.ok || samples.length === 0) return;

    setStepIndex(null);
    setIsPlaying(true);

    if (compareInfo) {
      setLiveMessage(compareInfo.summary);
      if (settings.speakDescriptions) speakText(compareInfo.summary);
    } else if (analysis) {
      setLiveMessage(analysis.description);
    }

    engineRef.current?.playSweep({
      samples,
      compareSamples,
      zeros: analysis?.zeros ?? [],
      intersections: compareInfo?.intersections ?? [],
      xMin,
      xMax,
      minFreq: settings.minFreq,
      maxFreq: settings.maxFreq,
      durationSec: settings.durationSec,
      zeroClick: settings.zeroClick,
      stereoPan: settings.stereoPan,
      derivativeMode,
      onProgress: (frac) => setCursorFraction(frac),
      onComplete: () => {
        setIsPlaying(false);
      },
    });
  }, [
    isPlaying,
    stopAll,
    parsedF.ok,
    samples,
    compareInfo,
    analysis,
    compareSamples,
    xMin,
    xMax,
    settings,
    derivativeMode,
  ]);

  const handleDescribe = useCallback(() => {
    if (!analysis) return;
    const text = compareInfo ? `${analysis.description} ${compareInfo.summary}` : analysis.description;
    setLiveMessage(text);
    if (settings.speakDescriptions) {
      speakText(text);
    }
  }, [analysis, compareInfo, settings.speakDescriptions]);

  const stepTo = useCallback(
    (nextIdx: number) => {
      if (samples.length === 0) return;
      stopAll();
      const clamped = Math.max(0, Math.min(samples.length - 1, nextIdx));
      setStepIndex(clamped);
      setCursorFraction(clamped / (samples.length - 1));

      const s = samples[clamped];
      const msg = formatStepAnnouncement(s);
      setLiveMessage(msg);
      if (settings.speakDescriptions) speakText(msg);

      const validYs = samples.map((p) => p.y).filter((y): y is number => y !== null);
      const minVal = validYs.length ? Math.min(...validYs) : -1;
      const maxVal = validYs.length ? Math.max(...validYs) : 1;

      engineRef.current?.playPointTone(
        s,
        minVal,
        maxVal,
        xMin,
        xMax,
        settings.minFreq,
        settings.maxFreq,
        settings.stereoPan
      );
    },
    [samples, stopAll, settings, xMin, xMax]
  );

  const handleStepButton = useCallback(() => {
    if (stepIndex === null) {
      stepTo(Math.floor(samples.length / 2));
    } else {
      stepTo(stepIndex + 5 < samples.length ? stepIndex + 5 : 0);
    }
  }, [stepIndex, samples.length, stepTo]);

  // Global keyboard shortcuts: Space = play/stop, Left/Right = step, D = describe
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isEditing) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const base = stepIndex === null ? 0 : stepIndex + 4;
        stepTo(base);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const base = stepIndex === null ? Math.floor(samples.length / 2) : stepIndex - 4;
        stepTo(base);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleDescribe();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePlayToggle, handleDescribe, stepIndex, samples.length, stepTo]);

  const selectPreset = (presetExpr: string) => {
    stopAll();
    setCsvMode(false);
    setExpr(presetExpr);
    setSearchParams({ eq: presetExpr }, { replace: true });
    setStepIndex(null);
    setCursorFraction(null);
    setLiveMessage('');
  };

  const loadLesson = (idx: number) => {
    stopAll();
    const lesson = LESSONS[idx];
    setActiveLessonIdx(idx);
    setSelectedOption(null);
    setLessonFeedback('');
    setCsvMode(false);
    setCompareMode(false);
    setExpr(lesson.expr);
    setXMinStr(String(lesson.xMin));
    setXMaxStr(String(lesson.xMax));
    setStepIndex(null);
    setCursorFraction(null);
    setLiveMessage(lesson.teaching);
  };

  const answerLesson = (optIdx: number) => {
    const lesson = LESSONS[activeLessonIdx];
    setSelectedOption(optIdx);
    const correct = optIdx === lesson.correctIndex;
    const msg = correct ? lesson.feedbackCorrect : lesson.feedbackWrong;
    setLessonFeedback(msg);
    setLiveMessage(msg);
    if (settings.speakDescriptions) speakText(msg);

    if (correct && !completedLessons.includes(lesson.id)) {
      const next = [...completedLessons, lesson.id];
      setCompletedLessons(next);
      saveCompletedLessons(next);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const plotAriaLabel = analysis
    ? `Graph of ${csvMode ? 'CSV data' : `f of x equals ${expr}`} from x equals ${xMin} to ${xMax}. ${analysis.description}`
    : 'Graph plot area';

  const currentLesson = LESSONS[activeLessonIdx];

  const handleCopyShareLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.pathname = '/app';
      url.searchParams.set('eq', expr);
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setLiveMessage('Could not copy link automatically. Copy the URL from your address bar.');
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#player-main">
        Skip to player
      </a>

      <header className="app-header">
        <Logo />
        <button
          type="button"
          className="btn mobile-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="player-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
        <nav
          id="player-nav"
          aria-label="Player tools"
          className={`header-nav ${menuOpen ? 'open' : ''}`}
        >
          <button
            type="button"
            className={`btn ${showLessons ? 'active' : ''}`}
            aria-expanded={showLessons}
            onClick={() => setShowLessons((v) => !v)}
          >
            Lessons ({completedLessons.length}/{LESSONS.length})
          </button>
          <button
            type="button"
            className={`btn ${compareMode ? 'active' : ''}`}
            aria-pressed={compareMode}
            onClick={() => {
              stopAll();
              setCompareMode((v) => !v);
              setLiveMessage('');
            }}
          >
            Compare f &amp; g
          </button>
          <button
            type="button"
            className={`btn ${settings.darkMode ? 'active' : ''}`}
            aria-pressed={settings.darkMode}
            onClick={() => updateSetting('darkMode', !settings.darkMode)}
          >
            {settings.darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            className={`btn ${settings.highContrast ? 'active' : ''}`}
            aria-pressed={settings.highContrast}
            onClick={() => updateSetting('highContrast', !settings.highContrast)}
          >
            High contrast
          </button>
          <button
            type="button"
            className={`btn ${showSettings ? 'active' : ''}`}
            aria-expanded={showSettings}
            onClick={() => setShowSettings((v) => !v)}
          >
            Settings
          </button>
          <Link className="btn" to="/accessibility">
            Accessibility
          </Link>
        </nav>
      </header>

      <main id="player-main" className="app-main">
        <h1 className="sr-only">Graphsong Function Player</h1>
        <section className="rise" aria-label="Graph workspace">
          <div className="card">
            {!csvMode ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: compareMode ? '1fr 1fr' : '1fr', gap: 14 }}>
                  <div>
                    <label className="field-label" htmlFor="eq-f">
                      f(x) =
                    </label>
                    <input
                      id="eq-f"
                      className="field-input"
                      value={expr}
                      onChange={(e) => {
                        setExpr(e.target.value);
                        setLiveMessage('');
                      }}
                      aria-invalid={!parsedF.ok}
                      aria-describedby={!parsedF.ok ? 'eq-error' : undefined}
                      placeholder="sin(x) * x"
                    />
                  </div>
                  {compareMode && (
                    <div>
                      <label className="field-label" htmlFor="eq-g">
                        g(x) = (right ear)
                      </label>
                      <input
                        id="eq-g"
                        className="field-input"
                        value={exprG}
                        onChange={(e) => {
                          setExprG(e.target.value);
                          setLiveMessage('');
                        }}
                        aria-invalid={parsedG !== null && !parsedG.ok}
                        placeholder="2*x + 3"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="field-label" htmlFor="csv-input">
                  Data table (paste CSV x, y rows)
                </label>
                <textarea
                  id="csv-input"
                  className="field-input"
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  style={{ fontSize: 16 }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
              <div>
                <label className="field-label" htmlFor="x-min">
                  x min
                </label>
                <input
                  id="x-min"
                  type="number"
                  className="field-input-sm"
                  value={xMinStr}
                  onChange={(e) => setXMinStr(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="x-max">
                  x max
                </label>
                <input
                  id="x-max"
                  type="number"
                  className="field-input-sm"
                  value={xMaxStr}
                  onChange={(e) => setXMaxStr(e.target.value)}
                />
              </div>
            </div>

            {rangeError && (
              <div className="error-banner" role="alert" aria-live="assertive">
                {rangeError}
              </div>
            )}
            {!parsedF.ok && (
              <div id="eq-error" className="error-banner" role="alert" aria-live="assertive">
                {parsedF.error}
              </div>
            )}
            {compareMode && parsedG && !parsedG.ok && (
              <div className="error-banner" role="alert" aria-live="assertive">
                g(x): {parsedG.error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }} role="group" aria-label="Function presets">
              {PRESETS.map((p) => {
                const isOn = !csvMode && expr.replace(/\s+/g, '') === p.expr.replace(/\s+/g, '');
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`chip ${isOn ? 'on' : ''}`}
                    onClick={() => selectPreset(p.expr)}
                  >
                    {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`chip ${csvMode ? 'on' : ''}`}
                onClick={() => {
                  stopAll();
                  setCsvMode((v) => !v);
                }}
              >
                Paste CSV
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <button
                type="button"
                className="btn p"
                onClick={handlePlayToggle}
                disabled={!parsedF.ok || (compareMode && !!parsedG && !parsedG.ok)}
              >
                {isPlaying ? 'Stop sound' : 'Play sound'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleDescribe}
                disabled={!analysis}
              >
                Describe graph
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleStepButton}
                disabled={samples.length === 0}
              >
                Step through points
              </button>
              <button
                type="button"
                className={`btn ${derivativeMode ? 'teal' : ''}`}
                aria-pressed={derivativeMode}
                onClick={() => {
                  stopAll();
                  setDerivativeMode((v) => !v);
                }}
              >
                Hear the derivative
              </button>
              <button type="button" className="btn" onClick={handleCopyShareLink}>
                {copiedLink ? 'Copied!' : 'Copy link'}
              </button>
            </div>

            {derivativeMode && (
              <p className="mono" style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--teal-dark)' }}>
                Derivative mode on: Flat tone = peak or valley.
              </p>
            )}

            <GraphPlot
              samples={samples}
              compareSamples={compareSamples}
              zeros={analysis?.zeros ?? []}
              intersections={compareInfo?.intersections ?? []}
              xMin={xMin}
              xMax={xMax}
              cursorFraction={cursorFraction}
              ariaLabel={plotAriaLabel}
              drawKey={`${expr}-${xMin}-${xMax}-${csvMode}`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span className="mono" style={{ fontSize: 14 }}>
                x = {formatNum(xMin)}
              </span>
              <span className="mono" style={{ fontSize: 14 }}>
                x = {formatNum(xMax)}
              </span>
            </div>

            <div className="live-banner" role="status" aria-live="polite">
              <b>Spoken:</b> {activeSpoken || 'Enter a valid equation to hear and inspect its shape.'}
            </div>
          </div>

          {showLessons && (
            <section className="card" style={{ marginTop: 24 }} aria-label="Guided lessons">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h2 className="h" style={{ fontSize: 26 }}>
                  Guided lessons
                </h2>
                <span className="mono" style={{ fontSize: 15 }}>
                  Completed {completedLessons.length} of {LESSONS.length}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {LESSONS.map((l, idx) => {
                  const done = completedLessons.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      className={`chip ${activeLessonIdx === idx ? 'on' : ''}`}
                      onClick={() => loadLesson(idx)}
                    >
                      {l.title} {done ? '[done]' : ''}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '2px solid var(--line)' }}>
                <h3 className="h" style={{ fontSize: 22, marginBottom: 8 }}>
                  {currentLesson.title} (<span className="mono">{currentLesson.expr}</span>)
                </h3>
                <p style={{ margin: '0 0 14px' }}>{currentLesson.teaching}</p>
                <button
                  type="button"
                  className="btn p"
                  onClick={() => {
                    loadLesson(activeLessonIdx);
                    setTimeout(() => handlePlayToggle(), 30);
                  }}
                >
                  Load &amp; play lesson
                </button>

                <fieldset style={{ border: '2px solid var(--line)', borderRadius: 4, padding: 16, marginTop: 18 }}>
                  <legend style={{ fontWeight: 700, padding: '0 8px' }}>{currentLesson.question}</legend>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {currentLesson.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        className={`btn ${selectedOption === idx ? 'active' : ''}`}
                        style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px' }}
                        onClick={() => answerLesson(idx)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {lessonFeedback && (
                    <p
                      role="status"
                      aria-live="polite"
                      style={{ margin: '14px 0 0', fontWeight: 700, color: 'var(--teal-dark)' }}
                    >
                      {lessonFeedback}
                    </p>
                  )}
                </fieldset>
              </div>
            </section>
          )}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card rise d1">
            <h2 className="h" style={{ fontSize: 26, marginBottom: 12 }}>
              Key facts
            </h2>
            {analysis ? (
              <div>
                <div className="key-row">
                  <b>Zeros</b>
                  <span className="mono">
                    {analysis.zeros.length === 0
                      ? 'none'
                      : analysis.zeros.slice(0, 6).map((z) => formatNum(z)).join(', ')}
                  </span>
                </div>
                <div className="key-row">
                  <b>Maximum</b>
                  <span className="mono">
                    {analysis.globalMax
                      ? `${formatNum(analysis.globalMax.y)} at x = ${formatNum(analysis.globalMax.x)}`
                      : 'none'}
                  </span>
                </div>
                <div className="key-row">
                  <b>Minimum</b>
                  <span className="mono">
                    {analysis.globalMin
                      ? `${formatNum(analysis.globalMin.y)} at x = ${formatNum(analysis.globalMin.x)}`
                      : 'none'}
                  </span>
                </div>
                <div className="key-row">
                  <b>Trend</b>
                  <span className="mono">{analysis.trend}</span>
                </div>
                {analysis.undefinedAt.length > 0 && (
                  <div className="key-row">
                    <b>Breaks</b>
                    <span className="mono">near x = {analysis.undefinedAt.slice(0, 3).map((u) => formatNum(u)).join(', ')}</span>
                  </div>
                )}
                {compareInfo && (
                  <div className="key-row">
                    <b>Crossings</b>
                    <span className="mono">
                      {compareInfo.intersections.length === 0
                        ? 'none'
                        : compareInfo.intersections.slice(0, 4).map((c) => `x = ${formatNum(c)}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0 }}>Enter a valid function to compute key facts.</p>
            )}
          </div>

          <div className="card rise d2">
            <h2 className="h" style={{ fontSize: 26, marginBottom: 12 }}>
              Sound settings
            </h2>
            <div className="kv-grid">
              <b>Pitch range</b>
              <span className="mono">
                {settings.minFreq} – {settings.maxFreq} Hz
              </span>
              <b>Duration</b>
              <span className="mono">{settings.durationSec} seconds</span>
              <b>Zero click</b>
              <span className="mono">{settings.zeroClick ? 'on' : 'off'}</span>
              <b>Stereo pan</b>
              <span className="mono">{compareMode ? 'f left · g right' : settings.stereoPan ? 'follows x' : 'center'}</span>
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 16 }}>
              <b>Keys:</b> Space play · ← → step · D describe
            </p>

            {showSettings && (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '2px solid var(--line)', display: 'grid', gap: 14 }}>
                <div>
                  <label className="field-label" htmlFor="set-min-hz">
                    Min pitch (Hz): {settings.minFreq}
                  </label>
                  <input
                    id="set-min-hz"
                    type="range"
                    min={100}
                    max={400}
                    step={20}
                    value={settings.minFreq}
                    onChange={(e) => updateSetting('minFreq', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="set-max-hz">
                    Max pitch (Hz): {settings.maxFreq}
                  </label>
                  <input
                    id="set-max-hz"
                    type="range"
                    min={600}
                    max={2000}
                    step={50}
                    value={settings.maxFreq}
                    onChange={(e) => updateSetting('maxFreq', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="set-dur">
                    Sweep duration (seconds): {settings.durationSec}
                  </label>
                  <input
                    id="set-dur"
                    type="range"
                    min={2}
                    max={10}
                    step={0.5}
                    value={settings.durationSec}
                    onChange={(e) => updateSetting('durationSec', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.zeroClick}
                    onChange={(e) => updateSetting('zeroClick', e.target.checked)}
                    style={{ width: 22, height: 22 }}
                  />
                  <span>Click at zero crossings</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.stereoPan}
                    onChange={(e) => updateSetting('stereoPan', e.target.checked)}
                    style={{ width: 22, height: 22 }}
                  />
                  <span>Stereo pan follows x</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.speakDescriptions}
                    onChange={(e) => updateSetting('speakDescriptions', e.target.checked)}
                    style={{ width: 22, height: 22 }}
                  />
                  <span>Speak descriptions aloud</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    style={{ width: 22, height: 22 }}
                  />
                  <span>Reduced motion</span>
                </label>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setConfirmResetOpen(true)}
                >
                  Reset settings &amp; progress
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      <ConfirmModal
        open={confirmResetOpen}
        title="Reset settings and progress?"
        message="This clears your saved sound settings, theme preferences, and completed lesson badges from this browser."
        confirmLabel="Reset everything"
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          resetAllStorage();
          onUpdateSettings(DEFAULT_SETTINGS);
          setCompletedLessons([]);
          setConfirmResetOpen(false);
          setLiveMessage('Settings and lesson progress have been reset.');
        }}
      />
    </div>
  );
}
