import { soundEffects } from './sound';

export interface AntawacanaVoiceProfile {
  pitch: number;
  rate: number;
}

const VOICE_PROFILES: Record<string, AntawacanaVoiceProfile> = {
  'Ki Dalang': { pitch: 0.86, rate: 0.92 },
  'Raden Arjuna': { pitch: 1.02, rate: 0.96 },
  'Raden Gatotkaca': { pitch: 0.72, rate: 0.9 },
  'Dewi Srikandi': { pitch: 1.24, rate: 0.98 },
  'Ki Lurah Semar': { pitch: 0.78, rate: 0.88 },
  'Timun Mas': { pitch: 1.28, rate: 0.98 },
  'Buto Ijo': { pitch: 0.62, rate: 0.84 },
  'Roro Jonggrang': { pitch: 1.2, rate: 0.95 },
  'Bandung Bondowoso': { pitch: 0.76, rate: 0.9 },
};

function selectIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('id')) ??
    voices.find((v) => v.lang.toLowerCase().includes('ms')) ??
    voices[0]
  );
}

/**
 * Web Speech API + Web Audio gamelan narrator for Wayang Antawacana & Dalang storytelling.
 * Audio runs asynchronously alongside manual hand-tracking control without overriding it.
 */
class StoryAudioEngine {
  private speaking = false;
  private onStateChange: ((speaking: boolean, speaker: string | null) => void) | null =
    null;

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }

  setListener(
    cb: ((speaking: boolean, speaker: string | null) => void) | null
  ): void {
    this.onStateChange = cb;
  }

  isSpeaking(): boolean {
    return this.speaking;
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    if (this.speaking) {
      this.speaking = false;
      this.onStateChange?.(false, null);
    }
  }

  /**
   * Speaks Ki Dalang narration followed by character antawacana line if present.
   */
  speakScene(params: {
    narration: string;
    speaker?: string;
    dialogue?: string;
    playSceneCue?: boolean;
  }): void {
    this.stop();
    if (soundEffects.isMuted()) {
      return;
    }

    if (params.playSceneCue !== false) {
      soundEffects.playKeprakSceneCue();
    }

    if (!this.isSupported()) {
      return;
    }

    const lines: Array<{ text: string; speaker: string }> = [
      { text: params.narration, speaker: 'Ki Dalang' },
    ];
    if (params.dialogue && params.dialogue.trim().length > 0) {
      lines.push({
        text: params.dialogue,
        speaker: params.speaker ?? 'Raden Arjuna',
      });
    }

    const voice = selectIndonesianVoice();

    const speakNext = (index: number) => {
      if (index >= lines.length || soundEffects.isMuted()) {
        this.speaking = false;
        this.onStateChange?.(false, null);
        return;
      }

      const item = lines[index];
      const profile = VOICE_PROFILES[item.speaker] ?? { pitch: 0.94, rate: 0.94 };
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'id-ID';
      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = 0.95;

      utterance.onstart = () => {
        this.speaking = true;
        this.onStateChange?.(true, item.speaker);
      };
      utterance.onend = () => {
        speakNext(index + 1);
      };
      utterance.onerror = () => {
        this.speaking = false;
        this.onStateChange?.(false, null);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Slight offset so the keprak cue finishes before voice starts
    window.setTimeout(() => {
      if (!soundEffects.isMuted()) {
        speakNext(0);
      }
    }, 340);
  }
}

export const storyAudio = new StoryAudioEngine();

