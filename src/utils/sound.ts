/**
 * Lightweight Web Audio synthesizer producing gentle gamelan-inspired chimes
 * so children get immediate auditory feedback without external audio dependencies.
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted = false;

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
    type: OscillatorType = 'triangle'
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  /** Pelog-inspired pentatonic chime on hand detection or step progress */
  playStepSuccess(): void {
    this.playTone(523.25, 0.22, 0, 0.11, 'triangle'); // C5
    this.playTone(659.25, 0.26, 0.09, 0.12, 'triangle'); // E5
    this.playTone(783.99, 0.35, 0.18, 0.13, 'sine'); // G5
  }

  /** Warm celebration chord on level completion */
  playLevelComplete(): void {
    const notes = [392.0, 493.88, 587.33, 783.99]; // G4 B4 D5 G5
    notes.forEach((n, idx) => {
      this.playTone(n, 0.45, idx * 0.1, 0.11, 'triangle');
    });
  }

  /** Gentle click when selecting a character or button */
  playSelect(): void {
    this.playTone(440, 0.12, 0, 0.08, 'sine');
  }

  /** Soft low wooden knock for error / timeout */
  playTryAgain(): void {
    this.playTone(220, 0.2, 0, 0.09, 'sine');
    this.playTone(196, 0.25, 0.12, 0.08, 'sine');
  }
}

export const soundEffects = new SoundEffects();

