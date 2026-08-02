(function () {
  "use strict";

  /* ===== Countdown ===== */
  var NIKKAH_DATE = new Date("2026-09-28T00:00:00");

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMinutes = document.getElementById("cd-minutes");
  var elMessage = document.getElementById("countdown-message");
  var timerEl = document.getElementById("countdown-timer");

  function updateCountdown() {
    var now = new Date();
    var diff = NIKKAH_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      if (timerEl) timerEl.style.display = "none";
      if (elMessage) elMessage.textContent = "Alhamdulillah — the Nikkah day has arrived!";
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (elDays) elDays.textContent = String(days);
    if (elHours) elHours.textContent = String(hours).padStart(2, "0");
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000 * 30);

  /* ===== Copy invitation link ===== */
  var copyBtn = document.getElementById("copy-link-btn");
  var copyLabel = document.getElementById("copy-link-label");

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = window.location.href;

      function showCopied() {
        copyBtn.classList.add("copied");
        var original = "Copy Invitation Link";
        if (copyLabel) copyLabel.textContent = "Link Copied!";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          if (copyLabel) copyLabel.textContent = original;
        }, 2000);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(showCopied).catch(function () {
          fallbackCopy(url, showCopied);
        });
      } else {
        fallbackCopy(url, showCopied);
      }
    });
  }

  function fallbackCopy(text, onSuccess) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } catch (err) {
      /* clipboard unavailable; silently ignore */
    }
    document.body.removeChild(textarea);
  }

  /* ===== Scroll reveal ===== */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
