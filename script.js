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
