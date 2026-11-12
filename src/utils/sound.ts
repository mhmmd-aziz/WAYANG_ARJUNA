/**
 * Web Audio API sound synthesizer combining traditional gamelan accents
 * with cinematic action sound effects (whoosh, slash, block clang, impact, fanfare).
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  private lastWhooshAt = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    durationSec: number,
    delaySec = 0,
    gainPeak = 0.12,
    type: OscillatorType = 'triangle',
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, endFreq),
        now + durationSec
      );
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  /** Pelog-inspired pentatonic chime on hand detection or step progress */
  playStepSuccess(): void {
    this.playTone(523.25, 0.22, 0, 0.11, 'triangle');
    this.playTone(659.25, 0.26, 0.09, 0.12, 'triangle');
    this.playTone(783.99, 0.35, 0.18, 0.13, 'sine');
  }

  /** Warm celebration chord on level completion */
  playLevelComplete(): void {
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.45, idx * 0.1, 0.11, 'triangle');
    });
  }

  /** Gentle click when selecting a character or button */
  playSelect(): void {
    this.playTone(440, 0.1, 0, 0.07, 'sine');
  }

  /** Soft low wooden knock for error / timeout */
  playTryAgain(): void {
    this.playTone(220, 0.2, 0, 0.09, 'sine');
    this.playTone(196, 0.25, 0.12, 0.08, 'sine');
  }

  /** Cinematic movement air-whoosh synced with fast hand velocity */
  playWhoosh(intensity = 0.7): void {
    const nowMs = performance.now();
    if (nowMs - this.lastWhooshAt < 220) return;
    this.lastWhooshAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.22;
    const source = ctx.createBufferSource();
    source.buffer = this.getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.8, now);
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(
      1100 + intensity * 650,
      now + 0.08
    );
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    const gain = ctx.createGain();
    const peak = Math.min(0.22, 0.08 + intensity * 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  /** Sharp melee swing + traditional keprak snap */
  playAttackSlash(): void {
    this.playWhoosh(1.0);
    this.playTone(620, 0.14, 0, 0.09, 'sawtooth', 180);
    this.playTone(920, 0.08, 0.02, 0.07, 'square', 340);
  }

  /** Mystical bow/energy Jurus Pusaka launch sound */
  playSpecialJurus(): void {
    this.playWhoosh(0.95);
    this.playTone(330, 0.28, 0, 0.12, 'triangle', 980);
    this.playTone(660, 0.34, 0.04, 0.1, 'sine', 1320);
    this.playTone(130, 0.25, 0, 0.14, 'sine', 65);
  }

  /** Heavy movie punch / kendang drum impact when attack connects */
  playHitImpact(isHeavy = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Low kendang/sub punch
    this.playTone(isHeavy ? 145 : 175, isHeavy ? 0.28 : 0.18, 0, isHeavy ? 0.24 : 0.17, 'sine', 42);
    this.playTone(isHeavy ? 290 : 340, 0.12, 0, 0.11, 'triangle', 85);

    // Crisp transient crack
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isHeavy ? 0.18 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.1);
  }

  /** Metallic shield clang when opponent defends with Closed Fist */
  playBlockClang(): void {
    this.playTone(880, 0.22, 0, 0.11, 'triangle', 740);
    this.playTone(1320, 0.18, 0.01, 0.08, 'sine', 1180);
    this.playTone(220, 0.12, 0, 0.1, 'sine', 110);
  }

  /** Deep Javanese Gong + victorious gamelan fanfare on battle victory */
  playVictoryFanfare(): void {
    this.playTone(110, 1.3, 0, 0.2, 'sine', 98); // Gong ageng
    this.playTone(220, 1.0, 0, 0.1, 'triangle', 214);
    const melody = [392.0, 493.88, 587.33, 783.99, 987.77];
    melody.forEach((freq, idx) => {
      this.playTone(freq, 0.45, 0.12 + idx * 0.11, 0.11, 'triangle');
    });
  }
}

export const soundEffects = new SoundEffects();
