/**
 * Procedural Sound Engine for EDEN
 * Generates all sounds using Web Audio API (no external files)
 */

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.3;

  init() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioContext.destination);
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  private ensureContext() {
    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext?.resume();
    }
  }

  // ==================== CLICK SOUNDS ====================

  playClick() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playSelect() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playDeselect() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // ==================== CITIZEN SOUNDS ====================

  playCitizenSpawn() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, this.audioContext!.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, this.audioContext!.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + i * 0.1 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.audioContext!.currentTime + i * 0.1);
      osc.stop(this.audioContext!.currentTime + i * 0.1 + 0.2);
    });
  }

  playCitizenMove() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.08);
  }

  playCitizenThink() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(494, this.audioContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(523, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.35);
  }

  playCitizenTalk() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Create speech-like sound
    const duration = 0.3;
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(150 + Math.random() * 50, this.audioContext.currentTime);
    osc1.frequency.linearRampToValueAtTime(200 + Math.random() * 50, this.audioContext.currentTime + duration);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(120 + Math.random() * 30, this.audioContext.currentTime);

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(this.audioContext.currentTime);
    osc2.start(this.audioContext.currentTime);
    osc1.stop(this.audioContext.currentTime + duration);
    osc2.stop(this.audioContext.currentTime + duration);
  }

  // ==================== ACTION SOUNDS ====================

  playEat() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Crunch sound
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + i * 0.08 + 0.05);

      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.08 + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.audioContext.currentTime + i * 0.08);
      osc.stop(this.audioContext.currentTime + i * 0.08 + 0.05);
    }
  }

  playSleep() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Soft snoring sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 100;

    lfo.type = 'sine';
    lfo.frequency.value = 2;

    lfoGain.gain.value = 30;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(this.audioContext.currentTime);
    osc.start(this.audioContext.currentTime);
    lfo.stop(this.audioContext.currentTime + 1);
    osc.stop(this.audioContext.currentTime + 1);
  }

  playWork() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Hammer-like sound
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(300, this.audioContext.currentTime + i * 0.15);
      osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + i * 0.15 + 0.03);

      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.audioContext.currentTime + i * 0.15);
      osc.stop(this.audioContext.currentTime + i * 0.15 + 0.05);
    }
  }

  playBuild() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Construction sound
    const notes = [220, 277, 330, 440];

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, this.audioContext!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + i * 0.1 + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.audioContext!.currentTime + i * 0.1);
      osc.stop(this.audioContext!.currentTime + i * 0.1 + 0.15);
    });
  }

  // ==================== ENVIRONMENT SOUNDS ====================

  playWater() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Water splash
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(this.audioContext.currentTime);
  }

  playWind() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    // Wind sound
    const duration = 1;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.5;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(this.audioContext.currentTime);
  }

  // ==================== UI SOUNDS ====================

  playHover() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1200;

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  playSuccess() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, this.audioContext!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + i * 0.1 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.audioContext!.currentTime + i * 0.1);
      osc.stop(this.audioContext!.currentTime + i * 0.1 + 0.2);
    });
  }

  playError() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  // ==================== NOTIFICATION SOUNDS ====================

  playNotification() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(1100, this.audioContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.35);
  }

  playAlert() {
    this.ensureContext();
    if (!this.audioContext || !this.masterGain) return;

    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.value = 800;

      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.audioContext.currentTime + i * 0.15);
      osc.stop(this.audioContext.currentTime + i * 0.15 + 0.1);
    }
  }
}

// Singleton instance
export const soundEngine = new SoundEngine();

// Initialize on first user interaction
export function initSound() {
  soundEngine.init();
}
