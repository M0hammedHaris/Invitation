/* ════════════════════════════════════════════════
   Nikkah Invitation — "Modern" variation
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  var NIKKAH_DATE = new Date("2026-09-28T00:00:00");
  var STORE_KEY = "nikkah-theme";

  /* ── Theme toggle ───────────────────────────────────────────── */

  function theme() {
    var btn = document.getElementById("theme-toggle");
    var root = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!btn) { return; }

    function paintMeta() {
      if (!meta) { return; }
      meta.setAttribute("content",
        root.getAttribute("data-theme") === "light" ? "#f6f4ee" : "#0d1210");
    }

    paintMeta();

    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      paintMeta();
      try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* private mode */ }
    });
  }

  /* ── Scroll progress ────────────────────────────────────────── */

  function progress() {
    var bar = document.getElementById("progress-bar");
    if (!bar) { return; }
    var queued = false;

    function paint() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
      queued = false;
    }

    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(paint); }
    }, { passive: true });

    paint();
  }

  /* ── Countdown ──────────────────────────────────────────────── */

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

  /* ── Scroll fade-in ─────────────────────────────────────────── */

  function fadeIn() {
    var items = document.querySelectorAll("[data-fade]");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) { return; }
        // Small stagger when several tiles enter together.
        entry.target.style.transitionDelay = (i * 70) + "ms";
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ── Sharing ────────────────────────────────────────────────── */

  function writeClipboard(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url);
    }

    return new Promise(function (resolve, reject) {
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
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  function share() {
    var btn = document.getElementById("copy-link-btn");
    var label = document.getElementById("copy-link-label");
    var dock = document.getElementById("dock-share");
    var dockLabel = document.getElementById("dock-share-label");

    function flash(el, textEl, text, ok) {
      if (!textEl) { return; }
      var original = textEl.getAttribute("data-original") || textEl.textContent;
      textEl.setAttribute("data-original", original);
      textEl.textContent = text;
      if (ok && el) { el.classList.add("is-copied"); }
      window.setTimeout(function () {
        textEl.textContent = original;
        if (el) { el.classList.remove("is-copied"); }
      }, 2400);
    }

    if (btn && label) {
      btn.addEventListener("click", function () {
        writeClipboard(window.location.href).then(function () {
          flash(btn, label, "Copied", true);
        }).catch(function () {
          flash(btn, label, "Press Ctrl+C", false);
        });
      });
    }

    if (dock && dockLabel) {
      dock.addEventListener("click", function () {
        var data = {
          title: "Mohammed Haris K & Haseena Begam A — Nikkah",
          text: "You are invited to our Nikkah, Monday 28 September 2026 at HMO Auditorium.",
          url: window.location.href
        };

        // Native share sheet on phones, clipboard everywhere else.
        if (navigator.share) {
          navigator.share(data).catch(function () { /* dismissed */ });
          return;
        }

        writeClipboard(window.location.href).then(function () {
          flash(dock, dockLabel, "Copied", true);
        }).catch(function () {
          flash(dock, dockLabel, "Copy failed", false);
        });
      });
    }
  }

  /* ── boot ───────────────────────────────────────────────────── */

  function init() {
    theme();
    progress();
    countdown();
    fadeIn();
    share();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
