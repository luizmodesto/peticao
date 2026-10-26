/**
 * Síntese em áudio dos sons característicos da Urna Eletrônica Brasileira
 * Utiliza Web Audio API nativa (sem necessidade de arquivos de áudio externos).
 */

class UrnaAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Beep curto ao pressionar teclas numéricas ou botões
  playKeyBeep() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, this.ctx.currentTime); // Tom clássico de teclado

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  // Som característico de erro/alerta
  playErrorBeep() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Som icônico de encerramento da Urna Eletrônica ("Piiii-pili-pi-piii")
  playConfirmaSound() {
    return new Promise((resolve) => {
      try {
        this.init();
        if (!this.ctx) {
          setTimeout(resolve, 1500);
          return;
        }

        const now = this.ctx.currentTime;
        const freqs = [
          { f: 1250, start: 0, dur: 0.12 },
          { f: 1250, start: 0.16, dur: 0.12 },
          { f: 1250, start: 0.32, dur: 0.12 },
          { f: 1550, start: 0.48, dur: 0.85 }, // O longo "piiiii" final
        ];

        freqs.forEach(({ f, start, dur }) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.35, now + start);
          gain.gain.setValueAtTime(0.35, now + start + dur - 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });

        setTimeout(resolve, 1400);
      } catch (e) {
        console.warn('Audio confirma error:', e);
        setTimeout(resolve, 1400);
      }
    });
  }
}

export const urnaAudio = new UrnaAudio();
