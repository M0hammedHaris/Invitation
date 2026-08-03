/* ════════════════════════════════════════════════
   Nikkah Invitation — "Interactive card" variation
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  var NIKKAH_DATE = new Date("2026-09-28T00:00:00");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Envelope: break the seal, lift the flap, raise the card ── */

  function envelope() {
    var stage = document.getElementById("stage");
    var env = document.getElementById("envelope");
    var seal = document.getElementById("seal");
    var skip = document.getElementById("stage-skip");
    var page = document.getElementById("page");

    function showPage() {
      if (page) { page.classList.add("is-shown"); }
      document.body.classList.remove("is-sealed");
    }

    if (!stage || !env || !seal) { showPage(); return; }

    var opened = false;

    function finish() {
      stage.classList.add("is-gone");
      showPage();
      window.scrollTo(0, 0);
    }

    function open() {
      if (opened) { return; }
      opened = true;

      if (reduceMotion) { finish(); return; }

      seal.classList.add("is-broken");
      // Clear the surrounding text so the rising card has the stage to itself.
      stage.classList.add("is-opening");

      // Let the wax fall away before the flap moves.
      window.setTimeout(function () {
        env.classList.add("is-open");
        burst();
      }, 420);

      window.setTimeout(finish, 2500);
    }

    seal.addEventListener("click", open);
    if (skip) { skip.addEventListener("click", finish); }

    // Reduced motion: nothing to watch, so go straight in.
    if (reduceMotion) { finish(); }
  }

  /* ── 2. One-shot petal burst when the seal breaks ───────────── */

  function burst() {
    var canvas = document.getElementById("burst");
    if (!canvas || reduceMotion) { return; }

    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var TINTS = ["#c08a86", "#e6cf9a", "#bd9a55", "#6f8168", "#a53f43"];
    var bits = [];
    var originX = w / 2;
    var originY = h * 0.46;

    for (var i = 0; i < 70; i++) {
      var angle = Math.random() * Math.PI * 2;
      var power = 2 + Math.random() * 6;
      bits.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power - 2,
        r: 2.5 + Math.random() * 4,
        spin: (Math.random() - 0.5) * 0.25,
        angle: Math.random() * Math.PI,
        life: 1,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)]
      });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var alive = 0;

      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        if (b.life <= 0) { continue; }
        alive++;

        b.vy += 0.14;          // gravity
        b.vx *= 0.99;          // drag
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.spin;
        b.life -= 0.008;

        ctx.save();
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, b.r, b.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = b.tint;
        ctx.fill();
        ctx.restore();
      }

      if (alive > 0) {
        window.requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    window.requestAnimationFrame(frame);
  }

  /* ── 3. Flip card: tap to turn, drag to tilt ────────────────── */

  function flipCard() {
    var stage = document.getElementById("flip-stage");
    var card = document.getElementById("flip-card");
    if (!stage || !card) { return; }

    var glares = card.querySelectorAll(".glare");
    var MAX = 9; // degrees

    function setGlare(px, py) {
      Array.prototype.forEach.call(glares, function (g) {
        g.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        g.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });
    }

    function tilt(e) {
      if (reduceMotion) { return; }
      var box = stage.getBoundingClientRect();
      var px = (e.clientX - box.left) / box.width;
      var py = (e.clientY - box.top) / box.height;

      card.classList.add("is-tilting");
      card.style.setProperty("--tx", ((0.5 - py) * MAX * 2).toFixed(2) + "deg");
      card.style.setProperty("--ty", ((px - 0.5) * MAX * 2).toFixed(2) + "deg");
      setGlare(px, py);
    }

    function rest() {
      card.classList.remove("is-tilting");
      card.style.setProperty("--tx", "0deg");
      card.style.setProperty("--ty", "0deg");
      setGlare(0.5, 0.5);
    }

    function turn() {
      var flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", flipped ? "true" : "false");
      rest();
    }

    stage.addEventListener("pointermove", tilt);
    stage.addEventListener("pointerleave", rest);

    card.addEventListener("click", function (e) {
      // Links and buttons on the card keep their own behaviour.
      if (e.target.closest("a, button")) { return; }
      turn();
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        turn();
      }
    });
  }

  /* ── 4. Countdown ───────────────────────────────────────────── */

  function countdown() {
    var days = document.getElementById("cd-days");
    var hours = document.getElementById("cd-hours");
    var minutes = document.getElementById("cd-minutes");
    var seconds = document.getElementById("cd-seconds");
    var timer = document.getElementById("countdown-timer");
    var message = document.getElementById("countdown-message");
    if (!days) { return; }

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var diff = NIKKAH_DATE.getTime() - Date.now();

      if (diff <= 0) {
        if (timer) { timer.style.display = "none"; }
        if (message) { message.textContent = "Alhamdulillah — the Nikkah day has arrived."; }
        window.clearInterval(handle);
        return;
      }

      var s = Math.floor(diff / 1000);
      days.textContent = pad(Math.floor(s / 86400));
      hours.textContent = pad(Math.floor(s / 3600) % 24);
      minutes.textContent = pad(Math.floor(s / 60) % 60);
      seconds.textContent = pad(s % 60);
    }

    var handle = window.setInterval(tick, 1000);
    tick();
  }

  /* ── 5. Scroll reveal ───────────────────────────────────────── */

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ── 6. Copy invitation link ────────────────────────────────── */

  function copyLink() {
    var btn = document.getElementById("copy-link-btn");
    var label = document.getElementById("copy-link-label");
    if (!btn || !label) { return; }

    var original = label.textContent;
    var resetTimer = null;

    function feedback(text, ok) {
      label.textContent = text;
      if (ok) { btn.classList.add("is-copied"); }
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(function () {
        label.textContent = original;
        btn.classList.remove("is-copied");
      }, 2400);
    }

    function fallback(url) {
      var box = document.createElement("textarea");
      box.value = url;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(box);
      feedback(ok ? "Link Copied" : "Press Ctrl+C to copy", ok);
    }

    btn.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          feedback("Link Copied", true);
        }).catch(function () { fallback(url); });
      } else {
        fallback(url);
      }
    });
  }

  /* ── 7. Add to calendar ─────────────────────────────────────── */

  function addToCalendar() {
    var btn = document.getElementById("cal-btn");
    if (!btn) { return; }

    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Mohammed Haris K & Hasina Begam A — Nikkah",
      // All-day on the 28th: Google treats the end date as exclusive.
      dates: "20260928/20260929",
      details: "You are cordially invited to the Nikkah of Mohammed Haris K & Hasina Begam A.",
      location: "HMO Auditorium"
    });

    btn.href = "https://calendar.google.com/calendar/render?" + params.toString();
  }

  /* ── boot ───────────────────────────────────────────────────── */

  function init() {
    envelope();
    flipCard();
    countdown();
    revealOnScroll();
    copyLink();
    addToCalendar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
