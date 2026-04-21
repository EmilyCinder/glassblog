/* ============================================================
   ethereal.js — Glass Circuits Travel
   Self-contained. No dependencies. No edits to your files.

   Features:
     1. Floating light motes (canvas particle system)
     2. Glowing cursor trail (desktop only)
     3. Bloom-on-scroll reveals (IntersectionObserver)
     4. Lazy-image blur fade-in

   Respects prefers-reduced-motion. Pauses when tab is hidden.
   ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Bloom-on-scroll (runs even with reduced motion off/on) ---------- */

  function markRevealCandidates() {
    const selectors = [
      ".vintage-card",
      ".blog-card",
      "article",
      ".section-title",
      "section > h2",
      "section > h3",
      ".ad-space"
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.closest(".no-bloom")) return;
        if (el.classList.contains("no-bloom")) return;
        el.classList.add("bloom-reveal");
      });
    });
  }

  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".bloom-reveal")
        .forEach((el) => el.classList.add("bloom-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bloom-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".bloom-reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Lazy image fade-in ---------- */

  function wireLazyImages() {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
        img.addEventListener("error", () => img.classList.add("loaded"), { once: true });
      }
    });
  }

  /* ---------- Canvas particle system ---------- */

  function initCanvas() {
    if (prefersReduced) return;

    const canvas = document.createElement("canvas");
    canvas.id = "ethereal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    /* --- Pre-render glow sprites once (big perf win) --- */
    function makeSprite(size, innerRGB, midRGB) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const cc = c.getContext("2d");
      const g = cc.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0.0, `rgba(${innerRGB}, 1)`);
      g.addColorStop(0.25, `rgba(${midRGB}, 0.55)`);
      g.addColorStop(1.0, `rgba(${midRGB}, 0)`);
      cc.fillStyle = g;
      cc.fillRect(0, 0, size, size);
      return c;
    }

    const SPRITE_SIZE = 48;
    const spriteRose = makeSprite(SPRITE_SIZE, "255,247,241", "212,180,180"); /* ivory → old-pink */
    const spriteSage = makeSprite(SPRITE_SIZE, "255,247,241", "157,178,161"); /* ivory → sage      */
    const spriteGold = makeSprite(SPRITE_SIZE, "255,247,241", "245,218,201"); /* ivory → warm gold  */

    /* --- Ambient motes --- */
    const isTouch = !hasFinePointer;
    const baseCount = isTouch ? 22 : 42;
    const MOTE_COUNT = Math.min(baseCount, Math.max(18, Math.floor(w / 26)));
    const motes = [];

    function makeMote(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 20 + Math.random() * 40,
        scale: 0.35 + Math.random() * 0.9,
        vy: -(0.06 + Math.random() * 0.22),
        vx: (Math.random() - 0.5) * 0.14,
        life: 0.55 + Math.random() * 0.45,
        pulse: Math.random() * Math.PI * 2,
        drift: 0.2 + Math.random() * 0.35,
        sprite: Math.random() < 0.55 ? spriteRose : spriteSage
      };
    }

    for (let i = 0; i < MOTE_COUNT; i++) motes.push(makeMote(true));

    /* --- Cursor sparks --- */
    const sparks = [];
    const MAX_SPARKS = 80;

    if (hasFinePointer) {
      let lastX = -9999, lastY = -9999, lastT = 0;

      window.addEventListener(
        "pointermove",
        (e) => {
          const now = performance.now();
          if (now - lastT < 14) return; // ~70fps cap
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          const dist = Math.hypot(dx, dy);

          if (dist > 2 && lastX !== -9999) {
            const count = Math.min(3, Math.ceil(dist / 10));
            for (let i = 0; i < count; i++) {
              if (sparks.length >= MAX_SPARKS) sparks.shift();
              sparks.push({
                x: e.clientX + (Math.random() - 0.5) * 6,
                y: e.clientY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5 - 0.15,
                scale: 0.22 + Math.random() * 0.38,
                life: 1,
                decay: 0.012 + Math.random() * 0.016,
                sprite: Math.random() < 0.6 ? spriteGold : spriteRose
              });
            }
          }
          lastX = e.clientX;
          lastY = e.clientY;
          lastT = now;
        },
        { passive: true }
      );

      // Clear trail when cursor leaves window
      window.addEventListener("pointerleave", () => {
        lastX = lastY = -9999;
      });
    }

    /* --- Animation loop --- */
    let running = true;
    let rafId = 0;

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) rafId = requestAnimationFrame(loop);
      else cancelAnimationFrame(rafId);
    });

    function drawSprite(sprite, x, y, scale, alpha) {
      const size = SPRITE_SIZE * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }

    function loop(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // Motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y += m.vy;
        m.pulse += 0.012;
        m.x += m.vx + Math.sin(t * 0.0004 + m.pulse) * m.drift * 0.12;

        if (m.y < -30 || m.x < -40 || m.x > w + 40) {
          motes[i] = makeMote(false);
          continue;
        }

        const pulseAlpha = (Math.sin(m.pulse) * 0.22 + 0.58) * m.life;
        drawSprite(m.sprite, m.x, m.y, m.scale, pulseAlpha);
      }

      // Cursor sparks
      if (sparks.length) {
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy -= 0.005; // drift upward, firefly-ish
          s.life -= s.decay;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          drawSprite(s.sprite, s.x, s.y, s.scale, s.life * 0.9);
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
  }

  /* ---------- Boot ---------- */

  function boot() {
    markRevealCandidates();
    observeReveals();
    wireLazyImages();
    initCanvas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();