export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.ambientOscillators = [];
        this.ambientTimers = [];
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Audio not available:', e);
        }
    }

    playAmbient() {
        if (!this.initialized) return;

        // Gentle ambient pad using oscillators
        this.playPad(220, 0.08);
        this.playPad(277.18, 0.06);
        this.playPad(329.63, 0.05);
    }

    playPad(freq, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start();
        this.ambientOscillators.push({ osc, gain });

        // Fade in/out loop
        const loop = () => {
            const now = this.ctx.currentTime;
            gain.gain.linearRampToValueAtTime(volume, now + 3);
            gain.gain.linearRampToValueAtTime(volume * 0.3, now + 6);
            const timerId = setTimeout(loop, 6000);
            this.ambientTimers.push(timerId);
        };
        loop();
    }

    stopAmbient() {
        for (const { osc } of this.ambientOscillators) {
            try { osc.stop(); } catch (_) { /* already stopped */ }
        }
        this.ambientOscillators = [];
        for (const id of this.ambientTimers) {
            clearTimeout(id);
        }
        this.ambientTimers = [];
    }

    playClick() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playInteract() {
        if (!this.initialized) return;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(this.ctx.currentTime + i * 0.08);
            osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
        });
    }

    playQuestComplete() {
        if (!this.initialized) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(this.ctx.currentTime + i * 0.12);
            osc.stop(this.ctx.currentTime + i * 0.12 + 0.5);
        });
    }

    playPickup() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440;
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
        gain.gain.value = 0.12;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    setMasterVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
}
