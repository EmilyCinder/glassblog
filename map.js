document.addEventListener("DOMContentLoaded", () => {
  const mapBtn = document.getElementById("mapBtn");
  const backdrop = document.getElementById("atlasBackdrop");
  const panel = document.getElementById("atlasPanel");
  const closeBtn = document.getElementById("atlasClose");

  if (!mapBtn || !backdrop || !panel || !closeBtn) return;

  let mapInited = false;
  let atlasMap = null;

  function makeRuneIcon(glyph){
    return L.divIcon({
      className: "",
      html: `<div class="rune-pin"><div class="rune-glyph">${glyph || "✦"}</div></div>`,
      iconSize: [56,56],
      iconAnchor: [28,28]
    });
  }

  function initMapOnce(){
    if (mapInited) return;
    if (typeof L === "undefined") {
      console.error("Leaflet not loaded (L is undefined).");
      return;
    }

    atlasMap = L.map("leafletMap", { zoomControl: true }).setView([45.52, -122.67], 7);

    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: '&copy; OpenTopoMap (CC-BY-SA) &copy; OpenStreetMap contributors'
    }).addTo(atlasMap);

    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    places.forEach(p => {
      L.marker([p.lat, p.lng], { icon: makeRuneIcon(p.glyph) })
        .addTo(atlasMap)
        .bindPopup(`
          <div style="min-width:210px">
            <div style="font-family: var(--font-atlas, 'Uncial Antiqua', serif); letter-spacing:.04em; font-size:1.05rem">
              ${p.title}
            </div>
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

    mapInited = true;
    window.__atlasMap = atlasMap;
  }

  function openAtlas(){
    document.documentElement.classList.add("atlas-open");
    mapBtn.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");

    initMapOnce();

    if (atlasMap) setTimeout(() => atlasMap.invalidateSize(true), 220);
  }

  function closeAtlas(){
    document.documentElement.classList.remove("atlas-open");
    mapBtn.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("aria-hidden", "true");
  }

  function toggleAtlas(){
    const open = document.documentElement.classList.contains("atlas-open");
    open ? closeAtlas() : openAtlas();
  }

  mapBtn.addEventListener("click", toggleAtlas);
  closeBtn.addEventListener("click", closeAtlas);
  backdrop.addEventListener("click", closeAtlas);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAtlas();
  });
});