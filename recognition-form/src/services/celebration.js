import confetti from 'canvas-confetti';

// Sound state cache
let audioCtx = null;
let isAudioMuted = false;

export const setCelebrationMuted = (muted) => {
  isAudioMuted = muted;
};

export const getCelebrationMuted = () => isAudioMuted;

/**
 * 🎵 Play a pleasant, royal celebratory chime / fanfare using Web Audio API
 * No external audio files needed; crisp, zero-latency synthesizer.
 */
export const playCelebrationSound = () => {
  if (isAudioMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContext();
    }

    const now = audioCtx.currentTime;
    
    // Melodic notes sequence: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.25 },
      { freq: 659.25, time: 0.08, duration: 0.28 },
      { freq: 783.99, time: 0.16, duration: 0.32 },
      { freq: 1046.50, time: 0.24, duration: 0.65 },
      { freq: 1318.51, time: 0.32, duration: 0.85 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack and decay
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.2, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    // AudioContext autoplay might be blocked before first user gesture
    console.debug('AudioContext not allowed yet:', err);
  }
};

/**
 * 🎆 Refactored Light & Elegant Rocket Celebration
 */
export const launchRocketFireworks = () => {
  const duration = 1.5 * 1000;
  const end = Date.now() + duration;
  const colors = ['#fbbf24', '#fef08a', '#10b981', '#34d399', '#ffffff'];

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    // Single coordinated burst from alternating sides
    const isLeft = Math.random() > 0.5;
    confetti({
      particleCount: 20,
      startVelocity: 35,
      spread: 60,
      origin: { x: isLeft ? 0.1 : 0.9, y: 0.6 },
      colors: colors,
      shapes: ['star', 'circle'],
      scalar: 1.2,
      zIndex: 999999
    });
  }, 400); // Much slower interval (400ms instead of 220ms)
};

/**
 * 🌟 Golden Rain (Lighter version without requestAnimationFrame spam)
 */
export const launchGoldenRain = () => {
  const duration = 1.5 * 1000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 15,
      angle: 90,
      spread: 80,
      origin: { x: 0.5, y: 0 },
      colors: ['#fbbf24', '#fef08a', '#ffffff'],
      shapes: ['star'],
      gravity: 0.8,
      scalar: 1.2,
      zIndex: 999999
    });
  }, 300);
};

/**
 * 🎉 Light & Elegant Full Stage Celebration
 */
export const launchStageCelebration = () => {
  playCelebrationSound();

  // One elegant grand burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.8 },
    colors: ['#fbbf24', '#10b981', '#ffffff'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    zIndex: 999999
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.8 },
    colors: ['#fbbf24', '#10b981', '#ffffff'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    zIndex: 999999
  });

  // Followed by a light rocket & rain sequence
  setTimeout(() => launchRocketFireworks(), 200);
  setTimeout(() => launchGoldenRain(), 600);
};
