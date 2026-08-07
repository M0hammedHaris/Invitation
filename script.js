/* ══════════════════════════════════════════════════════════
   Nikkah Invitation — "Vibrant" variation
   ══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var NIKKAH_DATE = new Date("2026-09-28T00:00:00");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Marigold garland ────────────────────────────────────
     Buds are placed along the swag paths so the garland follows
     the curve exactly and restretches with the viewport.        */

  function garland() {
    var svg = document.getElementById("torana");
    if (!svg) { return; }

    var swags = [
      { path: document.getElementById("swag-a"), group: document.getElementById("buds-a"),
        y: 8,  depth: .72, r: 6.5, warm: true },
      { path: document.getElementById("swag-b"), group: document.getElementById("buds-b"),
        y: 30, depth: .78, r: 4.6, warm: false }
    ];
    if (!swags[0].path || !swags[0].path.getPointAtLength) { return; }

    var ns = "http://www.w3.org/2000/svg";

    function layout() {
      var W = Math.max(320, window.innerWidth);
      var H = Math.round(svg.getBoundingClientRect().height) || 150;

      // Map the viewBox 1:1 onto CSS pixels. Without this the buds stretch
      // into ovals as the viewport widens past the authored viewBox.
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);

      // Keep each swag a similar width whatever the screen, so a phone gets
      // two arcs and an ultrawide gets many, rather than two enormous ones.
      var arcs = Math.max(2, Math.round(W / 340));
      var span = W / arcs;

      swags.forEach(function (s) {
        var dip = (s.y + (H - s.y) * s.depth).toFixed(1);
        var d = "M0 " + s.y;
        for (var a = 0; a < arcs; a++) {
          d += " Q " + ((a + 0.5) * span).toFixed(1) + " " + dip +
               " " + ((a + 1) * span).toFixed(1) + " " + s.y;
        }
        s.path.setAttribute("d", d);

        while (s.group.firstChild) { s.group.removeChild(s.group.firstChild); }

        var len = s.path.getTotalLength();
        var count = Math.max(16, Math.round(W / 34));

        for (var i = 0; i <= count; i++) {
          var p = s.path.getPointAtLength((len * i) / count);

          // Alternate marigold and saffron, with the odd fuchsia bud
          var fill = i % 7 === 3 ? "#e5397f" : (i % 2 ? "#fb8500" : "#ffb703");

          var bud = document.createElementNS(ns, "circle");
          bud.setAttribute("class", "bud");
          bud.setAttribute("cx", p.x.toFixed(1));
          bud.setAttribute("cy", p.y.toFixed(1));
          bud.setAttribute("r", s.r);
          bud.setAttribute("fill", fill);
          bud.setAttribute("opacity", s.warm ? "0.95" : "0.6");
          if (!reduceMotion) {
            bud.style.animationDelay = ((i % 9) * 0.18).toFixed(2) + "s";
          }
          s.group.appendChild(bud);

          // A small highlight makes each bud read as a flower, not a dot
          if (s.warm) {
            var core = document.createElementNS(ns, "circle");
            core.setAttribute("cx", p.x.toFixed(1));
            core.setAttribute("cy", (p.y - 1).toFixed(1));
            core.setAttribute("r", (s.r * 0.42).toFixed(1));
            core.setAttribute("fill", "#fff3c4");
            core.setAttribute("opacity", "0.75");
            s.group.appendChild(core);
          }
        }
      });
    }

    layout();

    var pending = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(pending);
      pending = window.setTimeout(layout, 150);
    });
  }

  /* ── 2. Drifting embers ─────────────────────────────────── */

  function embers() {
    var canvas = document.getElementById("embers");
    if (!canvas || reduceMotion) { return; }

    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, sparks = [], raf = null;
    var TINTS = ["255,183,3", "251,133,0", "245,208,97", "229,57,127", "15,163,163"];

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
        y: seeded ? Math.random() * h : h + 12,
        r: 0.8 + Math.random() * 2.1,
        rise: 0.18 + Math.random() * 0.5,
        sway: (Math.random() - 0.5) * 0.35,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.5,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)]
      };
    }

    function reset() {
      var count = w < 640 ? 26 : 52;
      sparks = [];
      for (var i = 0; i < count; i++) { sparks.push(make(true)); }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < sparks.length; i++) {
        var s = sparks[i];
        s.y -= s.rise;
        s.phase += 0.012;
        s.x += s.sway + Math.sin(s.phase) * 0.35;

        if (s.y + s.r < -12) { sparks[i] = make(false); continue; }

        // soft glow, then a bright core
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        g.addColorStop(0, "rgba(" + s.tint + "," + s.alpha + ")");
        g.addColorStop(1, "rgba(" + s.tint + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(" + s.tint + "," + Math.min(1, s.alpha + 0.35) + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    }

    function play()  { if (raf === null) { raf = window.requestAnimationFrame(draw); } }
    function pause() { if (raf !== null) { window.cancelAnimationFrame(raf); raf = null; } }

    size();
    reset();
    play();

    window.addEventListener("resize", function () { size(); reset(); });
    document.addEventListener("visibilitychange", function () {
      document.hidden ? pause() : play();
    });
  }

  /* ── 3. Scroll thread ───────────────────────────────────── */

  function thread() {
    var fill = document.getElementById("thread-fill");
    if (!fill) { return; }
    var queued = false;

    function paint() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      fill.style.height = Math.max(0, Math.min(100, pct)) + "%";
      queued = false;
    }

    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(paint); }
    }, { passive: true });

    paint();
  }

  /* ── 4. Countdown ───────────────────────────────────────── */

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

  /* ── 5. Scroll reveal ───────────────────────────────────── */

  function rise() {
    var items = document.querySelectorAll("[data-rise]");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("seen"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("seen");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });

    // Safety net: on a tall desktop screen a lot of this sits in view at load,
    // and nothing should ever be left stranded at opacity 0.
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        Array.prototype.forEach.call(items, function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add("seen");
          }
        });
      }, 1000);
    });
  }

  /* ── 6. Add to calendar ─────────────────────────────────── */

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

  /* ── 7. Copy invitation link ────────────────────────────── */

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

  /* ── boot ───────────────────────────────────────────────── */

  function init() {
    garland();
    embers();
    thread();
    countdown();
    rise();
    addToCalendar();
    copyLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
