/*
 * Ghép mọi thứ lại: mở quà, nhạc, bộ đếm ngày, lá thư, ảnh, thẻ lý do và câu hỏi cuối
 */
(function () {
  const C = LOVE_CONFIG;
  const $ = (sel) => document.querySelector(sel);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEART_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  // ---------- Nội dung từ config ----------
  document.title = C.pageTitle;
  $("#introTitle").textContent = C.introTitle;
  $("#introHint").textContent = C.introHint;
  $("#himName").textContent = C.him;
  $("#herName").textContent = C.her;
  $("#heroPhoto").src = C.heroPhoto;
  $("#heroPhoto").alt = C.her;
  $("#sinceLabel").textContent = C.sinceLabel;
  $("#letterTitle").textContent = C.letterTitle;
  $("#letterSign").textContent = C.letterSign;
  $("#memoriesTitle").textContent = C.memoriesTitle;
  $("#reasonsTitle").textContent = C.reasonsTitle;
  $("#question").textContent = C.question;
  $("#yesBtn").textContent = C.yesText;
  $("#noBtn").textContent = C.noTexts[0];
  $("#answer").textContent = C.answer;

  const [sy, sm, sd] = C.startDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  $("#footer").textContent = `Made with ❤ · ${C.him} & ${C.her} · từ ${start.toLocaleDateString("vi-VN")}`;

  // ---------- Mở quà ----------
  const bgm = $("#bgm");
  bgm.src = C.music;

  $("#openBtn").addEventListener(
    "click",
    (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      Fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 70, power: 520, size: 16 });
      $("#intro").classList.add("is-hidden");
      document.body.classList.remove("is-locked");
      $("#musicBtn").hidden = false;
      HeartBeat.start($("#pinkboard"));
      playMusic();
      countUp();
      if (isSpecialDay(new Date())) setTimeout(() => Fx.firework(8), 900);
      setTimeout(() => $("#intro").remove(), 1200);
    },
    { once: true }
  );

  // ---------- Nhạc ----------
  function playMusic() {
    bgm.volume = 0;
    bgm.play().then(() => {
      const fadeIn = setInterval(() => {
        bgm.volume = Math.min(0.8, bgm.volume + 0.04);
        if (bgm.volume >= 0.8) clearInterval(fadeIn);
      }, 80);
    }).catch(() => {});
  }

  bgm.addEventListener("play", () => $("#musicBtn").classList.add("is-playing"));
  bgm.addEventListener("pause", () => $("#musicBtn").classList.remove("is-playing"));
  $("#musicBtn").addEventListener("click", () => {
    if (bgm.paused) {
      bgm.volume = 0.8;
      bgm.play().catch(() => {});
    } else {
      bgm.pause();
    }
  });

  // ---------- Bộ đếm ngày bên nhau ----------
  const DAY = 86400000;
  let counting = true;

  function daysInMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  function addMonths(date, n) {
    const r = new Date(date);
    const day = r.getDate();
    r.setDate(1);
    r.setMonth(r.getMonth() + n);
    r.setDate(Math.min(day, daysInMonth(r)));
    return r;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function totalDays(now) {
    return Math.max(0, Math.round((startOfDay(now) - start) / DAY));
  }

  function isSpecialDay(now) {
    const days = totalDays(now);
    const anniversary = now.getMonth() === start.getMonth() && now.getDate() === start.getDate();
    return days > 0 && (anniversary || days % 100 === 0);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCounter() {
    const now = new Date();
    let months = 0;
    let rest = 0;
    if (now > start) {
      months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
      if (addMonths(start, months) > now) months--;
      rest = Math.floor((now - addMonths(start, months)) / 1000);
    }
    const days = totalDays(now);
    const years = Math.floor(months / 12);

    if (!counting) $("#cTotal").textContent = days.toLocaleString("vi-VN");
    $("#cYears").textContent = years;
    $("#cMonths").textContent = months % 12;
    $("#cDays").textContent = Math.floor(rest / 86400);
    $("#cHours").textContent = pad(Math.floor((rest % 86400) / 3600));
    $("#cMinutes").textContent = pad(Math.floor((rest % 3600) / 60));
    $("#cSeconds").textContent = pad(rest % 60);

    let note;
    if (now.getMonth() === start.getMonth() && now.getDate() === start.getDate() && years > 0) {
      note = `🎉 Hôm nay là kỷ niệm ${years} năm của tụi mình!`;
    } else if (days > 0 && days % 100 === 0) {
      note = `🎉 Hôm nay tròn ${days.toLocaleString("vi-VN")} ngày bên nhau!`;
    } else {
      const left = Math.round((addMonths(start, (years + 1) * 12) - startOfDay(now)) / DAY);
      note = `Còn ${left} ngày nữa là kỷ niệm ${years + 1} năm ❤`;
    }
    $("#nextAnni").textContent = note;
  }

  function countUp() {
    const target = totalDays(new Date());
    const duration = reduced ? 0 : 2200;
    const t0 = performance.now();
    function step(now) {
      const k = duration ? Math.min(1, (now - t0) / duration) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      $("#cTotal").textContent = Math.round(target * eased).toLocaleString("vi-VN");
      if (k < 1) requestAnimationFrame(step);
      else counting = false;
    }
    requestAnimationFrame(step);
  }

  tickCounter();
  setInterval(tickCounter, 1000);

  // ---------- Lá thư gõ chữ ----------
  const paper = $("#letterPaper");
  let skipTyping = reduced;

  function typeLetter() {
    const paras = C.letter.map((text) => {
      const chars = Array.from(text.normalize("NFC"));
      const p = document.createElement("p");
      const typed = document.createElement("span");
      const rest = document.createElement("span");
      rest.className = "rest";
      rest.textContent = text;
      p.append(typed, rest);
      $("#letterText").appendChild(p);
      return { chars, typed, rest };
    });
    const caret = document.createElement("span");
    caret.className = "caret";
    let pi = 0;
    let ci = 0;

    function finish() {
      paras.forEach((p) => {
        p.typed.textContent = p.chars.join("");
        p.rest.textContent = "";
      });
      caret.remove();
      paper.classList.add("is-done");
    }

    function step() {
      if (skipTyping) return finish();
      const p = paras[pi];
      ci++;
      p.typed.textContent = p.chars.slice(0, ci).join("");
      p.rest.textContent = p.chars.slice(ci).join("");
      p.typed.after(caret);
      if (ci >= p.chars.length) {
        pi++;
        ci = 0;
        if (pi >= paras.length) return finish();
        return setTimeout(step, 500);
      }
      setTimeout(step, /[.,!?…—]/.test(p.chars[ci - 1]) ? 280 : 40);
    }

    step();
  }

  paper.addEventListener("click", () => {
    skipTyping = true;
  });

  // ---------- Ảnh kỷ niệm ----------
  const lightbox = $("#lightbox");

  if (!C.photos.length) $("#memories").remove();
  C.photos.forEach((photo, i) => {
    const fig = document.createElement("figure");
    fig.className = "polaroid";
    fig.style.setProperty("--r", `${(i % 2 ? 1 : -1) * (2 + Math.random() * 4)}deg`);
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || "";
    img.loading = "lazy";
    fig.appendChild(img);
    if (photo.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = photo.caption;
      fig.appendChild(cap);
    }
    fig.addEventListener("click", () => {
      lightbox.querySelector("img").src = photo.src;
      lightbox.hidden = false;
    });
    $("#polaroids").appendChild(fig);
  });

  lightbox.addEventListener("click", () => {
    lightbox.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.hidden = true;
  });

  // ---------- Thẻ lý do ----------
  C.reasons.forEach((text, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `<div class="card__inner"><div class="card__face card__front">${HEART_SVG}<span>#${i + 1}</span></div><div class="card__face card__back"></div></div>`;
    card.querySelector(".card__back").textContent = text;
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
    $("#cards").appendChild(card);
  });

  // ---------- Câu hỏi cuối ----------
  const yesBtn = $("#yesBtn");
  const noBtn = $("#noBtn");
  let noCount = 0;

  function dodge(e) {
    e.preventDefault();
    noCount++;
    noBtn.textContent = C.noTexts[Math.min(noCount, C.noTexts.length - 1)];
    noBtn.classList.add("is-running");
    const r = noBtn.getBoundingClientRect();
    const yes = yesBtn.getBoundingClientRect();
    const margin = 16;
    let x;
    let y;
    let tries = 0;
    // Không được nhảy đè lên nút "Có"
    do {
      x = margin + Math.random() * (window.innerWidth - r.width - margin * 2);
      y = margin + Math.random() * (window.innerHeight - r.height - margin * 2);
    } while (
      tries++ < 30 &&
      x < yes.right + 40 && x + r.width > yes.left - 40 &&
      y < yes.bottom + 40 && y + r.height > yes.top - 40
    );
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    yesBtn.style.transform = `scale(${1 + Math.min(noCount, 6) * 0.1})`;
  }

  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") dodge(e);
  });
  noBtn.addEventListener("pointerdown", dodge);
  noBtn.addEventListener("click", dodge);

  yesBtn.addEventListener("click", () => {
    noBtn.remove();
    yesBtn.disabled = true;
    yesBtn.style.transform = "";
    $("#answer").hidden = false;
    Fx.firework(10);
  });

  // ---------- Chạm đâu nổ tim đó ----------
  document.addEventListener("click", (e) => {
    if (document.body.classList.contains("is-locked")) return;
    if (e.target.closest("[data-no-burst]")) return;
    Fx.burst(e.clientX, e.clientY, { count: 14, power: 200, size: 10 });
  });

  // ---------- Hiện dần khi kéo xuống ----------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.id === "letter") typeLetter();
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();
