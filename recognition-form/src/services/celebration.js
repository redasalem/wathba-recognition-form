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
 * 🎆 Multi-Rocket High Altitude Fireworks Show (Google Celebration Style)
 * Fires spectacular rockets that burst across the stage screen.
 */
export const launchRocketFireworks = () => {
  const duration = 2.4 * 1000;
  const end = Date.now() + duration;

  // Colors: Luxury Gold, Emerald, Ruby, Electric Amber, Bright Silver
  const colors = ['#fbbf24', '#fef08a', '#10b981', '#34d399', '#f59e0b', '#ffffff', '#ec4899', '#38bdf8'];

  // Interval launcher
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    // Rocket 1: Left launch
    confetti({
      startVelocity: 45,
      spread: 70,
      ticks: 100,
      origin: { x: Math.random() * 0.3 + 0.05, y: Math.random() * 0.4 + 0.4 },
      colors: colors,
      shapes: ['square', 'circle'],
      scalar: 1.15,
      zIndex: 999999
    });

    // Rocket 2: Right launch
    confetti({
      startVelocity: 45,
      spread: 70,
      ticks: 100,
      origin: { x: Math.random() * 0.3 + 0.65, y: Math.random() * 0.4 + 0.4 },
      colors: colors,
      shapes: ['square', 'circle'],
      scalar: 1.15,
      zIndex: 999999
    });

    // Star sparkle bursts in the center
    if (Math.random() > 0.4) {
      confetti({
        particleCount: 25,
        startVelocity: 30,
        spread: 120,
        origin: { x: 0.5, y: 0.35 },
        colors: ['#fbbf24', '#fef08a', '#f59e0b', '#ffffff'],
        shapes: ['star'],
        scalar: 1.3,
        zIndex: 999999
      });
    }
  }, 220);
};

/**
 * 🌟 Golden Star & Emerald Glitter Cascading Rain
 */
export const launchGoldenRain = () => {
  const duration = 2.0 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.1 },
      colors: ['#fbbf24', '#fef08a', '#10b981', '#ffffff'],
      shapes: ['star', 'circle'],
      zIndex: 999999
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.1 },
      colors: ['#fbbf24', '#fef08a', '#10b981', '#ffffff'],
      shapes: ['star', 'circle'],
      zIndex: 999999
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

/**
 * 🎉 Full Stage Grand Celebration (The Ultimate Wow Moment for Student Call)
 * Fires side cannons, star rain, rockets, and sound chime!
 */
export const launchStageCelebration = () => {
  // 1. Play royal fanfare sound
  playCelebrationSound();

  // 2. Immediate massive side cannon bursts
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 75,
    origin: { x: 0.05, y: 0.75 },
    colors: ['#fbbf24', '#10b981', '#f59e0b', '#fef08a', '#ffffff'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    zIndex: 999999
  });

  confetti({
    particleCount: 60,
    angle: 120,
    spread: 75,
    origin: { x: 0.95, y: 0.75 },
    colors: ['#fbbf24', '#10b981', '#f59e0b', '#fef08a', '#ffffff'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    zIndex: 999999
  });

  // 3. Sequential rocket fireworks show
  launchRocketFireworks();

  // 4. Golden starry rain from top
  setTimeout(() => {
    launchGoldenRain();
  }, 400);
};
