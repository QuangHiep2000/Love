/*
 * Pháo hoa trái tim: nổ tim khi chạm màn hình, khi mở quà và khi em bấm "Có"
 */
const Fx = (function () {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  const colors = ["#ff417d", "#ff8fb3", "#ffd1dc", "#f7d79b", "#ffffff", "#ff2b55"];
  let parts = [];
  let running = false;
  let last = 0;
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x, y, opts = {}) {
    const count = opts.count || 18;
    const power = opts.power || 260;
    const size = opts.size || 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = power * (0.35 + Math.random() * 0.65);
      parts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - power * 0.25,
        life: 0,
        max: 1 + Math.random() * 0.8,
        size: size * (0.6 + Math.random() * 0.8),
        rot: Math.random() - 0.5,
        vr: (Math.random() - 0.5) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        heart: Math.random() < 0.7,
      });
    }
    if (!running) {
      running = true;
      last = 0;
      requestAnimationFrame(tick);
    }
  }

  function firework(rounds = 6) {
    for (let i = 0; i < rounds; i++) {
      setTimeout(() => {
        burst(w * (0.15 + Math.random() * 0.7), h * (0.15 + Math.random() * 0.45), {
          count: 40,
          power: 380,
          size: 14,
        });
      }, i * 280);
    }
  }

  function tick(now) {
    const t = now / 1000;
    const dt = Math.min(t - (last || t), 0.05);
    last = t;
    const drag = Math.exp(-1.6 * dt);

    ctx.clearRect(0, 0, w, h);
    parts = parts.filter((p) => {
      p.life += dt;
      if (p.life >= p.max) return false;
      p.vx *= drag;
      p.vy = p.vy * drag + 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      ctx.globalAlpha = 1 - Math.pow(p.life / p.max, 2);
      ctx.fillStyle = p.color;
      if (p.heart) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        drawHeartPath(ctx, 0, 0, p.size);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 6, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });
    ctx.globalAlpha = 1;

    if (parts.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  window.addEventListener("resize", resize);
  resize();

  return { burst, firework };
})();
