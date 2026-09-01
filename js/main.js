(function () {
  "use strict";

  var WEDDING_DATE = new Date("2027-02-14T00:00:00").getTime();
  var GROOM_FIRST = "Kavish";
  var BRIDE_FIRST = "Preeti";
  var RSVP_TEMPLATE_KEY = "kabir_aira_rsvp_v1";
  var WHATSAPP_NUMBER = ""; // TODO: set the couple's WhatsApp number (digits only, with country code)

  var IMAGES_TO_PRELOAD = [
    "assets/images/couple_hero.png",
    "assets/images/groom.png",
    "assets/images/bride.png",
    "assets/images/gallery-1.png",
    "assets/images/gallery-2.png",
    "assets/images/gallery-3.png",
    "assets/images/gallery-4.png",
    "assets/images/gallery-5.png",
    "assets/images/gallery-6.png"
  ];

  /* ============================================================
     Intro particles
     ============================================================ */
  function buildIntroParticles() {
    var wrap = document.getElementById("introParticles");
    if (!wrap) return;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < 20; i++) {
      var streak = document.createElement("div");
      streak.className = "intro-streak";
      var dur = (5 + 10 * Math.random()).toFixed(2);
      var delay = (5 * Math.random()).toFixed(2);
      streak.style.left = (100 * Math.random()).toFixed(2) + "%";
      streak.style.animationDuration = dur + "s";
      streak.style.animationDelay = delay + "s";
      frag.appendChild(streak);
    }
    for (var j = 0; j < 10; j++) {
      var bokeh = document.createElement("div");
      bokeh.className = "intro-bokeh";
      var bdur = (8 + 12 * Math.random()).toFixed(2);
      var bdelay = (5 * Math.random()).toFixed(2);
      bokeh.style.left = (100 * Math.random()).toFixed(2) + "%";
      bokeh.style.top = (100 * Math.random()).toFixed(2) + "%";
      bokeh.style.animationDuration = bdur + "s";
      bokeh.style.animationDelay = bdelay + "s";
      frag.appendChild(bokeh);
    }
    wrap.appendChild(frag);
  }

  /* ============================================================
     Preload assets, then unlock the "Open Invitation" button
     ============================================================ */
  function preloadAndReady(onReady) {
    var toLoad = IMAGES_TO_PRELOAD.slice();
    var loadedCount = 0;
    var total = toLoad.length;

    function done() {
      loadedCount++;
      if (loadedCount === total) {
        setTimeout(onReady, 500);
      }
    }
    if (total === 0) { setTimeout(onReady, 500); return; }
    toLoad.forEach(function (src) {
      var img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });

    var audio = document.getElementById("bgAudio");
    if (audio) { try { audio.load(); } catch (e) {} }
  }

  /* ============================================================
     Intro open / close flow
     ============================================================ */
  function initIntro() {
    var overlay = document.getElementById("introOverlay");
    var btn = document.getElementById("openInvitationBtn");
    var label = document.getElementById("openBtnLabel");
    var siteContent = document.getElementById("siteContent");
    var musicWrapper = document.getElementById("musicWrapper");
    var body = document.body;

    buildIntroParticles();

    preloadAndReady(function () {
      btn.disabled = false;
      btn.classList.add("is-ready");
      label.textContent = "Open Invitation";
    });

    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      overlay.classList.add("is-leaving");
      body.classList.remove("pre-open");
      body.style.overflow = "";
      document.documentElement.style.overflow = "";

      siteContent.style.display = "";
      siteContent.style.opacity = "0";
      requestAnimationFrame(function () {
        siteContent.style.transition = "opacity 1s ease";
        siteContent.style.opacity = "1";
      });

      musicWrapper.classList.add("is-visible");
      window.__invitationOpened = true;
      document.dispatchEvent(new CustomEvent("invitation:opened"));

      setTimeout(function () {
        overlay.classList.add("is-gone");
      }, 1200);

      initRevealObserver();
      window.scrollTo(0, 0);
    });
  }

  /* ============================================================
     Scroll reveal (Framer Motion whileInView equivalent)
     ============================================================ */
  function initRevealObserver() {
    var targets = document.querySelectorAll("[data-reveal], .hero-bg-letter[data-inview]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     Hero scroll cue
     ============================================================ */
  function initScrollCue() {
    var cue = document.getElementById("scrollCue");
    if (!cue) return;
    cue.addEventListener("click", function () {
      var target = document.getElementById("couple-section");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ============================================================
     Countdown
     ============================================================ */
  function initCountdown() {
    var dEl = document.getElementById("cdDays");
    var hEl = document.getElementById("cdHours");
    var mEl = document.getElementById("cdMinutes");
    var sEl = document.getElementById("cdSeconds");
    if (!dEl) return;

    function tick() {
      var diff = WEDDING_DATE - Date.now();
      if (diff < 0) { clearInterval(timer); return; }
      var days = Math.floor(diff / 864e5);
      var hours = Math.floor((diff % 864e5) / 36e5);
      var minutes = Math.floor((diff % 36e5) / 6e4);
      var seconds = Math.floor((diff % 6e4) / 1e3);
      dEl.textContent = days;
      hEl.textContent = String(hours).padStart(2, "0");
      mEl.textContent = String(minutes).padStart(2, "0");
      sEl.textContent = String(seconds).padStart(2, "0");
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ============================================================
     Save the Date — curtain reveal + confetti
     ============================================================ */
  function initSaveTheDate() {
    var reveal = document.getElementById("stdReveal");
    var prompt = document.getElementById("stdPrompt");
    if (!reveal) return;
    var opened = false;

    reveal.addEventListener("click", function () {
      if (!opened && window.confetti) {
        var end = Date.now() + 3000;
        var colors = ["#d4af37", "#fdf5e6", "#b8860b"];
        (function frame() {
          var remaining = end - Date.now();
          if (remaining <= 0) return;
          var particleCount = (remaining / 3000) * 50;
          window.confetti({
            particleCount: particleCount, startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000,
            origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 }, colors: colors
          });
          window.confetti({
            particleCount: particleCount, startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000,
            origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 }, colors: colors
          });
          setTimeout(frame, 250);
        })();
      }
      opened = !opened;
      reveal.classList.toggle("is-open", opened);
      prompt.style.opacity = opened ? "0" : "1";
    });

    function rand(a, b) { return Math.random() * (b - a) + a; }
  }

  /* ============================================================
     Gallery pull-cord light switch
     ============================================================ */
  function initGallery() {
    var section = document.getElementById("gallerySection");
    var handle = document.getElementById("galleryHandle");
    var lamp = document.getElementById("galleryLamp");
    if (!section || !handle) return;
    var on = false;

    function toggle() {
      on = !on;
      section.classList.toggle("lights-on", on);
      lamp.classList.toggle("is-on", on);
    }
    handle.addEventListener("click", toggle);

    var startY = null;
    handle.addEventListener("touchstart", function (e) { startY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener("touchend", function (e) {
      if (startY === null) return;
      var endY = (e.changedTouches && e.changedTouches[0].clientY) || startY;
      if (endY - startY > 10) toggle();
      startY = null;
    });
  }

  /* ============================================================
     Venue sparkles
     ============================================================ */
  function initVenueSparkles() {
    var wrap = document.getElementById("venueSparkles");
    if (!wrap) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 6; i++) {
      var s = document.createElement("div");
      s.className = "venue-sparkle";
      s.style.left = (15 + 15 * i) + "%";
      s.style.animationDuration = (5 + i) + "s";
      s.style.animationDelay = (2 * i) + "s";
      frag.appendChild(s);
    }
    wrap.appendChild(frag);
  }

  /* ============================================================
     Footer floating petals
     ============================================================ */
  function initFooterPetals() {
    var wrap = document.getElementById("footerPetals");
    if (!wrap) return;
    var heartSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 15; i++) {
      var p = document.createElement("div");
      p.className = "footer-petal";
      var size = (10 * Math.random() + 10).toFixed(1);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = (100 * Math.random()).toFixed(2) + "%";
      p.style.setProperty("--pdx", (i % 2 === 0 ? "100px" : "-100px"));
      p.style.animationDuration = (10 + 10 * Math.random()).toFixed(2) + "s";
      p.style.animationDelay = (20 * Math.random()).toFixed(2) + "s";
      p.innerHTML = heartSvg;
      frag.appendChild(p);
    }
    wrap.appendChild(frag);
  }

  /* ============================================================
     Music player
     ============================================================ */
  function initMusicPlayer() {
    var audio = document.getElementById("bgAudio");
    var btn = document.getElementById("musicBtn");
    var wrapper = document.getElementById("musicWrapper");
    var iconWrap = document.getElementById("musicIcon");
    if (!audio || !btn) return;

    var ICON_PLAY = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.383A.705.705 0 0 0 11 19.298z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    var ICON_MUTE = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.383A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';

    var isPlaying = false;
    var userPaused = false;
    var isOpened = false;
    var wasPlayingBeforeHidden = false;
    var retryTimer = null;
    var autoStartAttempted = false;

    document.addEventListener("invitation:opened", function () {
      isOpened = true;
      attemptAutoplay();
    });

    function setPlayingUI(playing) {
      isPlaying = playing;
      btn.classList.toggle("is-playing", playing);
      iconWrap.innerHTML = playing ? ICON_PLAY : ICON_MUTE;
    }

    function attemptAutoplay() {
      if (!isOpened || isPlaying || userPaused || autoStartAttempted) return;
      audio.play().then(function () {
        setPlayingUI(true);
        autoStartAttempted = true;
        if (retryTimer) { clearInterval(retryTimer); retryTimer = null; }
      }).catch(function () {
        if (!retryTimer) {
          retryTimer = setInterval(function () {
            if (isPlaying || userPaused || document.visibilityState !== "visible") return;
            audio.play().then(function () {
              setPlayingUI(true);
              autoStartAttempted = true;
              clearInterval(retryTimer);
              retryTimer = null;
            }).catch(function () {});
          }, 2000);
        }
      });
    }

    function firstInteractionPlay() {
      if (isPlaying || userPaused) { removeInteractionListeners(); return; }
      audio.play().then(function () {
        setPlayingUI(true);
        autoStartAttempted = true;
        if (retryTimer) { clearInterval(retryTimer); retryTimer = null; }
      }).catch(function () {});
      removeInteractionListeners();
    }
    function removeInteractionListeners() {
      window.removeEventListener("click", firstInteractionPlay);
      window.removeEventListener("touchstart", firstInteractionPlay);
    }
    window.addEventListener("click", firstInteractionPlay);
    window.addEventListener("touchstart", firstInteractionPlay);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        wasPlayingBeforeHidden = isPlaying;
        if (isPlaying) { audio.pause(); setPlayingUI(false); }
      } else if (document.visibilityState === "visible") {
        if (wasPlayingBeforeHidden && isOpened && !userPaused) {
          audio.play().then(function () { setPlayingUI(true); }).catch(function () {});
        }
      }
    });

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
        setPlayingUI(false);
        userPaused = true;
      } else {
        audio.play().then(function () {
          setPlayingUI(true);
          userPaused = false;
        }).catch(function () {});
      }
    });

    setPlayingUI(false);
  }

  /* ============================================================
     RSVP — local (client-side) guestbook store
     Note: the live site posts to a private Google Apps Script tied
     to Dreams Invite's own spreadsheet. This replica cannot and
     should not write into that private backend, so responses are
     persisted to localStorage instead, preserving identical UX.
     ============================================================ */
  function initRSVP() {
    var form = document.getElementById("rsvpForm");
    if (!form) return;

    var nameInput = document.getElementById("rsvpName");
    var phoneInput = document.getElementById("rsvpPhone");
    var statusInput = document.getElementById("rsvpStatus");
    var guestsInput = document.getElementById("rsvpGuests");
    var messageInput = document.getElementById("rsvpMessage");
    var errorBox = document.getElementById("rsvpError");
    var errorText = document.getElementById("rsvpErrorText");
    var submitBtn = document.getElementById("rsvpSubmitBtn");
    var btnContent = document.getElementById("rsvpBtnContent");
    var whatsappBtn = document.getElementById("rsvpWhatsappBtn");

    var emptyState = document.getElementById("rsvpEmptyState");
    var carouselEl = document.getElementById("rsvpCarousel");
    var controls = document.getElementById("rsvpControls");
    var indicatorsEl = document.getElementById("rsvpIndicators");
    var prevBtn = document.getElementById("rsvpPrevBtn");
    var nextBtn = document.getElementById("rsvpNextBtn");
    var wrapperEl = document.getElementById("rsvpCarouselWrapper");

    var responses = loadResponses();
    var activeIndex = 0;
    var autoTimer = null;
    var paused = false;

    function loadResponses() {
      try {
        var raw = localStorage.getItem(RSVP_TEMPLATE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    function saveResponses() {
      try { localStorage.setItem(RSVP_TEMPLATE_KEY, JSON.stringify(responses)); } catch (e) {}
    }

    function renderCarousel() {
      carouselEl.innerHTML = "";
      indicatorsEl.innerHTML = "";
      if (responses.length === 0) {
        emptyState.style.display = "";
        carouselEl.style.display = "none";
        controls.style.display = "none";
        return;
      }
      emptyState.style.display = "none";
      carouselEl.style.display = "flex";
      carouselEl.style.width = (100 * responses.length) + "%";
      controls.style.display = responses.length > 1 ? "flex" : "none";

      responses.forEach(function (r, i) {
        var card = document.createElement("div");
        card.className = "rsvp-response-card";
        card.style.width = (100 / responses.length) + "%";
        var initial = (r.name && r.name.charAt(0)) || "G";
        var statusText = r.status === "attending" ? ("Attending • " + r.guests + " Guests") : "Declined";
        card.innerHTML =
          '<div class="rsvp-card-header">' +
            '<div class="rsvp-avatar">' + escapeHtml(initial) + '</div>' +
            '<div><h4 class="rsvp-guest-name">' + escapeHtml(r.name) + '</h4>' +
            '<span class="rsvp-guest-status">' + escapeHtml(statusText) + '</span></div>' +
          '</div>' +
          '<p class="rsvp-guest-message">' + escapeHtml(r.message || "") + '</p>';
        carouselEl.appendChild(card);

        var dot = document.createElement("div");
        dot.className = "rsvp-dot" + (i === activeIndex ? " is-active" : "");
        dot.addEventListener("click", function () { setActive(i); });
        indicatorsEl.appendChild(dot);
      });
      updateCarouselPosition();
    }

    function updateCarouselPosition() {
      if (!responses.length) return;
      carouselEl.style.transform = "translateX(-" + (activeIndex * (100 / responses.length)) + "%)";
      Array.prototype.forEach.call(indicatorsEl.children, function (dot, i) {
        dot.classList.toggle("is-active", i === activeIndex);
      });
    }

    function setActive(i) {
      if (!responses.length) return;
      activeIndex = ((i % responses.length) + responses.length) % responses.length;
      updateCarouselPosition();
    }

    function startAutoRotate() {
      stopAutoRotate();
      if (responses.length > 1) {
        autoTimer = setInterval(function () {
          if (!paused) setActive(activeIndex + 1);
        }, 5000);
      }
    }
    function stopAutoRotate() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    prevBtn.addEventListener("click", function () { setActive(activeIndex - 1); });
    nextBtn.addEventListener("click", function () { setActive(activeIndex + 1); });
    wrapperEl.addEventListener("mouseenter", function () { paused = true; });
    wrapperEl.addEventListener("mouseleave", function () { paused = false; });
    wrapperEl.addEventListener("touchstart", function () { paused = true; }, { passive: true });

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str == null ? "" : String(str);
      return div.innerHTML;
    }

    function showError(msg) {
      errorText.textContent = msg;
      errorBox.style.display = "flex";
    }
    function clearError() { errorBox.style.display = "none"; }

    function resetForm() {
      form.reset();
      guestsInput.value = 1;
    }

    function setSubmitting(isSubmitting) {
      submitBtn.disabled = isSubmitting;
      btnContent.innerHTML = '<div class="rsvp-loader"></div> Sending...';
    }
    function setSuccess() {
      submitBtn.classList.add("is-success");
      btnContent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg> Sent! ✨';
      setTimeout(function () {
        submitBtn.classList.remove("is-success");
        submitBtn.disabled = false;
        btnContent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg> Confirm Attendance';
        resetForm();
      }, 3000);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError();
      var phone = phoneInput.value.trim();
      if (responses.some(function (r) { return r.phone === phone; })) {
        showError("This mobile number has already submitted an RSVP.");
        return;
      }
      setSubmitting(true);
      setTimeout(function () {
        var entry = {
          name: nameInput.value.trim(),
          phone: phone,
          status: statusInput.value,
          guests: parseInt(guestsInput.value, 10) || 1,
          message: messageInput.value.trim(),
          date: new Date().toISOString()
        };
        responses.unshift(entry);
        saveResponses();
        activeIndex = 0;
        renderCarousel();
        startAutoRotate();
        setSuccess();
      }, 500);
    });

    whatsappBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var phone = phoneInput.value.trim();
      if (!name) { alert("Please enter your name."); return; }
      if (!phone) { alert("Please enter your phone number."); return; }
      var status = statusInput.value === "attending" ? "Attending" : "Declined";
      var text =
        "*Guest Confirmation*\n" +
        "*Name:* " + name + "\n\n" +
        "*Phone:* " + phone + "\n\n" +
        "*Status:* " + status + "\n\n" +
        "*Guests:* " + guestsInput.value + "\n\n" +
        "*Message:* " + (messageInput.value.trim() || "-") + "\n";
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank");
      setSuccess();
    });

    renderCarousel();
    startAutoRotate();
  }

  /* ============================================================
     Boot
     ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    initIntro();
    initScrollCue();
    initCountdown();
    initSaveTheDate();
    initGallery();
    initVenueSparkles();
    initFooterPetals();
    initMusicPlayer();
    initRSVP();
  });
})();
