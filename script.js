(() => {
  const EVENT_START = "2026-12-19T21:00:00-03:00";
  const EVENT_END = "2026-12-20T05:00:00-03:00";
  const PLAYLIST_URL = "https://open.spotify.com/playlist/2RuoYeEoOOyDGmWTlbDqvh?si=1yUTbAxoStSXkfY3Dcx87g&utm_source=whatsapp&pt=e5b328f234f55e761f35da2b388436c6&pi=_B4S7V3GRZGoG";
  const target = new Date(EVENT_START).getTime();
  const units = Object.fromEntries([...document.querySelectorAll("[data-unit]")].map(node => [node.dataset.unit, node]));

  function tick() {
    const total = Math.max(0, target - Date.now());
    const seconds = Math.floor(total / 1000);
    const values = {
      days: String(Math.floor(seconds / 86400)),
      hours: String(Math.floor(seconds / 3600) % 24).padStart(2, "0"),
      minutes: String(Math.floor(seconds / 60) % 60).padStart(2, "0"),
      seconds: String(seconds % 60).padStart(2, "0")
    };
    Object.entries(values).forEach(([unit, value]) => {
      if (units[unit].textContent === value) return;
      units[unit].textContent = value;
      units[unit].classList.remove("tick-pop");
      void units[unit].offsetWidth;
      units[unit].classList.add("tick-pop");
    });
  }
  tick();
  setInterval(tick, 1000);

  const countdownPanel = document.querySelector(".countdown-panel");
  if ("IntersectionObserver" in window) {
    const countdownObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countdownPanel.classList.add("is-visible");
        countdownObserver.disconnect();
      });
    }, { threshold: .32 });
    countdownObserver.observe(countdownPanel);
  } else {
    countdownPanel.classList.add("is-visible");
  }

  const utc = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Julieta XV//ES", "BEGIN:VEVENT", "UID:julieta-xv-20261219@invitacion", `DTSTART:${utc(EVENT_START)}`, `DTEND:${utc(EVENT_END)}`, "SUMMARY:Mis XV de Julieta", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  document.querySelector(".calendar-hotspot").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));

  const datePanel = document.querySelector(".date-panel");
  const dateReveal = datePanel.querySelector(".date-reveal");
  const dateRevealCanvas = dateReveal.querySelector(".date-reveal__canvas");
  const dateRevealButton = dateReveal.querySelector(".date-reveal__button");
  const dateMagic = datePanel.querySelector(".date-magic");
  const dateSparkles = datePanel.querySelector(".date-sparkles");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dateRevealStorageKey = "julieta-date-revealed-v1";
  let dateWasRevealed = false;
  try {
    dateWasRevealed = sessionStorage.getItem(dateRevealStorageKey) === "true";
  } catch {
    dateWasRevealed = false;
  }

  // Destellos que quedan titilando sobre toda la sección una vez descubierta la fecha.
  const sparkleColors = ["#ffffff", "#ffffff", "#dfe6ff", "#8fb4ff", "#307bff"];
  for (let i = 0; i < 110; i++) {
    const sparkle = document.createElement("span");
    const isDot = Math.random() < .3;
    if (isDot) sparkle.classList.add("is-dot");
    sparkle.style.setProperty("--x", `${(Math.random() * 96 + 2).toFixed(1)}%`);
    sparkle.style.setProperty("--y", `${(Math.random() * 96 + 2).toFixed(1)}%`);
    sparkle.style.setProperty("--size", `${isDot ? 3 + Math.random() * 4 : 9 + Math.random() * 20}px`);
    sparkle.style.setProperty("--color", sparkleColors[Math.floor(Math.random() * sparkleColors.length)]);
    sparkle.style.setProperty("--duration", `${(1.6 + Math.random() * 2.6).toFixed(2)}s`);
    sparkle.style.setProperty("--delay", `${(Math.random() * 3).toFixed(2)}s`);
    sparkle.style.filter = `drop-shadow(0 0 ${isDot ? 4 : 7}px ${Math.random() < .5 ? "#fff" : "#307bff"})`;
    dateSparkles.append(sparkle);
  }

  // No se puede seguir bajando hasta descubrir la fecha.
  let dateScrollUnlocked = dateWasRevealed;
  let isClampingDateScroll = false;
  let touchStartY = null;
  const getDateGateTop = () => {
    const bounds = datePanel.getBoundingClientRect();
    return Math.round(bounds.top + window.scrollY + Math.max(0, (bounds.height - window.innerHeight) / 2));
  };
  const isAtDateGate = () => window.scrollY >= getDateGateTop() - 2;
  const clampDateScroll = () => {
    if (dateScrollUnlocked || isClampingDateScroll) return;
    const dateGateTop = getDateGateTop();
    if (window.scrollY <= dateGateTop) return;
    isClampingDateScroll = true;
    window.scrollTo(0, dateGateTop);
    requestAnimationFrame(() => { isClampingDateScroll = false; });
  };
  window.addEventListener("scroll", clampDateScroll, { passive: true });
  window.addEventListener("wheel", event => {
    if (!dateScrollUnlocked && event.deltaY > 0 && isAtDateGate()) {
      event.preventDefault();
      clampDateScroll();
    }
  }, { passive: false });
  window.addEventListener("touchstart", event => {
    touchStartY = event.touches[0]?.clientY ?? null;
  }, { passive: true });
  window.addEventListener("touchmove", event => {
    const currentY = event.touches[0]?.clientY;
    if (!dateScrollUnlocked && touchStartY !== null && currentY !== undefined && currentY < touchStartY && isAtDateGate() && !dateReveal.contains(event.target)) {
      event.preventDefault();
      clampDateScroll();
    }
    touchStartY = currentY ?? touchStartY;
  }, { passive: false });
  window.addEventListener("touchend", () => { touchStartY = null; });
  window.addEventListener("keydown", event => {
    if (!dateScrollUnlocked && ["ArrowDown", "PageDown", "End", " "].includes(event.key) && isAtDateGate()) {
      event.preventDefault();
      clampDateScroll();
    }
  });
  window.addEventListener("pageshow", clampDateScroll);

  if (dateWasRevealed) {
    dateReveal.hidden = true;
    datePanel.classList.add("is-revealed", "is-revealed-instant");
  } else {
    const context = dateRevealCanvas.getContext("2d", { alpha: true });
    let activePointer = null;
    let previousPoint = null;
    let horizontalTravel = 0;

    // Capa negra espejada que se raspa con el dedo.
    const paintDateCover = () => {
      if (horizontalTravel > 0) return;
      const bounds = dateReveal.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      dateRevealCanvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      dateRevealCanvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.globalCompositeOperation = "source-over";
      const base = context.createRadialGradient(bounds.width / 2, bounds.height * .48, 0, bounds.width / 2, bounds.height * .48, Math.max(bounds.width, bounds.height) * .7);
      base.addColorStop(0, "#0a1d63");
      base.addColorStop(.45, "#030a22");
      base.addColorStop(1, "#000");
      context.fillStyle = base;
      context.fillRect(0, 0, bounds.width, bounds.height);
      const specks = Math.round(bounds.width * bounds.height / 900);
      for (let i = 0; i < specks; i++) {
        const size = Math.random() < .85 ? 1 + Math.random() * 1.6 : 2.5 + Math.random() * 2.5;
        context.fillStyle = Math.random() < .7 ? `rgb(220 228 255 / ${.12 + Math.random() * .45})` : `rgb(48 123 255 / ${.2 + Math.random() * .5})`;
        context.fillRect(Math.random() * bounds.width, Math.random() * bounds.height, size, size);
      }
      dateReveal.classList.add("is-initialized");
    };

    const eraseBetween = (from, to) => {
      const brush = Math.min(46, Math.max(24, dateReveal.clientWidth * .075));
      context.globalCompositeOperation = "destination-out";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = brush * 2;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    };

    const completeDateReveal = () => {
      if (dateReveal.classList.contains("is-finishing")) return;
      dateReveal.classList.add("is-finishing");
      datePanel.classList.add("is-revealed");
      if (!reducedMotion) dateMagic.classList.add("is-active");
      try {
        sessionStorage.setItem(dateRevealStorageKey, "true");
      } catch {
        // La fecha se descubre igual aunque el almacenamiento esté bloqueado.
      }
      window.setTimeout(() => {
        dateReveal.hidden = true;
        dateScrollUnlocked = true;
      }, reducedMotion ? 280 : 450);
    };

    paintDateCover();
    new ResizeObserver(paintDateCover).observe(dateReveal);

    dateReveal.addEventListener("pointerdown", event => {
      if (event.target === dateRevealButton) return;
      activePointer = event.pointerId;
      previousPoint = { x: event.offsetX, y: event.offsetY };
      dateReveal.classList.add("has-interacted");
      dateReveal.setPointerCapture(event.pointerId);
    });
    dateReveal.addEventListener("pointermove", event => {
      if (event.pointerId !== activePointer || !previousPoint) return;
      const nextPoint = { x: event.offsetX, y: event.offsetY };
      const deltaX = nextPoint.x - previousPoint.x;
      const deltaY = nextPoint.y - previousPoint.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        eraseBetween(previousPoint, nextPoint);
        horizontalTravel += Math.abs(deltaX);
        const revealProgress = horizontalTravel / (dateReveal.clientWidth * 4.6);
        dateReveal.classList.toggle("is-scratching", revealProgress > .05);
        if (revealProgress >= 1) completeDateReveal();
      }
      previousPoint = nextPoint;
    });
    const releaseDatePointer = event => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      previousPoint = null;
    };
    dateReveal.addEventListener("pointerup", releaseDatePointer);
    dateReveal.addEventListener("pointercancel", releaseDatePointer);
    dateRevealButton.addEventListener("click", completeDateReveal);
  }

  const locationModal = document.querySelector(".location-modal");
  const locationCopyStatus = document.querySelector(".location-copy-status");
  document.querySelector("[data-open-location]").addEventListener("click", () => locationModal.showModal());
  document.querySelector("[data-close-location]").addEventListener("click", () => locationModal.close());
  locationModal.addEventListener("click", event => {
    if (event.target === locationModal) locationModal.close();
  });
  document.querySelector("[data-copy-address]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("Janos 1, Avellaneda");
      locationCopyStatus.textContent = "DIRECCIÓN COPIADA";
    } catch {
      locationCopyStatus.textContent = "JANOS 1, AVELLANEDA";
    }
  });

  const galleryPanel = document.querySelector(".gallery-panel");
  const galleryLightbox = document.querySelector(".gallery-lightbox");
  const galleryLightboxImage = galleryLightbox.querySelector("img");
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => galleryPanel.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: .22 });
  galleryObserver.observe(galleryPanel);
  document.querySelectorAll("[data-gallery-src]").forEach(photo => {
    photo.addEventListener("click", () => {
      galleryLightboxImage.src = photo.dataset.gallerySrc;
      galleryLightboxImage.alt = photo.querySelector("img").alt;
      galleryLightbox.showModal();
    });
  });
  document.querySelector("[data-close-gallery]").addEventListener("click", () => galleryLightbox.close());
  galleryLightbox.addEventListener("click", event => {
    if (event.target === galleryLightbox) galleryLightbox.close();
  });

  const giftModal = document.querySelector(".gift-modal");
  const openGifts = document.querySelector("[data-open-gifts]");
  const closeGifts = document.querySelector("[data-close-gifts]");
  const copyAlias = document.querySelector("[data-copy-alias]");
  const copyStatus = document.querySelector(".copy-status");
  const giftAlias = document.querySelector("#gift-alias").textContent.trim();
  openGifts.addEventListener("click", () => giftModal.showModal());
  closeGifts.addEventListener("click", () => giftModal.close());
  giftModal.addEventListener("click", event => {
    if (event.target === giftModal) giftModal.close();
  });
  copyAlias.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(giftAlias);
      copyStatus.textContent = "ALIAS COPIADO";
    } catch {
      copyStatus.textContent = `ALIAS: ${giftAlias}`;
    }
  });

  const musicPanel = document.querySelector(".music-panel");
  const playlistButton = document.querySelector(".playlist-button");
  playlistButton.href = PLAYLIST_URL;
  const musicObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => musicPanel.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: 0.05 });
  musicObserver.observe(musicPanel);

  const backgroundMusic = document.querySelector("#backgroundMusic");
  const audioToggle = document.querySelector(".audio-toggle");
  audioToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();
      } catch {
        return;
      }
    } else {
      backgroundMusic.pause();
    }
  });
  const syncAudioButton = () => {
    const isPlaying = !backgroundMusic.paused;
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
    audioToggle.querySelector(".audio-toggle__icon").textContent = isPlaying ? "Ⅱ" : "♪";
  };
  backgroundMusic.addEventListener("play", syncAudioButton);
  backgroundMusic.addEventListener("pause", syncAudioButton);

  const invitationIntro = document.querySelector(".invitation-intro");
  const enterInvitation = async withMusic => {
    if (withMusic) {
      try {
        await backgroundMusic.play();
      } catch {
        // La invitación igualmente se abre si el navegador bloquea el audio.
      }
    } else {
      backgroundMusic.pause();
    }
    invitationIntro.classList.add("is-bursting");
    window.setTimeout(() => {
      invitationIntro.classList.add("is-leaving");
      document.body.classList.remove("intro-open");
      window.setTimeout(() => {
        invitationIntro.hidden = true;
      }, 760);
    }, 520);
  };
  document.querySelector("[data-enter-with-music]").addEventListener("click", () => enterInvitation(true));
  document.querySelector("[data-enter-without-music]").addEventListener("click", () => enterInvitation(false));
})();
