// map.js — Leaflet init + open/close toggle via the map icon
console.log("[map.js] loaded");

document.addEventListener("DOMContentLoaded", () => {
  const atlas = document.getElementById("atlas");
  const mapBtn = document.getElementById("mapBtn");
  const scrollCue = document.getElementById("scrollCue");

  if (!atlas || !mapBtn) {
    console.warn("[map.js] Missing #atlas or #mapBtn");
    return;
  }

  // Toggle open/close
  let isClosed = false;

  function setClosed(closed) {
    isClosed = closed;
    atlas.classList.toggle("is-closed", isClosed);
    mapBtn.classList.toggle("map-icon-glow", isClosed);

    // When opening, Leaflet must re-measure container
    if (!isClosed && window.__atlasMap) {
      requestAnimationFrame(() => window.__atlasMap.invalidateSize(true));
    }
  }

  mapBtn.addEventListener("click", () => {
    setClosed(!isClosed);

    // When opening, bring Atlas into view (feels like returning to the portal)
    if (!isClosed) {
      atlas.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // When closing, bring page to top of content cleanly
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      setClosed(false);
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    });
  }

  // Leaflet init
  if (typeof L === "undefined") {
    console.error("[map.js] Leaflet (L) not found. Check <head> script order.");
    return;
  }

  const map = L.map("map", { zoomControl: true }).setView([45.52, -122.67], 7);
  window.__atlasMap = map;

  // Terrain-y base looks great with parchment grading
  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: '&copy; OpenTopoMap (CC-BY-SA) &copy; OpenStreetMap contributors'
  }).addTo(map);

  function makeRuneIcon(glyph) {
    return L.divIcon({
      className: "",
      html: `<div class="rune-pin"><div class="rune-glyph">${glyph}</div></div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });
  }

  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  places.forEach(p => {
    L.marker([p.lat, p.lng], { icon: makeRuneIcon(p.glyph || "✦") })
      .addTo(map)
      .bindPopup(`
        <div style="min-width:210px">
          <div style="font-family: var(--font-atlas, 'Uncial Antiqua', serif); letter-spacing:.04em; font-size:1.05rem">${p.title}</div>
          <div style="margin-top:10px">
            <a href="${p.href}"
              style="color:#fff7f1; text-decoration:none; border:1px solid rgba(255,255,255,.12);
              padding:10px 12px; border-radius:14px; background: rgba(0,0,0,.18); display:inline-block;">
              Open Chronicle →
            </a>
          </div>
        </div>
      `);
  });

  // Sizing fixes
  requestAnimationFrame(() => map.invalidateSize(true));
  window.addEventListener("resize", () => map.invalidateSize(true));

  // Start OPEN by default
  setClosed(false);
});