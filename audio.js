/* Utilitas penyimpanan, polyfill kanvas, dan sistem suara */
/* ================= UTILITAS AMAN (localStorage & Canvas) ================= */
        // localStorage bisa gagal (mode privat, diblokir, penuh) -> jangan sampai aplikasi crash
        const safeLS = {
            get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
            set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* abaikan */ } },
            remove(key) { try { localStorage.removeItem(key); } catch (e) { /* abaikan */ } }
        };
        function parseSaved(key, fallback) {
            try {
                const raw = safeLS.get(key);
                if (!raw) return fallback;
                const parsed = JSON.parse(raw);
                return (Array.isArray(fallback) ? Array.isArray(parsed) : (parsed && typeof parsed === 'object')) ? parsed : fallback;
            } catch (e) {
                return fallback;
            }
        }
        // Polyfill roundRect untuk browser lama (Safari < 16, dsb.)
        if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                r = Math.min(Array.isArray(r) ? r[0] : (r || 0), w / 2, h / 2);
                this.moveTo(x + r, y);
                this.arcTo(x + w, y, x + w, y + h, r);
                this.arcTo(x + w, y + h, x, y + h, r);
                this.arcTo(x, y + h, x, y, r);
                this.arcTo(x, y, x + w, y, r);
                this.closePath();
                return this;
            };
        }

        /* ================= WEB AUDIO SYNTHESIZER SOUND SYSTEM ================= */
        class SoundSystem {
            constructor() {
                this.ctx = null;
                this.isMuted = safeLS.get('vlab_fluid_muted') === 'true';
                this.flowGain = null;
                this.flowOsc = null;
            }

            init() {
                try {
                    if (!this.ctx) {
                        const AC = window.AudioContext || window.webkitAudioContext;
                        if (!AC) return false;
                        this.ctx = new AC();
                    }
                    // Browser memulai AudioContext dalam keadaan "suspended" sampai ada interaksi pengguna
                    if (this.ctx.state === 'suspended') this.ctx.resume();
                    return true;
                } catch (e) {
                    return false;
                }
            }

            playClick() {
                if (this.isMuted || !this.init()) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.05);
            }

            playRecord() {
                if (this.isMuted || !this.init()) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.2);
            }

            playSuccess() {
                if (this.isMuted || !this.init()) return;
                const now = this.ctx.currentTime;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0.15, now + idx * 0.08);
                    gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.15);
                });
            }

            playWrong() {
                if (this.isMuted || !this.init()) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.setValueAtTime(180, now + 0.12);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.25);
            }

            updateWaterFlowSound(isFlowing, Q_value = 0.002) {
                if (this.isMuted || !isFlowing) {
                    if (this.flowGain && this.ctx) {
                        this.flowGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                    }
                    return;
                }
                if (!this.init()) return;
                if (!this.flowGain) {
                    // Create noise node
                    const bufferSize = this.ctx.sampleRate * 2;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;
                    noise.loop = true;

                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 800;

                    this.flowGain = this.ctx.createGain();
                    this.flowGain.gain.value = 0.05;

                    noise.connect(filter);
                    filter.connect(this.flowGain);
                    this.flowGain.connect(this.ctx.destination);
                    noise.start();
                }
                // Pitch scaling with flow rate Q
                const intensity = Math.min(Math.max(Q_value * 100, 0.02), 0.15);
                this.flowGain.gain.linearRampToValueAtTime(intensity, this.ctx.currentTime + 0.1);
            }
        }

        const audio = new SoundSystem();

        function toggleSound() {
            audio.isMuted = !audio.isMuted;
            safeLS.set('vlab_fluid_muted', audio.isMuted);
            updateSoundIcon();
        }

        function updateSoundIcon() {
            const btn = document.getElementById('soundIcon');
            if (audio.isMuted) {
                btn.className = 'fa-solid fa-volume-xmark text-rose-400';
            } else {
                btn.className = 'fa-solid fa-volume-high text-sky-400';
            }
        }
