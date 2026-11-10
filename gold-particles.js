// A fixed field of tiny gold flecks. Cache the foil shapes so each frame only
// has to place the particles and adjust their individual reflections.
(() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  canvas.className = 'gold-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  document.body.classList.add('has-gold-particles');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = [['#f6b928', '#ffd653'], ['#ffd02c', '#fff094'], ['#ffce31', '#fff4b1']];
  const rotations = 16;
  const sprites = colors.map(([gold, light], tone) => Array.from({length: rotations}, (_, i) => {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 32;
    const paint = tile.getContext('2d');
    paint.translate(16, 16);
    paint.rotate(i * Math.PI * 2 / rotations);
    paint.shadowColor = '#ffc632';
    paint.shadowBlur = tone === 2 ? 6 : 2;
    paint.fillStyle = gold;
    paint.beginPath();
    paint.moveTo(-5.6, -.5); paint.lineTo(1.4, -3.4);
    paint.lineTo(5.6, .5); paint.lineTo(-.7, 3.2);
    paint.closePath(); paint.fill();
    paint.shadowBlur = 0;
    paint.fillStyle = light;
    paint.beginPath();
    paint.moveTo(-5.6, -.5); paint.lineTo(1.4, -3.4);
    paint.lineTo(4.7, .2); paint.lineTo(-2, .4);
    paint.closePath(); paint.fill();
    return tile;
  }));

  let width, height, particles = [], raf = 0, last = 0;
  const random = (min, max) => min + Math.random() * (max - min);
  function resize() {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(1150, Math.min(3800, Math.round(width * height / 265)));
    particles = Array.from({length: count}, (_, i) => {
      const lower = i < count * .77;
      const size = .66 + 2.39 * Math.random() ** 2.7;
      return {
        x: random(0, width), y: lower ? height * (.43 + .57 * Math.random() ** .7) : random(0, height),
        lower, span: size * 32 / 11.2,
        vx: random(-17, 22), vy: random(-22, 13),
        angle: random(0, rotations), turn: random(-4, 4),
        phase: random(0, Math.PI * 2), rate: random(.9, 3.1),
        tone: Math.random() < .3 ? 2 : (i % 2),
        opacity: random(.76, 1)
      };
    });
    draw(0, 0);
  }

  function draw(dt, time) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const wave = p.phase + time * p.rate;
      if (dt) {
        p.x += (p.vx + 8 * Math.sin(wave)) * dt;
        p.y += (p.vy + 5 * Math.cos(wave * .81)) * dt;
        p.angle += p.turn * dt;
        const top = p.lower ? height * .42 : -8;
        if (p.y < top) p.y = height + 8;
        else if (p.y > height + 8) p.y = top;
        if (p.x < -8) p.x = width + 8;
        else if (p.x > width + 8) p.x = -8;
      }
      const floor = p.lower ? Math.max(0, Math.min(1, (p.y / height - .42) / .22)) : 1;
      const edge = p.lower ? Math.min(1, Math.max(0, (height + 8 - p.y) / 32)) : 1;
      const glint = .79 + .21 * Math.pow(.5 + .5 * Math.sin(wave), 2);
      ctx.globalAlpha = p.opacity * glint * floor * edge;
      const orientation = Math.floor(p.angle) & (rotations - 1);
      ctx.drawImage(sprites[p.tone][orientation], p.x - p.span / 2, p.y - p.span / 2, p.span, p.span);
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (now - last < 32) return;
    const dt = last ? Math.min((now - last) / 1000, .06) : 0;
    last = now;
    draw(dt, now / 1000);
  }

  function syncMotion() {
    cancelAnimationFrame(raf);
    last = 0;
    if (!document.hidden && !reduced.matches) raf = requestAnimationFrame(tick);
    else draw(0, 0);
  }
  resize();
  syncMotion();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener('change', syncMotion);
})();
