;
/* Barva akcentu (Nastavení → Barva aplikace). Přepisuje tokeny --c-accent* na <html>; výchozí modrá zůstává z CSS.
   Načítá se synchronně v <head>, aby se při startu neukázala nejdřív modrá. */
(function mfAccent() {
  var KEY = "mf_accent";
  var COLORS = [["#0a84ff", "Modrá"], ["#bf5af2", "Fialová"], ["#ff375f", "Růžová"], ["#ff9f0a", "Oranžová"], ["#30d158", "Zelená"], ["#40c8e0", "Tyrkysová"]];
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function apply(hex) {
    var s = document.documentElement.style, names = ["--c-accent", "--c-accent-hi", "--c-accent-a1", "--c-accent-a2", "--c-accent-a3"];
    if (!hex || hex === COLORS[0][0]) { names.forEach(function (n) { s.removeProperty(n); }); return; }
    var c = rgb(hex), hi = c.map(function (v) { return Math.round(v + (255 - v) * 0.45); }), a = function (o) { return "rgba(" + c.join(", ") + ", " + o + ")"; };
    s.setProperty("--c-accent", hex); s.setProperty("--c-accent-hi", "rgb(" + hi.join(", ") + ")");
    s.setProperty("--c-accent-a1", a(0.15)); s.setProperty("--c-accent-a2", a(0.3)); s.setProperty("--c-accent-a3", a(0.55));
  }
  function get() { try { var v = localStorage.getItem(KEY); return /^#[0-9a-f]{6}$/i.test(v || "") ? v.toLowerCase() : COLORS[0][0]; } catch (e) { return COLORS[0][0]; } }
  function set(hex) {
    if (!COLORS.some(function (c) { return c[0] === hex; })) return;
    try { if (hex === COLORS[0][0]) localStorage.removeItem(KEY); else localStorage.setItem(KEY, hex); } catch (e) { void e; }
    apply(hex);
  }
  apply(get());
  window.MFAccent = { COLORS: COLORS, get: get, set: set };
})();
