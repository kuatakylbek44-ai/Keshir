(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("navMenu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Мәзірді жабу" : "Мәзірді ашу");
    });

    menu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Мәзірді ашу");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- floating hearts ---------- */
  var heartsLayer = document.getElementById("hearts-layer");
  var HEART_SYMBOLS = ["♥", "♡", "❤"];
  var HEART_COLORS = ["#ff6fa5", "#ff3d85", "#ffb347", "#b28dff", "#ff9ec4"];

  function spawnHeart() {
    if (!heartsLayer || document.hidden) return;
    var heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    heart.style.fontSize = 14 + Math.random() * 20 + "px";
    heart.style.animationDuration = 7 + Math.random() * 7 + "s";
    heartsLayer.appendChild(heart);
    heart.addEventListener("animationend", function () { heart.remove(); });
  }

  if (!reduceMotion && heartsLayer) {
    for (var i = 0; i < 6; i++) setTimeout(spawnHeart, i * 700);
    setInterval(spawnHeart, 1400);
  }

  /* ---------- petal & flower confetti ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var pieces = [];
  var rafId = null;
  var PETAL_COLORS = ["#ff3d85", "#ff5d8f", "#ff8a3d", "#ffb23d", "#ffd23d", "#c04cff", "#4dc9ff", "#ff6f3d", "#ff3d94", "#e83dff"];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (ctx) ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function makePiece() {
    var flower = Math.random() < 0.35;
    return {
      x: Math.random() * window.innerWidth,
      y: -30 - Math.random() * 80,
      s: flower ? 5 + Math.random() * 4 : 4 + Math.random() * 6,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      flower: flower,
      vy: 1.1 + Math.random() * 2.6,
      vx: -1.2 + Math.random() * 2.4,
      rot: Math.random() * Math.PI * 2,
      vr: -0.06 + Math.random() * 0.12,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.04
    };
  }

  function drawPetalShape(p) {
    var base = p.s * (2 + Math.sin(p.sway) * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -base);
    ctx.bezierCurveTo(base * 0.85, -base * 0.92, base * 0.7, base * 0.25, 0, base * 0.6);
    ctx.bezierCurveTo(-base * 0.7, base * 0.25, -base * 0.85, -base * 0.92, 0, -base);
    ctx.closePath();
  }

  function lighten(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, (n >> 16) + 70);
    var g = Math.min(255, ((n >> 8) & 255) + 70);
    var b = Math.min(255, (n & 255) + 70);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function drawFlower(p) {
    for (var i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      drawPetalShape(p);
      ctx.fillStyle = i % 2 === 0 ? p.color : lighten(p.color);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, p.s * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd23d";
    ctx.fill();
  }

  function burst(count) {
    if (reduceMotion || !ctx) return;
    for (var i = 0; i < count; i++) pieces.push(makePiece());
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > window.innerHeight + 40 || p.x < -60 || p.x > window.innerWidth + 60) {
        pieces.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.flower) {
        drawFlower(p);
      } else {
        ctx.scale(1, 0.55 + Math.abs(Math.sin(p.sway)) * 0.45);
        drawPetalShape(p);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.96;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, p.s * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "#fff8fb";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (pieces.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (!reduceMotion && ctx) {
    setTimeout(function () { burst(50); }, 500);
  }

  /* ---------- slow romantic music (Canon-style music box) ---------- */
  var musicBtn = document.getElementById("musicBtn");
  var audioCtx = null;
  var masterGain = null;
  var musicTimer = null;
  var musicStarted = false;
  var musicOn = false;

  var NOTE = {
    E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47, C3: 130.81, D3: 146.83,
    E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0
  };

  var CHORDS = [
    ["C3", "E4", "G4", "C5"],
    ["G2", "D4", "G4", "B4"],
    ["A2", "C4", "E4", "A4"],
    ["E2", "B3", "E4", "G4"],
    ["F2", "A3", "C4", "F4"],
    ["C3", "E4", "G4", "C5"],
    ["F2", "A3", "C4", "F4"],
    ["G2", "D4", "G4", "B4"]
  ];

  var BEAT = 0.72;
  var BAR = 4 * BEAT;
  var CYCLE = CHORDS.length * BAR;

  function pluck(t, freq, dur, vol) {
    var osc = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  function padChord(t, dur, notes, vol) {
    notes.forEach(function (n) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = NOTE[n];
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.7);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  }

  function scheduleCycle(t0) {
    var eighth = BEAT / 2;

    for (var b = 0; b < CHORDS.length; b++) {
      var c = CHORDS[b];
      var barStart = t0 + b * BAR;
      var high = [NOTE[c[1]], NOTE[c[2]], NOTE[c[3]], NOTE[c[2]]];
      var pattern = [0, 1, 2, 1, 0, 1, 2, 1];

      pluck(barStart, NOTE[c[0]], 1.4, 0.14);

      for (var k = 0; k < 8; k++) {
        pluck(barStart + k * eighth, high[pattern[k]], 1.1, 0.09);
      }

      padChord(barStart, BAR, c.slice(1), 0.022);

      if (b === CHORDS.length - 1) {
        pluck(barStart + BAR - eighth * 2, NOTE[c[3]] * 2, 1.6, 0.05);
      }
    }

    var nextCycleAt = t0 + CYCLE;
    var waitMs = Math.max(200, (nextCycleAt - audioCtx.currentTime - 0.3) * 1000);
    musicTimer = setTimeout(function () {
      if (musicOn && audioCtx) scheduleCycle(nextCycleAt);
    }, waitMs);
  }

  function startMusic() {
    if (!musicBtn || musicStarted) return;
    musicStarted = true;
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.85;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    musicOn = true;
    musicBtn.setAttribute("aria-pressed", "true");
    musicBtn.setAttribute("aria-label", "Музыканы тоқтату");
    scheduleCycle(audioCtx.currentTime + 0.08);
  }

  function stopMusic() {
    musicOn = false;
    if (!audioCtx) return;
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    if (audioCtx.state === "running") audioCtx.suspend();
    if (musicBtn) {
      musicBtn.setAttribute("aria-pressed", "false");
      musicBtn.setAttribute("aria-label", "Музыканы ойнату");
    }
  }

  function toggleMusic() {
    if (musicOn) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
  }

  function firstInteraction() {
    if (!musicStarted) startMusic();
  }
  window.addEventListener("pointerdown", firstInteraction, { once: true, passive: true });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Tab" || e.key === "Enter") return;
    firstInteraction();
  }, { once: true, passive: true });

  /* ---------- the big question: yes or no ---------- */
  var btnYes = document.getElementById("btnYes");
  var btnNo = document.getElementById("btnNo");
  var statusArea = document.getElementById("askStatus");

  var NO_MESSAGES = [
    "упс! 😅",
    "ой! басып қала жаздадың 🤭",
    "тағы да ұстай алмадың!",
    "бұл батырма әлі қашуда 🤫",
    "ой, қайда қашасың? 🙂",
    "соңғы рет — менікі ойлайық ә? 😌",
    "жоқ деген сөз — жоқ, жаным 💛"
  ];

  var noAttempts = 0;
  var resolved = false;

  function showBubble(text) {
    var el = document.createElement("span");
    el.className = "msg-pop";
    el.textContent = text;
    statusArea.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.4s ease";
      setTimeout(function () { el.remove(); }, 420);
    }, 2200);
  }

  function showFinale(html) {
    statusArea.innerHTML = "";
    var el = document.createElement("div");
    el.className = "finale-words";
    el.innerHTML = html;
    statusArea.appendChild(el);
  }

  function celebrate() {
    burst(240);
    for (var i = 0; i < 16; i++) setTimeout(spawnHeart, i * 110);
  }

  function escapeNo() {
    if (resolved) return;
    noAttempts++;

    if (noAttempts <= NO_MESSAGES.length) {
      showBubble(NO_MESSAGES[noAttempts - 1]);
    }

    if (noAttempts >= NO_MESSAGES.length) {
      resolved = true;
      btnNo.style.opacity = "0";
      btnNo.style.transform = "scale(0.1)";
      btnNo.style.pointerEvents = "none";
      celebrate();
      setTimeout(function () {
        showFinale(
          "<strong>Аха, сенің келісетініңді білдім! 😌</strong><br>" +
          "«Жоқ» деген сөз қашып кетті — демек, жүрегің «иә» деп тұр.<br>" +
          "Кешірімің — ең үлкен сый. Рахмет, жаным! 💛"
        );
      }, 700);
      return;
    }

    var pad = 18;
    var maxL = Math.max(pad, window.innerWidth - 150);
    var maxT = Math.max(pad, window.innerHeight - 90);
    var l = pad + Math.random() * (maxL - pad);
    var t = pad + Math.random() * (maxT - pad);

    btnNo.style.position = "fixed";
    btnNo.style.left = l + "px";
    btnNo.style.top = t + "px";
    btnNo.style.margin = "0";
    btnNo.style.zIndex = "70";
    var scale = Math.max(0.3, 1 - noAttempts * 0.12);
    btnNo.style.transform = "scale(" + scale + ") rotate(" + (Math.random() * 20 - 10) + "deg)";
  }

  if (btnNo) {
    btnNo.addEventListener("click", escapeNo);
    btnNo.addEventListener("pointerdown", function (e) {
      if (!reduceMotion) e.preventDefault();
      escapeNo();
    });
    btnNo.addEventListener("pointerenter", function () {
      if (reduceMotion) return;
      if (noAttempts > 0 && !resolved) escapeNo();
    });
  }

  if (btnYes) {
    btnYes.addEventListener("click", function () {
      if (resolved) return;
      resolved = true;
      btnNo.style.opacity = "0";
      btnNo.style.pointerEvents = "none";
      celebrate();
      if (btnYes) {
        btnYes.textContent = "Рахмет, жаным! 💛";
        btnYes.setAttribute("disabled", "disabled");
      }
      setTimeout(function () {
        showFinale(
          "<strong>Сен — ең мейірімді жүректі қызсың! 💛</strong><br>" +
          "Кешіргенің үшін рахмет. Бұл мейіріміңді ешқашан ұмытпаймын.<br>" +
          "Ақылымды бағамдаймын, жүрегін әрдайым сыйлаймын. 🕊️"
        );
      }, 600);
    });
  }

  /* ---------- gentle intro petals ---------- */
  if (!reduceMotion && ctx) {
    setTimeout(function () { burst(40); }, 900);
  }
})();