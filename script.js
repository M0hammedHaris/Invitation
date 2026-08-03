/* ════════════════════════════════════════════════
   Nikkah Invitation — "Animated" variation
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  var NIKKAH_DATE = new Date("2026-09-28T00:00:00");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Split the names into individual letters ───────────────
     Done in JS so the markup stays readable and screen readers
     still announce the whole name (aria-label on the wrapper).   */

  function splitNames() {
    var nodes = document.querySelectorAll("[data-split]");

    Array.prototype.forEach.call(nodes, function (el) {
      var text = el.textContent.trim();
      var base = parseFloat(el.getAttribute("data-delay")) || 0;
      var step = reduceMotion ? 0 : 0.045;

      if (reduceMotion) { el.classList.add("is-lit"); return; }

      el.setAttribute("aria-label", text);
      el.textContent = "";

      // Words stay whole (inline-block) so long names still wrap on phones,
      // with real spaces between them as break opportunities.
      var index = 0;
      text.split(" ").forEach(function (word, w) {
        if (w > 0) { el.appendChild(document.createTextNode(" ")); }

        var wrap = document.createElement("span");
        wrap.className = "wrd";
        wrap.setAttribute("aria-hidden", "true");

        word.split("").forEach(function (ch) {
          var span = document.createElement("span");
          span.className = "ltr";
          span.textContent = ch;
          span.style.setProperty("--ld", (base + index * step).toFixed(3) + "s");
          index++;
          wrap.appendChild(span);
        });

        el.appendChild(wrap);
      });

      // Once every letter has landed, drop back to plain text — inline-block
      // letters can't be masked by background-clip, and the shimmer needs it.
      var lit = (base + index * step + 0.95) * 1000;
      window.setTimeout(function () {
        el.textContent = text;
        el.removeAttribute("aria-label");
        el.classList.add("is-lit");
      }, lit);
    });
  }

  /* ── 2. Opening curtain ─────────────────────────────────────── */

  function runCurtain() {
    var curtain = document.getElementById("curtain");
    if (!curtain) { document.body.classList.remove("is-loading"); return; }

    var done = false;
    function lift() {
      if (done) { return; }
      done = true;
      curtain.classList.add("is-done");
      document.body.classList.remove("is-loading");
    }

    window.setTimeout(lift, reduceMotion ? 100 : 2900);
    // Impatient guests can tap straight through.
    curtain.addEventListener("click", lift);
    window.addEventListener("keydown", lift, { once: true });
  }

  /* ── 3. Falling petals ──────────────────────────────────────── */

  function startPetals() {
    var canvas = document.getElementById("petals");
    if (!canvas || reduceMotion) { return; }

    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, petals = [], raf = null;
    var TINTS = ["rgba(201,154,154,", "rgba(226,201,138,", "rgba(138,156,124,"];

    function size() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(seeded) {
      return {
        x: Math.random() * w,
        y: seeded ? Math.random() * h : -20,
        r: 3 + Math.random() * 5,
        speed: 0.25 + Math.random() * 0.55,
        drift: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 0.02,
        angle: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.35,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)]
      };
    }

    function reset() {
      // Fewer petals on small screens — keeps phones cool.
      var count = w < 600 ? 16 : 30;
      petals = [];
      for (var i = 0; i < count; i++) { petals.push(make(true)); }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y / 60) * 0.3;
        p.angle += p.spin;

        if (p.y - p.r > h) { petals[i] = make(false); continue; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.tint + p.alpha + ")";
        ctx.fill();
        ctx.restore();
      }

      raf = window.requestAnimationFrame(draw);
    }

    function play() { if (raf === null) { raf = window.requestAnimationFrame(draw); } }
    function pause() { if (raf !== null) { window.cancelAnimationFrame(raf); raf = null; } }

    size();
    reset();
    play();

    window.addEventListener("resize", function () { size(); reset(); });
    // Don't burn battery on a backgrounded tab.
    document.addEventListener("visibilitychange", function () {
      document.hidden ? pause() : play();
    });
  }

  /* ── 4. Gold thread scroll progress ─────────────────────────── */

  function threadProgress() {
    var fill = document.getElementById("thread-fill");
    if (!fill) { return; }
    var ticking = false;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      fill.style.height = Math.max(0, Math.min(100, pct)) + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });

    update();
  }

  /* ── 5. Countdown with flipping digits ──────────────────────── */

  function countdown() {
    var faces = {
      days: document.querySelector("#cd-days .flip-face"),
      hours: document.querySelector("#cd-hours .flip-face"),
      minutes: document.querySelector("#cd-minutes .flip-face"),
      seconds: document.querySelector("#cd-seconds .flip-face")
    };
    var timer = document.getElementById("countdown-timer");
    var message = document.getElementById("countdown-message");
    if (!faces.days) { return; }

    function set(face, value) {
      var next = String(value).padStart(2, "0");
      if (!face || face.textContent === next) { return; }
      face.textContent = next;
      if (reduceMotion) { return; }
      face.classList.remove("is-flipping");
      // Force reflow so the animation can restart on the next tick.
      void face.offsetWidth;
      face.classList.add("is-flipping");
    }

    function tick() {
      var diff = NIKKAH_DATE.getTime() - Date.now();

      if (diff <= 0) {
        if (timer) { timer.style.display = "none"; }
        if (message) { message.textContent = "Alhamdulillah — the Nikkah day has arrived."; }
        window.clearInterval(handle);
        return;
      }

      var s = Math.floor(diff / 1000);
      set(faces.days, Math.floor(s / 86400));
      set(faces.hours, Math.floor(s / 3600) % 24);
      set(faces.minutes, Math.floor(s / 60) % 60);
      set(faces.seconds, s % 60);
    }

    var handle = window.setInterval(tick, 1000);
    tick();
  }

  /* ── 6. Scroll reveal ───────────────────────────────────────── */

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var delay = entry.target.getAttribute("data-reveal-delay");
        if (delay) { entry.target.style.setProperty("--rd", delay + "ms"); }
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ── 7. Copy invitation link ────────────────────────────────── */

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

  /* ── 8. Add to calendar ─────────────────────────────────────── */

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
    splitNames();
    runCurtain();
    startPetals();
    threadProgress();
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
