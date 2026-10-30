/*
 * Bầu trời sao: sao lấp lánh, sao băng và những trái tim bay lên
 */

// Vẽ đường viền trái tim có tâm (x, y), rộng khoảng `size`
function drawHeartPath(ctx, x, y, size) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.7);
  ctx.bezierCurveTo(x - s * 1.2, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.2, y - s * 0.1, x, y + s * 0.7);
  ctx.closePath();
}

(function () {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const heartColors = ["255,65,125", "255,143,179", "255,209,220"];

  let w = 0;
  let h = 0;
  let stars = [];
  let meteors = [];
  let hearts = [];
  let nextMeteor = 1.5;
  let nextHeart = 0;
  let last = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const widthChanged = window.innerWidth !== w;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Thanh địa chỉ trên điện thoại ẩn/hiện chỉ đổi chiều cao → giữ nguyên sao
    if (!widthChanged) return;
    const count = Math.min(Math.round((w * screen.height) / 2400), 650);
    stars = Array.from({ length: count }, () => {
      const pick = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * screen.height,
        r: Math.random() < 0.08 ? rand(1.4, 2.2) : rand(0.4, 1.2),
        phase: Math.random() * Math.PI * 2,
        speed: rand(0.6, 2.4),
        color: pick < 0.15 ? "255,190,215" : pick < 0.35 ? "190,215,255" : "255,255,255",
      };
    });
  }

  function spawnMeteor() {
    const angle = rand(0.35, 0.6);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speed = rand(700, 1000);
    meteors.push({
      x: rand(w * 0.1, w * 0.9),
      y: rand(0, h * 0.35),
      vx: Math.cos(angle) * speed * dir,
      vy: Math.sin(angle) * speed,
      len: rand(120, 220),
      life: 0,
      max: rand(0.6, 1.1),
    });
  }

  function spawnHeart() {
    hearts.push({
      x: rand(0, w),
      y: h + 20,
      vy: rand(20, 45),
      sway: rand(15, 40),
      freq: rand(0.5, 1.2),
      phase: Math.random() * Math.PI * 2,
      size: rand(8, 18),
      alpha: rand(0.15, 0.45),
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      t: 0,
    });
  }

  function drawStars(t) {
    for (const s of stars) {
      if (s.y > h) continue;
      const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = `rgba(${s.color},${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.3) {
        ctx.fillStyle = `rgba(${s.color},${a * 0.15})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawMeteors(dt) {
    meteors = meteors.filter((m) => {
      m.life += dt;
      if (m.life > m.max) return false;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const fade = 1 - m.life / m.max;
      const speed = Math.hypot(m.vx, m.vy);
      const tx = m.x - (m.vx / speed) * m.len;
      const ty = m.y - (m.vy / speed) * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, `rgba(255,255,255,${fade})`);
      grad.addColorStop(0.3, `rgba(255,190,215,${fade * 0.5})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      return true;
    });
  }

  function drawHearts(dt) {
    hearts = hearts.filter((p) => {
      p.t += dt;
      p.y -= p.vy * dt;
      if (p.y < -30) return false;
      const x = p.x + Math.sin(p.t * p.freq + p.phase) * p.sway;
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      drawHeartPath(ctx, x, p.y, p.size);
      ctx.fill();
      return true;
    });
  }

  function loop(now) {
    const t = now / 1000;
    const dt = Math.min(t - (last || t), 0.05);
    last = t;

    nextMeteor -= dt;
    if (nextMeteor <= 0) {
      spawnMeteor();
      nextMeteor = rand(2, 6);
    }
    nextHeart -= dt;
    if (nextHeart <= 0) {
      spawnHeart();
      nextHeart = rand(0.5, 1.3);
    }

    ctx.clearRect(0, 0, w, h);
    drawStars(t);
    drawMeteors(dt);
    drawHearts(dt);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
})();
