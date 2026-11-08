/* Dlouhé podržení karty filmu nebo seriálu na telefonu: nabídka „Ukazovat víc / méně podobného“.
 * Ovlivňuje jen doporučování (váhy žánrů v aiBrain), nic dalšího. Karty: .nf-card (úvodní stránka), .dv-card (Objevovat a hledání), .wl-card (Oblíbené). */
(function () {
  "use strict";
  var HOLD_MS = 450, MOVE_PX = 10, CARDS = ".nf-card, .dv-card, .wl-card";
  var timer = null, startX = 0, startY = 0, suppressUntil = 0, sheet = null, current = null;

  // Z karty vytáhne, o jaký titul jde: { title, type, tmdbId, genreIds, slug }
  function itemFor(card) {
    if (card._dvItem) { var d = card._dvItem; return { title: d.title, type: d.type, tmdbId: d.id, genreIds: d.genreIds || [] }; }
    if (card._wlItem) {
      var w = card._wlItem, wi = { title: w.name, type: w.type === "series" ? "tv" : "movie", tmdbId: w.tmdbId || "", genreIds: [], slug: w.slug || "" };
      try { if (w.slug && window.db && db[w.slug]) wi.genreIds = db[w.slug]._genreIds || aiBrain.idsForNames(db[w.slug]._genres); } catch (e) { void e; }
      return wi;
    }
    var cid = card.getAttribute("data-cid"), idx = Number(card.getAttribute("data-idx"));
    var host = cid && document.getElementById(cid), it = host && host._mfhItems && host._mfhItems[idx];
    if (!it) return null;
    var out = { title: it.title, type: it.mediaType === "tv" ? "tv" : "movie", tmdbId: it.tmdbId || "", genreIds: [], slug: it.slug || "" };
    try { if (it.slug && window.db && db[it.slug]) out.genreIds = db[it.slug]._genreIds || aiBrain.idsForNames(db[it.slug]._genres); } catch (e) { void e; }
    return out;
  }

  // Když karta žánry nezná, doptá se TMDB na detail titulu
  function genresFor(item) {
    if (item.genreIds && item.genreIds.length) return Promise.resolve(item.genreIds);
    if (!item.tmdbId || typeof tmdbGet !== "function") return Promise.resolve([]);
    return tmdbGet("/" + item.type + "/" + item.tmdbId + "?language=cs-CZ").then(function (d) {
      return ((d && d.genres) || []).map(function (g) { return g.id; });
    }).catch(function () { return []; });
  }

  function toast(t) { try { if (typeof showToast === "function") showToast(t); } catch (e) { void e; } }

  function apply(more) {
    var item = current; close();
    if (!item || typeof aiBrain === "undefined") return;
    genresFor(item).then(function (ids) {
      if (more) aiBrain.boostGenreIds(ids, 0.15);
      else { aiBrain.penalizeGenreIds(ids, 0.3); if (item.tmdbId) aiBrain.recordTmdbSeen(item.tmdbId); }
      toast(more ? "Budeme ukazovat víc podobného" : "Podobného bude míň");
      try { if (window.mfhRefresh) window.mfhRefresh(); } catch (e) { void e; }
    });
  }

  function build() {
    sheet = document.createElement("div");
    sheet.id = "mfCardSheet"; sheet.hidden = true;
    sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true");
    sheet.innerHTML = '<div class="cs-back" data-cs="close"></div><div class="cs-box"><p class="cs-title"></p><p class="cs-sub">Doporučování</p>' +
      '<button type="button" class="cs-btn" data-cs="more">Ukazovat víc podobného</button>' +
      '<button type="button" class="cs-btn" data-cs="less">Ukazovat méně podobného</button>' +
      '<button type="button" class="cs-btn cs-cancel" data-cs="close">Zrušit</button></div>';
    sheet.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cs]"); if (!b) return;
      var a = b.getAttribute("data-cs");
      if (a === "more") apply(true); else if (a === "less") apply(false); else close();
    });
    document.body.appendChild(sheet);
  }

  function open(item) {
    if (!sheet) build();
    current = item;
    sheet.querySelector(".cs-title").textContent = item.title || "";
    sheet.hidden = false;
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { void e; }
  }
  function close() { if (sheet) sheet.hidden = true; current = null; }

  function cancel() { clearTimeout(timer); timer = null; }

  document.addEventListener("touchstart", function (e) {
    cancel();
    var card = e.target && e.target.closest && e.target.closest(CARDS);
    var t = e.touches && e.touches[0];
    if (!card || !t || e.touches.length > 1) return;
    startX = t.clientX; startY = t.clientY;
    timer = setTimeout(function () {
      timer = null;
      var item = itemFor(card);
      if (!item) return;
      suppressUntil = Date.now() + 700; // klepnutí po puštění prstu kartu neotevře
      open(item);
    }, HOLD_MS);
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    var t = e.touches && e.touches[0];
    if (timer && t && (Math.abs(t.clientX - startX) > MOVE_PX || Math.abs(t.clientY - startY) > MOVE_PX)) cancel();
  }, { passive: true });
  ["touchend", "touchcancel"].forEach(function (n) { document.addEventListener(n, cancel, { passive: true }); });
  // Po dlouhém podržení vznikne klik na kartu: zahodí se, ať se titul neotevře
  document.addEventListener("click", function (e) {
    if (Date.now() < suppressUntil && e.target.closest && e.target.closest(CARDS)) { e.stopPropagation(); e.preventDefault(); }
  }, true);
  // Android při dlouhém podržení obrázku nabízí vlastní nabídku („Kopírovat odkaz, Uložit obrázek“): na kartách se zablokuje.
  // Pravé tlačítko myši na počítači zůstává, blokuje se jen krátce po dotyku.
  var lastTouch = 0;
  document.addEventListener("touchstart", function () { lastTouch = Date.now(); }, { passive: true, capture: true });
  document.addEventListener("contextmenu", function (e) {
    if (Date.now() - lastTouch < 1500 && e.target.closest && e.target.closest(CARDS)) e.preventDefault();
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet && !sheet.hidden) close(); });

  window.MFCardMenu = { open: open, close: close, itemFor: itemFor };
})();
