/**
 * AudioSystem - Complete audio management for the game
 * Handles background music, sound effects, and volume control
 */
export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        
        this.currentMusic = null;
        this.musicSource = null;
        this.sounds = new Map();
        this.musicLoaded = false;
        
        // Initialize audio context on first user interaction
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Connect gain chain
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.masterGain.gain.value = this.masterVolume;
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            
            // Generate procedural sounds
            await this.generateSounds();
            
            this.initialized = true;
            console.log('AudioSystem initialized');
        } catch (error) {
            console.warn('AudioSystem failed to initialize:', error);
        }
    }
    
    /**
     * Generate procedural sounds using Web Audio API
     * No external audio files needed!
     */
    async generateSounds() {
        // Click sound
        this.sounds.set('click', this.createClickSound());
        
        // Menu open/close
        this.sounds.set('menuOpen', this.createMenuSound(true));
        this.sounds.set('menuClose', this.createMenuSound(false));
        
        // Success/completion sound
        this.sounds.set('success', this.createSuccessSound());
        
        // Quest complete fanfare
        this.sounds.set('questComplete', this.createQuestCompleteSound());
        
        // Walking footstep
        this.sounds.set('footstep', this.createFootstepSound());
        
        // Dialogue blip
        this.sounds.set('dialogueBlip', this.createDialogueBlip());
        
        // Area transition whoosh
        this.sounds.set('transition', this.createTransitionSound());
        
        // Notification ping
        this.sounds.set('notification', this.createNotificationSound());
        
        // Item pickup
        this.sounds.set('pickup', this.createPickupSound());
        
        // Pet happy sound
        this.sounds.set('petHappy', this.createPetHappySound());
        
        // Achievement unlock
        this.sounds.set('achievement', this.createAchievementSound());
    }
    
    createClickSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.05);
        };
    }
    
    createMenuSound(isOpen) {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            if (isOpen) {
                osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            } else {
                osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            }
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createSuccessSound() {
        return () => {
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            const duration = 0.15;
            
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + (i * duration);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(startTime);
                osc.stop(startTime + duration);
            });
        };
    }
    
    createQuestCompleteSound() {
        return () => {
            const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
            const duration = 0.2;
            
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'triangle';
                osc2.type = 'sine';
                osc.frequency.value = freq;
                osc2.frequency.value = freq * 2;
                
                const startTime = this.audioContext.currentTime + (i * duration * 0.5);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(startTime);
                osc2.start(startTime);
                osc.stop(startTime + duration);
                osc2.stop(startTime + duration);
            });
        };
    }
    
    createFootstepSound() {
        return () => {
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
            }
            
            noise.buffer = buffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = 0.15;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            
            noise.start();
        };
    }
    
    createDialogueBlip() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = 440 + Math.random() * 100;
            
            gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.03);
        };
    }
    
    createTransitionSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createNotificationSound() {
        return () => {
            const notes = [880, 1108.73]; // A5, C#6
            
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + (i * 0.1);
                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(startTime);
                osc.stop(startTime + 0.15);
            });
        };
    }
    
    createPickupSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.15);
        };
    }
    
    createPetHappySound() {
        return () => {
            const notes = [523.25, 659.25, 523.25, 783.99];
            
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + (i * 0.08);
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(startTime);
                osc.stop(startTime + 0.08);
            });
        };
    }
    
    createAchievementSound() {
        return () => {
            // Grand fanfare
            const notes = [
                { freq: 523.25, time: 0, dur: 0.15 },     // C5
                { freq: 659.25, time: 0.15, dur: 0.15 },  // E5
                { freq: 783.99, time: 0.3, dur: 0.15 },   // G5
                { freq: 1046.50, time: 0.45, dur: 0.4 },  // C6

            ];
            
            notes.forEach(({ freq, time, dur }) => {
                const osc = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'triangle';
                osc2.type = 'sine';
                osc.frequency.value = freq;
                osc2.frequency.value = freq * 1.5;
                
                const startTime = this.audioContext.currentTime + time;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.35, startTime + 0.05);
                gain.gain.setValueAtTime(0.35, startTime + dur - 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
                
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(startTime);
                osc2.start(startTime);
                osc.stop(startTime + dur);
                osc2.stop(startTime + dur);
            });
        };
    }
    
    /**
     * Generate and play procedural background music
     */
    playBackgroundMusic() {
        if (!this.initialized || !this.audioContext) return;
        
        this.stopBackgroundMusic();
        
        // Create a simple ambient music loop
        const playLoop = () => {
            if (!this.currentMusic) return;
            
            const baseFreq = 220; // A3
            const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale intervals
            
            // Pad/drone
            const createPad = () => {
                const osc1 = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                const noteIndex = Math.floor(Math.random() * 4);
                const freq = baseFreq * Math.pow(2, scale[noteIndex] / 12);
                
                osc1.type = 'sine';
                osc2.type = 'triangle';
                osc1.frequency.value = freq;
                osc2.frequency.value = freq * 1.5;
                
                filter.type = 'lowpass';
                filter.frequency.value = 800;
                filter.Q.value = 1;
                
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 1);
                gain.gain.setValueAtTime(0.08, this.audioContext.currentTime + 3);
                gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
                
                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);
                
                osc1.start();
                osc2.start();
                osc1.stop(this.audioContext.currentTime + 4);
                osc2.stop(this.audioContext.currentTime + 4);
            };
            
            // Melodic notes
            const playMelody = () => {
                const noteIndex = Math.floor(Math.random() * scale.length);
                const freq = baseFreq * 2 * Math.pow(2, scale[noteIndex] / 12);
                
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + Math.random() * 2;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(startTime);
                osc.stop(startTime + 1);
            };
            
            createPad();
            for (let i = 0; i < 3; i++) {
                playMelody();
            }
        };
        
        this.currentMusic = true;
        playLoop();
        this.musicInterval = setInterval(playLoop, 3500);
    }
    
    stopBackgroundMusic() {
        this.currentMusic = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
    
    /**
     * Play a sound effect by name
     */
    play(soundName) {
        if (!this.initialized || this.isMuted) return;
        
        const sound = this.sounds.get(soundName);
        if (sound) {
            try {
                sound();
            } catch (e) {
                console.warn('Failed to play sound:', soundName, e);
            }
        }
    }
    
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
        }
        return this.isMuted;
    }
    
    toggleMusic() {
        if (this.currentMusic) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.currentMusic;
    }
    
    getState() {
        return {
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted,
            musicPlaying: this.currentMusic
        };
    }
    
    setState(state) {
        if (state.masterVolume !== undefined) this.setMasterVolume(state.masterVolume);
        if (state.musicVolume !== undefined) this.setMusicVolume(state.musicVolume);
        if (state.sfxVolume !== undefined) this.setSFXVolume(state.sfxVolume);
        if (state.isMuted !== undefined) this.isMuted = state.isMuted;
        if (state.musicPlaying && !this.currentMusic) this.playBackgroundMusic();
    }
}

// Export singleton instance
export const audioSystem = new AudioSystem();
