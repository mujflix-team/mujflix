/* Vzhled: vlastní nastavení. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
function _custStorageKey() {
  try {
    return "mf_customize_" + (("function" == typeof getActiveProfileId ? getActiveProfileId() : null) || localStorage.getItem("mf_active_pid") || "default")
  } catch {
    return "mf_customize_default"
  }
}

function _custGetSettings() {
  try {
    return safeLS(_custStorageKey(), "{}")
  } catch {
    return {}
  }
}

function custSave() {
  const e = _custCollectSettings();
  safeSetItem(_custStorageKey(), JSON.stringify(e)), custApplyAll(e), showToast?.("✓ Nastavení uloženo pro tvůj profil")
}

function custReset() {
  confirm("Obnovit výchozí vzhled?") && (localStorage.removeItem(_custStorageKey()), custApplyAll({}), custLoadUI({}), showToast?.("✓ Výchozí vzhled obnoven"))
}

function _custCollectSettings() {
  return {
    accent: document.querySelector("#accentSwatches .accent-swatch.active")?.dataset.accent || "#007AFF",
    accent2: document.querySelector("#accentSwatches .accent-swatch.active")?.dataset.accent2 || "#34aadc",
    bg: document.querySelector("#bgOptions .font-option.active")?.dataset.bg || "dark",
    compact: document.getElementById("custCompact")?.checked,
    hideKeys: document.getElementById("custHideKeys")?.checked,
    tileH: document.getElementById("custTileH")?.value || 300,
    tileRadius: document.getElementById("custTileRadius")?.value || 16,
    grain: !1 !== document.getElementById("custGrain")?.checked,
    glow: !1 !== document.getElementById("custGlow")?.checked,
    animations: !1 !== document.getElementById("custAnimations")?.checked,
    videoHover: !1 !== document.getElementById("custVideoHover")?.checked,
    showEpBadge: !1 !== document.getElementById("custShowEpBadge")?.checked,
    showProgress: !1 !== document.getElementById("custShowProgress")?.checked
  }
}

function custApplyAll(e) {
  const t = document.documentElement,
    n = document.body;
  _applyProfileAccent(), e.accent && t.style.setProperty("--accent", e.accent), e.accent2 && t.style.setProperty("--accent2", e.accent2);
  t.style.setProperty("--bg", {
    dark: "#060608",
    darker: "#020203",
    navy: "#04050f",
    warm: "#0a0806",
    "green-dark": "#04080a"
  } [e.bg] || "#060608"), document.querySelectorAll(".ps-tile-wrapper").forEach(t => t.classList.toggle("compact", !!e.compact)), e.tileH && t.style.setProperty("--tile-h", e.tileH + "px"), e.tileRadius && t.style.setProperty("--radius", e.tileRadius + "px"), n.classList.toggle("grain-none", !e.grain);
  const o = document.querySelector(".bg-glow");
  if (o && (o.style.display = !1 === e.glow ? "none" : ""), !1 === e.animations) {
    const e = document.createElement("style");
    e.id = "cust-no-anim", e.textContent = "*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.1ms !important; }", document.getElementById("cust-no-anim") || document.head.appendChild(e)
  } else document.getElementById("cust-no-anim")?.remove();
  const i = document.querySelector(".key-hint");
  i && (i.style.display = e.hideKeys ? "none" : "")
}

function custApply() {
  custApplyAll(_custCollectSettings())
}

function custApplyTileH(e) {
  document.documentElement.style.setProperty("--tile-h", e + "px")
}

function custApplyTileRadius(e) {
  document.documentElement.style.setProperty("--radius", e + "px")
}

function custPickAccent(e) {
  document.querySelectorAll("#accentSwatches .accent-swatch").forEach(e => e.classList.remove("active")), e.classList.add("active"), custApply()
}

function custPickBg(e) {
  document.querySelectorAll("#bgOptions .font-option").forEach(e => e.classList.remove("active")), e.classList.add("active"), custApply()
}

function custSwitchTab(e, t) {
  document.querySelectorAll(".customize-tab").forEach(e => e.classList.remove("active")), e.classList.add("active"), document.querySelectorAll(".cust-tab-panel").forEach(e => e.style.display = "none");
  const n = document.getElementById("custPanel-" + t);
  n && (n.style.display = ""), "tiles" === t && buildCustTileToggles()
}

function buildCustTileToggles() {
  const e = document.getElementById("custTileToggles");
  if (!e) return;
  const t = document.querySelectorAll(".ps-tile-wrapper");
  e.children.length > 0 || t.forEach(t => {
    const n = t.dataset.slug || t.textContent.trim().slice(0, 20),
      o = t.querySelector(".tile-hero-overlay-title")?.textContent || n,
      i = document.createElement("div");
    i.className = "customize-row", i.innerHTML = `<div class="customize-row-left"><div class="customize-row-label">${o}</div></div>\n        <label class="cust-toggle"><input type="checkbox" checked onchange="custToggleTile('${n}',this.checked)"><div class="cust-toggle-slider"></div></label>`, e.appendChild(i)
  })
}

function custToggleTile(e, t) {
  const n = document.querySelector(`.ps-tile-wrapper[data-slug="${e}"]`);
  n && (n.style.display = t ? "" : "none")
}

function custLoadUI(e) {
  document.querySelectorAll("#accentSwatches .accent-swatch").forEach(t => {
    t.classList.toggle("active", t.dataset.accent === (e.accent || "#007AFF"))
  }), document.querySelectorAll("#bgOptions .font-option").forEach(t => {
    t.classList.toggle("active", t.dataset.bg === (e.bg || "dark"))
  });
  const t = (e, t, n = !0) => {
    const o = document.getElementById(e);
    o && (o.checked = void 0 !== t ? t : n)
  };
  t("custCompact", e.compact, !1), t("custHideKeys", e.hideKeys, !1), t("custGrain", e.grain, !0), t("custGlow", e.glow, !0), t("custAnimations", e.animations, !0), t("custVideoHover", e.videoHover, !0), t("custShowEpBadge", e.showEpBadge, !0), t("custShowProgress", e.showProgress, !0);
  const n = (e, t, n) => {
    const o = document.getElementById(e);
    o && (o.value = t || n)
  };
  n("custTileH", e.tileH, 300), n("custTileRadius", e.tileRadius, 16)
}

function openCustomize() {
  const e = _custGetSettings();
  custLoadUI(e), custApplyAll(e);
  try {
    const e = safeLS("mf_profiles_v2", "[]"),
      t = localStorage.getItem("mf_active_pid"),
      n = e.find(e => e.id === t);
    document.getElementById("customizeProfileHint").textContent = "Nastavení se ukládají jen pro tebe · profil: " + (n ? n.name : "Výchozí")
  } catch {}
  const t = document.getElementById("customizeOverlay");
  t.classList.add("open"), requestAnimationFrame(() => t.classList.add("visible"))
}

function closeCustomize() {
  const e = document.getElementById("customizeOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 300)
}
!0,
  function() {
    try {
      const e = safeLS("mf_customize_default", "{}"),
        t = safeLS("mf_profiles_v2", "[]"),
        n = localStorage.getItem("mf_active_pid"),
        o = t.find(e => e.id === n),
        i = safeLS("mf_customize_" + (o ? o.id : "default"), "{}");
      custApplyAll(Object.keys(i).length ? i : e)
    } catch {}
  }();

try {
  const e = safeLS("mf_broadcast_msg", "null");
  e && Date.now() - e.ts < 6048e5 && setTimeout(() => showToast?.(e.text), 3e3)
} catch {}
