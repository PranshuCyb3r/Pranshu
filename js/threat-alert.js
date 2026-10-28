/**
 * ZeR0CyB3r - Real-Time Threat Alert & High-Risk Security Breach Detection
 * Triggers subtle red glow effect & tactical HUD overlay upon reaching Contact Section.
 */

(function () {
  'use strict';

  let isAlertActive = false;
  let isDismissedByUser = false;
  let isSoundEnabled = true;
  let audioCtx = null;
  let contactElement = null;
  let overlayElement = null;

  // Initialize Web Audio Context for authentic tactical cyber telemetry sound
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Play subtle tactical cyber chirp (non-jarring, low volume 0.02)
  function playThreatAudioChirp() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Dual-tone security sweep: 750Hz down to 420Hz in 0.18s
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Create the Threat Alert HUD DOM structure
  function createThreatOverlayDOM() {
    if (document.getElementById('threatAlertOverlay')) {
      return document.getElementById('threatAlertOverlay');
    }

    const overlay = document.createElement('div');
    overlay.id = 'threatAlertOverlay';
    overlay.className = 'threat-alert-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');

    overlay.innerHTML = `
      <div class="threat-scanlines"></div>
      
      <!-- Corner HUD Brackets -->
      <div class="threat-hud-bracket top-left"></div>
      <div class="threat-hud-bracket top-right"></div>
      <div class="threat-hud-bracket bottom-left"></div>
      <div class="threat-hud-bracket bottom-right"></div>

      <!-- Floating Tactical HUD Banner -->
      <div class="threat-hud-banner" id="threatHudBanner">
        <div class="threat-beacon-wrap">
          <div class="threat-beacon-ring"></div>
          <div class="threat-beacon-core"></div>
        </div>

        <div class="threat-hud-details">
          <div class="threat-hud-title">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>THREAT ALERT // DEFCON-1 BREACH SIMULATION</span>
          </div>
          <div class="threat-hud-sub">
            SECTOR 06: CONTACT PERIMETER DETECTED &bull; ENCRYPTED TRANSMISSION ARMED
          </div>
        </div>

        <button type="button" class="threat-hud-sound-btn" id="threatSoundToggle" title="Toggle audio chime">
          <i class="fa-solid fa-volume-high"></i>
        </button>

        <button type="button" class="threat-hud-dismiss-btn" id="threatDismissBtn" title="Acknowledge alert">
          <i class="fa-solid fa-check"></i>
          <span>ACKNOWLEDGE</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind Controls
    const dismissBtn = overlay.querySelector('#threatDismissBtn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isDismissedByUser = true;
        deactivateThreatAlert(true);
      });
    }

    const soundBtn = overlay.querySelector('#threatSoundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isSoundEnabled = !isSoundEnabled;
        soundBtn.innerHTML = isSoundEnabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
        soundBtn.classList.toggle('muted', !isSoundEnabled);
      });
    }

    return overlay;
  }

  let shakeTimeoutId = null;

  // Trigger CSS-based viewport shake animation upon breach alert
  function triggerViewportShake() {
    if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
    document.body.classList.remove('threat-viewport-shake');
    // Force DOM reflow to restart CSS animation reliably
    void document.body.offsetWidth;
    document.body.classList.add('threat-viewport-shake');
    shakeTimeoutId = setTimeout(() => {
      document.body.classList.remove('threat-viewport-shake');
    }, 600);
  }

  // Activate Threat Alert Overlay
  function activateThreatAlert() {
    if (isAlertActive || isDismissedByUser) return;
    isAlertActive = true;

    if (!overlayElement) {
      overlayElement = createThreatOverlayDOM();
    }

    overlayElement.classList.add('active');
    document.body.classList.add('threat-alert-active');

    // Trigger CSS-based viewport shake animation
    triggerViewportShake();

    // Trigger subtle cyber chirp
    playThreatAudioChirp();
  }

  // Deactivate Threat Alert Overlay
  function deactivateThreatAlert(force) {
    if (!isAlertActive && !force) return;
    isAlertActive = false;

    if (overlayElement) {
      overlayElement.classList.remove('active');
    }
    document.body.classList.remove('threat-alert-active');
  }

  // Initialize Detection on Scroll & Intersection
  function initThreatDetection() {
    contactElement = document.getElementById('contact');
    if (!contactElement) return;

    overlayElement = createThreatOverlayDOM();

    // 1. Intersection Observer for modern viewport detection
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
              activateThreatAlert();
            } else if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
              deactivateThreatAlert();
              // Reset dismissed state so alert re-arms when re-entering later
              isDismissedByUser = false;
            }
          });
        },
        {
          root: null,
          rootMargin: '-30px 0px -30px 0px',
          threshold: [0, 0.15, 0.5, 0.8]
        }
      );

      observer.observe(contactElement);
    }

    // 2. Continuous Scroll Fallback (handles smooth scroll links like #contact click)
    let isTicking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!isTicking) {
          window.requestAnimationFrame(() => {
            if (contactElement) {
              const rect = contactElement.getBoundingClientRect();
              const viewHeight = window.innerHeight || document.documentElement.clientHeight;
              const isVisible = rect.top < viewHeight * 0.78 && rect.bottom > viewHeight * 0.22;

              if (isVisible && !isAlertActive && !isDismissedByUser) {
                activateThreatAlert();
              } else if (!isVisible && isAlertActive) {
                deactivateThreatAlert();
                isDismissedByUser = false;
              }
            }
            isTicking = false;
          });
          isTicking = true;
        }
      },
      { passive: true }
    );
  }

  // Global Threat Alert Controller
  window.ThreatAlert = {
    trigger: activateThreatAlert,
    dismiss: () => {
      isDismissedByUser = true;
      deactivateThreatAlert(true);
    },
    reset: () => {
      isDismissedByUser = false;
      deactivateThreatAlert(true);
    },
    toggleSound: () => {
      isSoundEnabled = !isSoundEnabled;
      return isSoundEnabled;
    },
    isActive: () => isAlertActive
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreatDetection);
  } else {
    initThreatDetection();
  }
})();
