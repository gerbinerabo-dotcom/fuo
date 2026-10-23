import confetti from 'canvas-confetti';

export function fireVictoryConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10B981', '#34D399', '#FBBF24'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#60A5FA', '#3B82F6', '#93C5FD'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#F59E0B', '#10B981', '#EC4899'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function fireChestGems() {
  confetti({
    particleCount: 60,
    angle: 90,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#38BDF8', '#818CF8', '#FBBF24', '#34D399'],
    zIndex: 9999,
  });
}

