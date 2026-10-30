/*
 * Trái tim hạt quanh ảnh (dựa trên hiệu ứng particle cũ, thêm hỗ trợ màn hình nét & co giãn)
 */
const HeartBeat = (function () {
  const settings = {
    length: 500, // số hạt tối đa
    duration: 2, // thời gian sống của hạt (giây)
    velocity: 100, // vận tốc hạt
    effect: -0.75, // hệ số hút ngược
    size: 30, // kích thước hạt
    colors: ["#ea80b0", "#ff417d", "#ffb3c8"],
  };

  // Điểm trên đường trái tim với -PI <= t <= PI (đơn vị "trái tim", rộng ~320)
  function pointOnHeart(t) {
    return {
      x: 160 * Math.pow(Math.sin(t), 3),
      y:
        130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25,
    };
  }

  function makeSprite(color, pixels) {
    const c = document.createElement("canvas");
    c.width = c.height = pixels;
    const ctx = c.getContext("2d");
    ctx.beginPath();
    for (let t = -Math.PI; t <= Math.PI; t += 0.01) {
      const p = pointOnHeart(t);
      ctx.lineTo(pixels / 2 + (p.x * pixels) / 350, pixels / 2 - (p.y * pixels) / 350);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    return c;
  }

  function ease(t) {
    return --t * t * t + 1;
  }

  function start(canvas) {
    const ctx = canvas.getContext("2d");
    const pool = Array.from({ length: settings.length }, () => ({ age: Infinity }));
    const rate = settings.length / settings.duration;
    let next = 0;
    let scale = 1;
    let dpr = 1;
    let sprites = [];
    let last = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      scale = canvas.clientWidth / 580;
      const px = Math.ceil(settings.size * scale * dpr * 1.5);
      sprites = settings.colors.map((c) => makeSprite(c, px));
    }

    function add() {
      const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      const len = Math.hypot(pos.x, pos.y) || 1;
      const p = pool[next];
      p.x = pos.x;
      p.y = -pos.y;
      p.vx = (pos.x / len) * settings.velocity;
      p.vy = (-pos.y / len) * settings.velocity;
      p.ax = p.vx * settings.effect;
      p.ay = p.vy * settings.effect;
      p.age = 0;
      p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
      next = (next + 1) % pool.length;
    }

    function render(now) {
      requestAnimationFrame(render);
      const t = now / 1000;
      const dt = Math.min(t - (last || t), 0.05);
      last = t;

      for (let i = 0; i < rate * dt; i++) add();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, canvas.width / 2, canvas.height / 2);

      for (const p of pool) {
        if (p.age >= settings.duration) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx += p.ax * dt;
        p.vy += p.ay * dt;
        p.age += dt;
        const life = p.age / settings.duration;
        const size = settings.size * ease(Math.min(life, 1));
        ctx.globalAlpha = Math.max(0, 1 - life);
        ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
  }

  return { start };
})();
