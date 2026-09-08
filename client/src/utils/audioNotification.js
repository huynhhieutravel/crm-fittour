// Web Audio API Synthesizer for Real-time Notification Chimes
// Zero external asset dependencies, zero network latency, instant playback

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Auto-unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem('crm_notification_sound_enabled');
  return val === null ? true : val === 'true';
};

export const setSoundEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('crm_notification_sound_enabled', enabled ? 'true' : 'false');
};

export const getSoundVolume = () => {
  if (typeof window === 'undefined') return 0.7;
  const val = localStorage.getItem('crm_notification_sound_volume');
  if (val === null) return 0.7;
  const num = parseFloat(val);
  return isNaN(num) ? 0.7 : Math.max(0, Math.min(1, num));
};

export const setSoundVolume = (volume) => {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0, Math.min(1, volume));
  localStorage.setItem('crm_notification_sound_volume', clamped.toString());
};

/**
 * Phát chuông tin nhắn mới (Dual-tone melodic chime: D5 -> A5)
 * Dành cho tin nhắn Zalo / Messenger từ khách hàng
 */
export const playMessageChime = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterVol = getSoundVolume();

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVol, now);
    masterGain.connect(ctx.destination);

    // Note 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Note 2: 880.00 Hz (A5) - slightly delayed for a pleasant popping chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.46);

    // Subtle harmonic overtone
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(1760.0, now + 0.08); // A6
    gainHarmonic.gain.setValueAtTime(0, now + 0.08);
    gainHarmonic.gain.linearRampToValueAtTime(0.05, now + 0.10);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(masterGain);
    oscHarmonic.start(now + 0.08);
    oscHarmonic.stop(now + 0.36);
  } catch (err) {
    console.warn('[AudioNotification] Lỗi phát âm thanh tin nhắn:', err);
  }
};

/**
 * Phát chuông thông báo Lead mới / Phân công Lead (3-note Arpeggio: C5 -> E5 -> G5)
 */
export const playLeadChime = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterVol = getSoundVolume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVol, now);
    masterGain.connect(ctx.destination);

    const notes = [
      { freq: 523.25, time: 0.00, duration: 0.18 }, // C5
      { freq: 659.25, time: 0.10, duration: 0.20 }, // E5
      { freq: 783.99, time: 0.20, duration: 0.40 }  // G5
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + time);
      osc.stop(now + time + duration + 0.01);
    });
  } catch (err) {
    console.warn('[AudioNotification] Lỗi phát âm thanh Lead:', err);
  }
};
