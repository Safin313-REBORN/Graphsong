import type { SamplePoint } from './mathEngine';

export interface SonifyOptions {
  samples: SamplePoint[];
  compareSamples?: SamplePoint[];
  zeros?: number[];
  intersections?: number[];
  xMin: number;
  xMax: number;
  minFreq: number;
  maxFreq: number;
  durationSec: number;
  zeroClick: boolean;
  stereoPan: boolean;
  derivativeMode: boolean;
  onProgress: (fraction: number) => void;
  onComplete: () => void;
}

export function mapValueToFreq(
  val: number,
  minVal: number,
  maxVal: number,
  minFreq: number,
  maxFreq: number
): number {
  const safeMin = Math.max(40, minFreq);
  const safeMax = Math.max(safeMin + 40, maxFreq);
  const t = maxVal <= minVal ? 0.5 : Math.min(1, Math.max(0, (val - minVal) / (maxVal - minVal)));
  return safeMin * Math.pow(safeMax / safeMin, t);
}

export function speakText(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speech errors
  }
}

export function stopSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}

export class GraphAudioEngine {
  private ctx: AudioContext | null = null;
  private rafId: number | null = null;
  private stopTimer: number | null = null;
  private activeNodes: AudioNode[] = [];
  private activeOscs: OscillatorNode[] = [];
  private playing = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public stop(): void {
    this.playing = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    for (const osc of this.activeOscs) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    }
    for (const node of this.activeNodes) {
      try {
        node.disconnect();
      } catch {
        // Ignore
      }
    }
    this.activeOscs = [];
    this.activeNodes = [];
  }

  private scheduleClick(ctx: AudioContext, atTime: number, panValue: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, atTime);
    osc.frequency.exponentialRampToValueAtTime(620, atTime + 0.035);

    gain.gain.setValueAtTime(0.0001, atTime);
    gain.gain.linearRampToValueAtTime(0.22, atTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, atTime + 0.045);

    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panValue)), atTime);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start(atTime);
    osc.stop(atTime + 0.05);
    this.activeOscs.push(osc);
    this.activeNodes.push(gain, panner);
  }

  private scheduleIntersectionChime(ctx: AudioContext, atTime: number): void {
    const freqs = [880, 1174.66]; // A5 -> D6 two-tone chime
    freqs.forEach((freq, idx) => {
      const start = atTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.15);
      this.activeOscs.push(osc);
      this.activeNodes.push(gain);
    });
  }

  public playPointTone(
    sample: SamplePoint,
    minVal: number,
    maxVal: number,
    xMin: number,
    xMax: number,
    minFreq: number,
    maxFreq: number,
    stereoPan: boolean
  ): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    const tX = xMax <= xMin ? 0.5 : (sample.x - xMin) / (xMax - xMin);
    const pan = stereoPan ? -0.8 + tX * 1.6 : 0;
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);

    if (sample.y === null) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(92, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    } else {
      osc.type = 'sine';
      const freq = mapValueToFreq(sample.y, minVal, maxVal, minFreq, maxFreq);
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    }

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playSweep(opts: SonifyOptions): void {
    this.stop();
    const {
      samples,
      compareSamples,
      zeros = [],
      intersections = [],
      xMin,
      xMax,
      minFreq,
      maxFreq,
      durationSec,
      zeroClick,
      stereoPan,
      derivativeMode,
      onProgress,
      onComplete,
    } = opts;

    if (samples.length < 2) {
      onComplete();
      return;
    }

    let ctx: AudioContext;
    try {
      ctx = this.ensureContext();
    } catch {
      onComplete();
      return;
    }
    this.playing = true;
    const startTime = ctx.currentTime + 0.04;
    const n = samples.length;

    const getVal = (s: SamplePoint): number | null => (derivativeMode ? s.slope : s.y);

    const allVals: number[] = [];
    for (const s of samples) {
      const v = getVal(s);
      if (v !== null) allVals.push(v);
    }
    if (compareSamples) {
      for (const s of compareSamples) {
        const v = getVal(s);
        if (v !== null) allVals.push(v);
      }
    }

    let minVal = allVals.length ? Math.min(...allVals) : -1;
    let maxVal = allVals.length ? Math.max(...allVals) : 1;

    if (derivativeMode) {
      // Center 0 slope at the geometric midpoint so flat = steady middle tone
      const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal), 1);
      minVal = -maxAbs;
      maxVal = maxAbs;
    } else if (Math.abs(maxVal - minVal) < 1e-6) {
      minVal -= 1;
      maxVal += 1;
    }

    const setupVoice = (
      voiceSamples: SamplePoint[],
      oscType: OscillatorType,
      fixedPan: number | null,
      volume: number
    ) => {
      const osc = ctx.createOscillator();
      const undefOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      const undefGain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.type = oscType;
      undefOsc.type = 'triangle';
      undefOsc.frequency.setValueAtTime(92, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      undefGain.gain.setValueAtTime(0.0001, startTime);

      for (let i = 0; i < voiceSamples.length; i++) {
        const t = startTime + (i / (n - 1)) * durationSec;
        const s = voiceSamples[i];
        const v = getVal(s);

        const pan = fixedPan !== null ? fixedPan : stereoPan ? -0.85 + (i / (n - 1)) * 1.7 : 0;
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);

        if (v === null) {
          gain.gain.setValueAtTime(0.0001, t);
          undefGain.gain.setValueAtTime(volume * 0.6, t);
        } else {
          const freq = mapValueToFreq(v, minVal, maxVal, minFreq, maxFreq);
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(volume, t);
          undefGain.gain.setValueAtTime(0.0001, t);
        }
      }

      const endTime = startTime + durationSec;
      gain.gain.linearRampToValueAtTime(0.0001, endTime + 0.04);
      undefGain.gain.linearRampToValueAtTime(0.0001, endTime + 0.04);

      osc.connect(gain);
      undefOsc.connect(undefGain);
      gain.connect(panner);
      undefGain.connect(panner);
      panner.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime + 0.05);
      undefOsc.start(startTime);
      undefOsc.stop(endTime + 0.05);

      this.activeOscs.push(osc, undefOsc);
      this.activeNodes.push(gain, undefGain, panner);
    };

    if (compareSamples && compareSamples.length === samples.length) {
      setupVoice(samples, 'sine', -0.85, 0.14);
      setupVoice(compareSamples, 'triangle', 0.85, 0.14);

      for (const ix of intersections) {
        const frac = (ix - xMin) / (xMax - xMin);
        if (frac >= 0 && frac <= 1) {
          this.scheduleIntersectionChime(ctx, startTime + frac * durationSec);
        }
      }
    } else {
      setupVoice(samples, 'sine', null, 0.18);

      if (zeroClick && !derivativeMode) {
        for (const zx of zeros) {
          const frac = (zx - xMin) / (xMax - xMin);
          if (frac >= 0 && frac <= 1) {
            const pan = stereoPan ? -0.85 + frac * 1.7 : 0;
            this.scheduleClick(ctx, startTime + frac * durationSec, pan);
          }
        }
      }
    }

    const tick = () => {
      if (!this.playing || !this.ctx) return;
      const elapsed = this.ctx.currentTime - startTime;
      const frac = Math.min(1, Math.max(0, elapsed / durationSec));
      onProgress(frac);
      if (frac < 1) {
        this.rafId = requestAnimationFrame(tick);
      }
    };

    this.rafId = requestAnimationFrame(tick);

    this.stopTimer = window.setTimeout(() => {
      this.stop();
      onProgress(1);
      onComplete();
    }, (durationSec + 0.08) * 1000);
  }
}
