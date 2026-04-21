// atlas-enhancements.js
// SAFE enhancements layer — does NOT modify your original map logic

(function () {
  function waitForMap(callback) {
    const interval = setInterval(() => {
      if (window.__atlasMap && typeof L !== "undefined") {
        clearInterval(interval);
        callback(window.__atlasMap);
      }
    }, 200);
  }

  function enhanceMap(map) {
    console.log("✨ Atlas enhancements active");

    // 🌫 Smooth cinematic zoom when popup opens
    map.on("popupopen", (e) => {
      try {
        const latlng = e.popup.getLatLng();
        map.flyTo(latlng, Math.max(map.getZoom(), 10), {
          duration: 1.2
        });
      } catch (err) {
        console.warn("FlyTo skipped:", err);
      }
    });

    // 🧠 Enhance existing markers safely
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {

        // ✨ Add subtle hover tooltip if none exists
        if (!layer.getTooltip()) {
          layer.bindTooltip("✧ Explore", {
            direction: "top",
            offset: [0, -10],
            opacity: 0.85
          });
        }

        // 🌟 Add hover glow effect (class toggle)
        layer.on("mouseover", () => {
          const el = layer.getElement();
          if (el) el.classList.add("marker-hover");
        });

        layer.on("mouseout", () => {
          const el = layer.getElement();
          if (el) el.classList.remove("marker-hover");
        });

      }
    });

    // ✨ Subtle map motion (feels alive, very modern)
    let drift = 0;
    setInterval(() => {
      drift += 0.00005;
      const center = map.getCenter();
      map.panTo([center.lat + drift, center.lng], {
        animate: true,
        duration: 5
      });
    }, 8000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    waitForMap(enhanceMap);
  });
})();