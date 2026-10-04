/* MůjFlix — Finder: hledání a ověřování odkazů na zdroje (Bombuj, SvetSerialu, Prehraj.to).
 * Obsahuje UI modal, klíče AI služeb, kandidátní URL, cache a runFinder/openWithCopy.
 * Závisí na globálech z app.js (showToast, TMDB_KEY, db, ...) používaných až za běhu. Načítá se PŘED app.js. */
function showFinderModal(e, t, n) {
  let o = document.getElementById("mfFinderModal");
  o || (o = document.createElement("div"), o.id = "mfFinderModal", o.style.cssText = "\n          position:fixed;inset:0;z-index:20000;\n          display:flex;align-items:center;justify-content:center;\n          background:rgba(0,0,0,0);\n          backdrop-filter:blur(0px);\n          transition:all 0.38s ease;\n          pointer-events:none;\n        ", o.innerHTML = '\n          <div id="mfFinderBox" style="\n            width:min(520px,92vw);\n            background:rgba(14,14,22,0.92);\n            backdrop-filter:blur(52px) saturate(2.2);\n            -webkit-backdrop-filter:blur(52px) saturate(2.2);\n            border:1px solid rgba(255,255,255,0.13);\n            border-radius:24px;\n            box-shadow:0 40px 100px rgba(0,0,0,0.9),inset 0 1.5px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.2);\n            transform:translateY(32px) scale(0.94);\n            transition:transform 0.42s cubic-bezier(0.34,1.15,0.64,1);\n            overflow:hidden;\n          ">\n            \x3c!-- Header --\x3e\n            <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px;">\n              <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.25);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🔍</div>\n              <div style="flex:1;min-width:0;">\n                <div id="mfFinderTitle" style="font-size:0.92rem;font-weight:800;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>\n                <div id="mfFinderSub" style="font-size:0.6rem;color:rgba(255,255,255,0.38);margin-top:1px;"></div>\n              </div>\n              <button onclick="closeFinderModal()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;">✕</button>\n            </div>\n            \x3c!-- Progress / Results --\x3e\n            <div id="mfFinderContent" style="padding:20px 22px 22px;min-height:120px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">\n              <div id="mfFinderSpinner" style="width:28px;height:28px;border:2px solid rgba(0,122,255,0.15);border-top-color:rgba(0,122,255,0.8);border-right-color:rgba(0,122,255,0.4);border-radius:50%;animation:mfFinderSpin 0.7s linear infinite;"></div>\n              <div id="mfFinderStatus" style="font-size:0.72rem;color:rgba(255,255,255,0.45);text-align:center;"></div>\n            </div>\n            \x3c!-- API Key prompt (hidden by default) --\x3e\n            <div id="mfFinderKeyPrompt" style="display:none;padding:0 22px 22px;">\n              <div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-bottom:12px;text-align:center;">Zadej Anthropic API klíč pro vyhledávání</div>\n              <div style="display:flex;gap:8px;">\n                <input id="mfFinderKeyInput" type="password" placeholder="sk-ant-..." style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.78rem;outline:none;font-family:-apple-system,sans-serif;" />\n                <button id="mfFinderKeySave" style="padding:10px 16px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;white-space:nowrap;">Uložit</button>\n              </div>\n              <div style="margin-top:16px;display:flex;gap:8px;">\n                <button onclick="mfFinderFallback()" style="flex:1;padding:11px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.72rem;font-weight:600;cursor:pointer;">Hledat ručně</button>\n              </div>\n            </div>\n          </div>\n        ', document.body.appendChild(o), document.getElementById("mfFinderKeySave").onclick = () => {
    const e = document.getElementById("mfFinderKeyInput").value.trim();
    e && (setAnthropicKey(e), document.getElementById("mfFinderKeyPrompt").style.display = "none", runFinder(window._mfFinderName, window._mfFinderType, window._mfFinderYear))
  }), o.style.display = "flex", o.style.opacity = "1", o.style.pointerEvents = "auto";
  const i = document.getElementById("mfFinderBox");
  i && (i.style.transform = "translateY(40px) scale(0.92)"), setTimeout(() => {
    o.style.background = "rgba(0,0,0,0.78)", o.style.backdropFilter = "blur(20px)", o.style.webkitBackdropFilter = "blur(20px)", i && (i.style.transform = "translateY(0) scale(1)")
  }, 10), document.getElementById("mfFinderTitle").textContent = e, document.getElementById("mfFinderSub").textContent = "movie" === t ? "🎬 Film · Hledám na bombuj.si…" : "📺 Seriál · Hledám na svetserialu.to…", document.getElementById("mfFinderContent").style.display = "flex", document.getElementById("mfFinderKeyPrompt").style.display = "none", setFinderStatus("Prohledávám zdroje…"), window._mfFinderName = e, window._mfFinderType = t, window._mfFinderYear = n || null
}

function closeFinderModal() {
  _cancelFinderCountdown();
  const e = document.getElementById("mfFinderModal");
  if (!e) return;
  e.style.opacity = "0", e.style.background = "rgba(0,0,0,0)", e.style.backdropFilter = "blur(0px)", e.style.webkitBackdropFilter = "blur(0px)";
  const t = document.getElementById("mfFinderBox");
  t && (t.style.transform = "translateY(40px) scale(0.92)"), setTimeout(() => {
    e.style.pointerEvents = "none", e.style.display = "none"
  }, 360)
}

function setFinderStatus(e, t = "") {
  const n = document.getElementById("mfFinderStatus");
  n && (n.textContent = (t ? t + " " : "") + e)
}
let _finderCountdownTimer = null;

function _cancelFinderCountdown() {
  _finderCountdownTimer && (clearInterval(_finderCountdownTimer), _finderCountdownTimer = null)
}

function showFinderResults(e, t, n) {
  const o = document.getElementById("mfFinderContent");
  if (!o) return;
  const i = document.getElementById("mfFinderSpinner");
  if (i && (i.style.display = "none"), _cancelFinderCountdown(), !e || 0 === e.length) return void(o.innerHTML = `\n          <div style="text-align:center;padding:8px 0;">\n            <div style="font-size:2rem;margin-bottom:8px;">😕</div>\n            <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px;">Nic nenalezeno</div>\n            <div style="font-size:0.65rem;color:rgba(255,255,255,0.38);margin-bottom:16px;">Zkus hledat ručně</div>\n            <div style="display:flex;gap:8px;justify-content:center;">\n              <button onclick="window.open('${"movie"===n?"https://www.bombuj.si/?s="+encodeURIComponent(t):"https://svetserialu.to/?s="+encodeURIComponent(t)}','_blank');closeFinderModal()" style="padding:10px 18px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.75rem;font-weight:700;cursor:pointer;">Hledat ručně</button>\n              <button onclick="closeFinderModal()" style="padding:10px 16px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.75rem;font-weight:600;cursor:pointer;">Zavřít</button>\n            </div>\n          </div>`);
  const a = e.find(e => !e._fallback),
    s = window._mfFinderTmdbId || null,
    r = window._mfFinderType || n;
  let l = '<div style="width:100%;display:flex;flex-direction:column;gap:8px;">';
  if (a) {
    const e = new URL(a.url).hostname.replace("www.", ""),
      n = `https://www.google.com/s2/favicons?domain=${e}&sz=32`,
      o = s ? `\n          <button onclick="_cancelFinderCountdown();closeFinderModal();openMovieInCinema('${s}','${(t||"").replace(/'/g,"\\'")}','${r}');" style="flex:1;padding:10px;border-radius:12px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">\n            🎬 Kino\n          </button>` : "",
      i = `\n          <button onclick="_cancelFinderCountdown();window.open('${a.url}','_blank','noopener');closeFinderModal();" style="flex:1;padding:10px;border-radius:12px;background:${s?"rgba(255,255,255,0.09)":"#007AFF"};border:${s?"1px solid rgba(255,255,255,0.12)":"none"};color:#fff;font-size:0.78rem;font-weight:${s?"500":"700"};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">\n            <svg viewBox="0 0 24 24" width="13" height="13" fill="white"><polygon points="5 3 19 12 5 21 5 3"/>      </svg> ${s?"Bombuj / SvetSer.":"Otevřít na externím webu"}\n          </button>`;
    l += `\n          <div id="mfFinderBestResult" style="\n            border-radius:18px;\n            background:linear-gradient(135deg,rgba(0,122,255,0.18) 0%,rgba(0,122,255,0.07) 100%);\n            border:1.5px solid rgba(0,122,255,0.35);\n            padding:18px 18px 14px;\n            margin-bottom:2px;\n            box-shadow:0 8px 32px rgba(0,122,255,0.12),inset 0 1px 0 rgba(0,122,255,0.2);\n          ">\n            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">\n              <img alt="" src="${n}" width="20" height="20" style="border-radius:5px;opacity:0.9;" onerror="this.style.display='none'">\n              <div style="flex:1;min-width:0;">\n                <div style="font-size:0.85rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title||t}</div>\n                <div style="font-size:0.58rem;color:rgba(0,180,255,0.7);margin-top:1px;">${e}</div>\n              </div>\n              <span style="font-size:0.6rem;background:rgba(0,122,255,0.2);color:rgba(100,200,255,0.9);padding:3px 8px;border-radius:20px;font-weight:700;">Nejlepší shoda</span>\n            </div>\n            <div style="display:flex;gap:8px;">\n              ${o}${i}\n            </div>\n          </div>`
  }
  const c = e.filter(e => e !== a);
  c.length && (l += '<div style="font-size:0.58rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:4px 2px 2px;">Další zdroje</div>', c.forEach(e => {
    const n = e.url ? new URL(e.url).hostname.replace("www.", "") : "",
      o = `https://www.google.com/s2/favicons?domain=${n}&sz=24`;
    l += `\n            <button onclick="_cancelFinderCountdown();window.open('${e.url}','_blank','noopener');closeFinderModal()" style="\n              display:flex;align-items:center;gap:12px;padding:11px 14px;\n              background:rgba(255,255,255,0.04);\n              border:1px solid rgba(255,255,255,0.08);\n              border-radius:12px;cursor:pointer;text-align:left;width:100%;\n              transition:all 0.2s ease;\n            " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)'">\n              <img alt="" src="${o}" width="18" height="18" style="border-radius:4px;opacity:0.7;flex-shrink:0;" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'><text y=\\'18\\' font-size=\\'16\\'>🔗</text></svg>'">\n              <div style="flex:1;min-width:0;">\n                <div style="font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title||t}</div>\n                <div style="font-size:0.55rem;color:rgba(255,255,255,0.3);margin-top:1px;">${n}</div>\n              </div>\n              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>\n            </button>`
  })), l += "</div>", o.innerHTML = l
}
window.mfFinderFallback = function() {
  const e = window._mfFinderName || "",
    t = "movie" === (window._mfFinderType || "tv") ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`;
  window.open(t, "_blank", "noopener"), closeFinderModal()
};
function getGeminiKey() {
  return localStorage.getItem("mf_gemini_key") || ""
}

function getAnthropicKey() {
  return localStorage.getItem("mf_anthropic_key") || ""
}

function setAnthropicKey(e) {
  localStorage.setItem("mf_anthropic_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_anthropic_key", e)
}

function getGroqKey() {
  return localStorage.getItem("mf_groq_key") || ""
}

function getJinaKey() {
  return localStorage.getItem("mf_jina_key") || ""
}

function getTavilyKey() {
  return localStorage.getItem("mf_tavily_key") || ""
}
const _VALID_DOMAINS = ["bombuj.si", "svetserialu.to", "prehraj.to", "webshare.cz", "sledujtefilmy.cz"];

function _isValidStreamUrl(e) {
  if (!e || "string" != typeof e) return !1;
  try {
    const t = new URL(e);
    if (!["http:", "https:"].includes(t.protocol)) return !1;
    const n = t.hostname.replace("www.", "");
    return "/" !== t.pathname && "" !== t.pathname && (!/[?&](s|q|search)=/.test(t.search) && (!/\/(search|hledej|results|index\.php)/.test(t.pathname) && _VALID_DOMAINS.some(e => n === e || n.endsWith('.' + e))))
  } catch {
    return !1
  }
}

function _parseFinderJson(e) {
  if (!e) return null;
  try {
    const t = e.replace(/```json|```/gi, "").trim(),
      n = JSON.parse(t);
    if (n?.results) return n
  } catch {}
  const t = e.match(/\{[\s\S]*?"results"[\s\S]*?\}/);
  if (t) try {
    return JSON.parse(t[0])
  } catch {}
  const n = [...e.matchAll(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>\)\]]+/g)].map(e => e[0].replace(/[.,;:!?]+$/, "")).filter(_isValidStreamUrl);
  return n.length ? {
    results: n.map(e => ({
      url: e,
      title: e.split("/").filter(Boolean).pop()?.replace(/-/g, " ").replace(/\b\w/g, e => e.toUpperCase()) || "",
      site: new URL(e).hostname.replace("www.", "")
    }))
  } : null
}

function _slugify(e) {
  const t = {
    "á": "a",
    "č": "c",
    "ď": "d",
    "é": "e",
    "ě": "e",
    "í": "i",
    "ň": "n",
    "ó": "o",
    "ř": "r",
    "š": "s",
    "ť": "t",
    "ú": "u",
    "ů": "u",
    "ý": "y",
    "ž": "z",
    "Á": "a",
    "Č": "c",
    "Ď": "d",
    "É": "e",
    "Ě": "e",
    "Í": "i",
    "Ň": "n",
    "Ó": "o",
    "Ř": "r",
    "Š": "s",
    "Ť": "t",
    "Ú": "u",
    "Ů": "u",
    "Ý": "y",
    "Ž": "z"
  };
  return e.split("").map(e => t[e] || e).join("").toLowerCase().replace(/&/g, "and").replace(/'/g, "").replace(/:/g, "").replace(/\.+/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
}

function _buildCandidateUrls(e, t, n) {
  const o = _slugify(e);
  if (!o) return "movie" === t ? [{
    url: `https://www.bombuj.si/?s=${encodeURIComponent(e||"")}`,
    site: "bombuj.si"
  }, {
    url: `https://svetserialu.to/?s=${encodeURIComponent(e||"")}`,
    site: "svetserialu.to"
  }] : [{
    url: `https://svetserialu.to/?s=${encodeURIComponent(e||"")}`,
    site: "svetserialu.to"
  }, {
    url: `https://serialy.bombuj.si/?s=${encodeURIComponent(e||"")}`,
    site: "bombuj.si"
  }];
  const i = n || (new Date).getFullYear(),
    a = o.startsWith("the-") ? o.slice(4) : o,
    s = o.replace(/-\d{4}$/, ""),
    r = o.startsWith("the-") ? o : "the-" + o;
  return "movie" === t ? [{
    url: `https://www.bombuj.si/online-film-${o}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i-1}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i-2}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${s}`,
    site: "bombuj.si"
  }, {
    url: `https://svetserialu.to/film/${o}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/film/${s}`,
    site: "svetserialu.to"
  }, {
    url: `https://prehraj.to/${o}`,
    site: "prehraj.to"
  }, {
    url: `https://prehraj.to/film/${o}`,
    site: "prehraj.to"
  }] : [{
    url: `https://svetserialu.to/serial/${o}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${o}/s01e01`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${a}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${a}/s01e01`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${s}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${r}`,
    site: "svetserialu.to"
  }, {
    url: `https://serialy.bombuj.si/serial/${o}`,
    site: "bombuj.si"
  }, {
    url: `https://serialy.bombuj.si/serial/${o}-1x1`,
    site: "bombuj.si"
  }, {
    url: `https://serialy.bombuj.si/serial/${a}`,
    site: "bombuj.si"
  }, {
    url: `https://prehraj.to/serial/${o}`,
    site: "prehraj.to"
  }]
}
async function _jinaFetch(e) {
  const t = getJinaKey();
  if (!t) return null;
  try {
    const n = await fetch(`https://r.jina.ai/${e}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + t,
        Accept: "application/json",
        "X-Return-Format": "text"
      },
      signal: AbortSignal.timeout(6e3)
    });
    return n.ok ? await n.text() : null
  } catch {
    return null
  }
}
async function _jinaVerify(e) {
  const t = await _jinaFetch(e);
  if (!t) return null;
  if (/\b(404|page.{0,25}not.{0,10}found|stránka nebyla nalezena|nenalezena|nebyl nalezen)\b/i.test(t.slice(0, 800))) return null;
  const n = t.match(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>]{3,}/);
  return n ? n[0].replace(/[.,;]+$/, "") : e
}
async function _jinaVerifyBatch(e) {
  return new Promise(t => {
    let n = !1,
      o = e.length;
    o ? e.forEach(async e => {
      try {
        const o = await _jinaVerify(e.url);
        o && !n && (n = !0, t({
          url: o,
          site: e.site
        }))
      } catch {}
      o--, 0 !== o || n || t(null)
    }) : t(null)
  })
}
async function _finderPatternBuild(e, t, n) {
  setFinderStatus("⚡ Pattern matching…");
  const o = _buildCandidateUrls(e, t, n);
  if (getJinaKey()) {
    const t = o.slice(0, 3),
      n = o.slice(3),
      i = await _jinaVerifyBatch(t);
    if (i) return {
      results: [{
        title: e,
        url: i.url,
        site: i.site
      }]
    };
    const a = await _jinaVerifyBatch(n);
    return a ? {
      results: [{
        title: e,
        url: a.url,
        site: a.site
      }]
    } : null
  } {
    const t = await Promise.allSettled(o.slice(0, 5).map(e => fetch(e.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(3e3),
        mode: "no-cors"
      }).then(t => "opaque" === t.type ? e : null).catch(() => null))),
      n = t.find(e => "fulfilled" === e.status && e.value)?.value;
    return n ? {
      results: [{
        title: e,
        url: n.url,
        site: n.site
      }]
    } : null
  }
}
async function _finderGemini(e, t, n, o = 1) {
  const i = getGeminiKey();
  if (!i || i.includes("__VLOZ")) return null;
  const a = "movie" === t ? "bombuj.si" : "svetserialu.to",
    s = n ? ` ${n}` : "",
    r = [`"${e}"${s} site:${a} ${"movie"===t?"online-film":"serial"}`, `${e}${s} ${"movie"===t?"film online":"seriál sledovat"} site:${a} OR site:prehraj.to`, `${e}${s} ${a} ${"movie"===t?"film 2023 2024 2025":"serial epizoda"} -/?s=`],
    l = r[Math.min(o - 1, r.length - 1)];
  setFinderStatus(`✦ Gemini hledá${o>1?` (pokus ${o})`:""}…`);
  try {
    const a = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${i}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tools: [{
          google_search: {}
        }],
        system_instruction: {
          parts: [{
            text: 'Jsi expert na české a slovenské streamovací weby.\nURL VZORY (přesně dodržuj):\n- bombuj.si FILMY: https://www.bombuj.si/online-film-SLUG nebo s rokem /online-film-SLUG-YYYY\n  Příklady: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-spasitel, /online-film-deadpool-wolverine-2024\n- bombuj.si SERIÁLY: https://serialy.bombuj.si/serial/SLUG-SxEE\n  Příklady: /serial/the-simpsons-1x1, /serial/family-guy-2x3\n- svetserialu.to SERIÁLY: https://svetserialu.to/serial/SLUG\n  Příklady: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (bez "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir\n- prehraj.to: záloha\nSLUG pravidla: diakritika pryč, mezery→pomlčky, spec. znaky pryč.\nZÁSADNÍ: URL musí vést PŘÍMO na stránku titulu — NE /?s= ani /search.\nOdpovídej POUZE JSON bez markdown.'
          }]
        },
        contents: [{
          role: "user",
          parts: [{
            text: `Najdi přímý URL na ${"movie"===t?"FILM":"SERIÁL"}: "${e}"\nProveď Google search: ${l}\nVyber URL která PŘÍMO vede na stránku titulu (ne vyhledávání).\nVrať POUZE: {"results":[{"title":"přesný název","url":"https://plná-url","site":"doména.tld"}]}`
          }]
        }]
      })
    });
    if (!a.ok) return 429 === a.status && o < 2 ? (await new Promise(e => setTimeout(e, 3e3)), _finderGemini(e, t, n, o + 1)) : null;
    const s = await a.json(),
      r = (s?.candidates?.[0]?.content?.parts || []).map(e => e.text || "").join("");
    if (!r) return null;
    const c = _parseFinderJson(r);
    if (!c?.results?.length) return o < 3 ? (await new Promise(e => setTimeout(e, 500)), _finderGemini(e, t, n, o + 1)) : null;
    let d = c.results.filter(e => _isValidStreamUrl(e.url)).map(e => ({
      ...e,
      site: new URL(e.url).hostname.replace("www.", "")
    }));
    if (d.length && getJinaKey()) {
      const e = await _jinaVerifyBatch(d.map(e => ({
        url: e.url,
        site: e.site
      })));
      if (e) {
        const t = d.find(t => t.site === e.site) || d[0];
        d = [{
          ...t,
          url: e.url
        }]
      } else d = []
    }
    return d.length ? {
      results: d
    } : null
  } catch (i) {
    return o < 2 ? _finderGemini(e, t, n, o + 1) : null
  }
}
async function _finderGroqSlug(e, t, n) {
  const o = getGroqKey();
  if (!o) return null;
  const i = n ? ` (prefer year ${n})` : "";
  setFinderStatus("⚡ Groq slug…");
  try {
    const a = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + o
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 200,
        temperature: 0,
        messages: [{
          role: "user",
          content: `Generate ALL likely URL paths for "${e}"${i} on ${"movie"===t?`bombuj.si. Format: /online-film-slug or /online-film-slug-YYYY (include year if known: ${n||"unknown"}). Examples: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-deadpool-wolverine-2024, /online-film-spasitel${n?`, /online-film-spasitel-${n}`:""}. For recent movies (2020+) include year variant too.`:'svetserialu.to. Format: /serial/slug. Examples: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (sometimes without "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir, /serial/family-guy.'}.\nDiacritics: á→a č→c ď→d é→e ě→e í→i ň→n ó→o ř→r š→s ť→t ú/ů→u ý→y ž→z. Remove apostrophes, colons, dots.\nReply ONLY as JSON array of paths, most likely first. Max 5 paths. Example: ["/online-film-inception","/online-film-inception-2010"]`
        }]
      })
    });
    if (!a.ok) return null;
    const s = await a.json();
    let r = (s?.choices?.[0]?.message?.content || "").trim(),
      l = [];
    try {
      const e = JSON.parse(r.replace(/```json|```/gi, "").trim());
      Array.isArray(e) && (l = e.filter(e => "string" == typeof e && e.startsWith("/")))
    } catch {
      l = [...r.matchAll(/\/[a-z0-9][a-z0-9/-]*/g)].map(e => e[0]).filter(e => e.length > 3)
    }
    if (!l.length) return null;
    const c = "movie" === t ? "https://www.bombuj.si" : "https://svetserialu.to",
      d = "movie" === t ? "bombuj.si" : "svetserialu.to",
      m = l.slice(0, 5).filter(e => _isValidStreamUrl(c + e)).map(e => ({
        url: c + e,
        site: d
      }));
    if (getJinaKey()) {
      const t = await _jinaVerifyBatch(m);
      return t ? {
        results: [{
          title: e,
          url: t.url,
          site: t.site,
          _groqGenerated: !0
        }]
      } : null
    }
    return m.length ? {
      results: [{
        title: e,
        url: m[0].url,
        site: m[0].site,
        _groqGenerated: !0
      }]
    } : null
  } catch {
    return null
  }
}
async function _finderAnthropic(e, t, n) {
  const o = getAnthropicKey();
  if (!o) return null;
  const i = "movie" === t ? "bombuj.si" : "svetserialu.to",
    a = n ? ` (rok: ${n})` : "";
  setFinderStatus("🤖 Claude AI hledá…");
  try {
    const n = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": o,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }],
        system: 'Expert na české streamovací weby. Vrať POUZE JSON bez markdown.\nURL vzory:\n- bombuj.si filmy: /online-film-SLUG nebo /online-film-SLUG-YYYY (př: /online-film-kung-fu-panda, /online-film-deadpool-wolverine-2024)\n- bombuj.si seriály: serialy.bombuj.si/serial/SLUG-SxEE (př: /serial/the-simpsons-1x1)\n- svetserialu.to seriály: /serial/SLUG (př: /serial/the-simpsons, /serial/chainsaw-man; někdy bez "the-")\nURL nesmí obsahovat /?s= ani /search. Pokud nenajdeš na primárním webu, zkus prehraj.to.',
        messages: [{
          role: "user",
          content: `Najdi přímý odkaz na ${"movie"===t?"film":"seriál"} "${e}"${a} na ${i} nebo prehraj.to.\nProhledej web a vrať POUZE: {"results":[{"title":"...","url":"https://...","site":"..."}]}`
        }]
      })
    });
    if (!n.ok) return null;
    const s = await n.json(),
      r = _parseFinderJson((s.content || []).filter(e => "text" === e.type).map(e => e.text).join(""));
    return r?.results && (r.results = r.results.filter(e => _isValidStreamUrl(e.url))), r?.results?.length ? r : null
  } catch {
    return null
  }
}
async function _finderTavily(e, t, n) {
  const o = getTavilyKey();
  if (!o) return null;
  const i = "movie" === t ? "bombuj.si" : "svetserialu.to",
    a = n ? ` ${n}` : "";
  setFinderStatus("🌐 Tavily search…");
  try {
    const n = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: o,
        max_results: 6,
        query: `"${e}"${a} ${"movie"===t?"film online":"seriál online"} ${i}`,
        include_domains: [i, "prehraj.to", "serialy.bombuj.si"]
      })
    });
    if (!n.ok) return null;
    const s = await n.json(),
      r = (s?.results || []).map(t => ({
        title: t.title || e,
        url: t.url,
        site: new URL(t.url).hostname.replace("www.", "")
      })).filter(e => _isValidStreamUrl(e.url));
    return r.length ? {
      results: r
    } : null
  } catch {
    return null
  }
}
const _finderCache = {};

function _finderCacheKey(e, t) {
  return `${t}::${e.toLowerCase().trim()}`
}

function _finderCacheGet(e, t) {
  const n = _finderCacheKey(e, t),
    o = _finderCache[n];
  return o ? Date.now() - o.ts > 18e5 ? (delete _finderCache[n], null) : o.results : null
}

function _finderCacheSet(e, t, n) {
  _finderCache[_finderCacheKey(e, t)] = {
    results: n,
    ts: Date.now()
  }
}
async function runFinder(e, t, n) {
  const o = "movie" === t ? "bombuj.si" : "svetserialu.to";
  setFinderStatus("🔍 Hledám…");
  const i = _finderCacheGet(e, t);
  if (i) return showFinderResults(i, e, t), void(document.getElementById("mfFinderSub").textContent = "✅ Z cache");
  let a = [],
    s = "";
  const r = await Promise.race([_finderGemini(e, t, n).then(e => e?.results?.length ? {
    r: e,
    engine: "✦ Gemini"
  } : null), _finderPatternBuild(e, t, n).then(e => e?.results?.length ? {
    r: e,
    engine: "⚡ Pattern"
  } : null), new Promise(e => setTimeout(() => e(null), 13e3))]);
  if (r?.r?.results?.length && (a = r.r.results, s = r.engine), !a.length && getGroqKey()) {
    const o = await _finderGroqSlug(e, t, n);
    o?.results?.length && (a = o.results, s = "⚡ Groq")
  }
  if (!a.length && getAnthropicKey()) {
    const o = await _finderAnthropic(e, t, n);
    o?.results?.length && (a = o.results, s = "🤖 Claude")
  }
  if (!a.length && getTavilyKey()) {
    const o = await _finderTavily(e, t, n);
    o?.results?.length && (a = o.results, s = "🌐 Tavily")
  }
  if (!a.length) {
    const o = await _finderGemini(e, t, n, 2);
    o?.results?.length && (a = o.results, s = "✦ Gemini #2")
  }
  if (!a.length) {
    const o = _buildCandidateUrls(e, t, n)[0];
    o && (a = [{
      title: e,
      url: o.url,
      site: o.site,
      _unverified: !0
    }], s = "⚡ Odhad")
  }
  a.length && !a[0]._unverified && _finderCacheSet(e, t, a);
  const l = [{
    title: `🔎 Hledat "${e}" na ${o}`,
    url: "movie" === t ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`,
    site: o,
    _fallback: !0
  }, {
    title: "🔎 Hledat na prehraj.to",
    url: `https://prehraj.to/hledej/${encodeURIComponent(e)}`,
    site: "prehraj.to",
    _fallback: !0
  }];
  showFinderResults([...a, ...l], e, t);
  const c = document.getElementById("mfFinderSub");
  c && (c.textContent = a.length ? `✅ Nalezeno — ${s}` : "🔗 Zkus hledat ručně níže")
}
async function verifyAndOpen(e, t, n) {
  showFinderModal(e, t, n), await runFinder(e, t, n)
}

function _fallbackCopy(e, t) {
  showFinderModal(e, t), showFinderResults([{
    title: `Hledat "${e}" na ${"movie"===t?"bombuj.si":"svetserialu.to"}`,
    url: "movie" === t ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`,
    site: "movie" === t ? "bombuj.si" : "svetserialu.to"
  }, {
    title: "Hledat na prehraj.to",
    url: `https://prehraj.to/hledej/${encodeURIComponent(e)}`,
    site: "prehraj.to"
  }], e, t);
  const n = document.getElementById("mfFinderSub");
  n && (n.textContent = "Přímé vyhledávání (bez AI)")
}
async function _getEnglishTitle(e, t) {
  try {
    if (!TMDB_KEY) return e;
    const n = "tv" === t || "series" === t ? "tv" : "movie",
      o = await fetch(`https://api.themoviedb.org/3/search/${n}?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(e)}`).then(e => e.ok ? e.json() : null),
      i = o?.results?.[0],
      a = i && (i.title || i.name);
    return a && !_isNonLatin(a) ? a : e
  } catch {
    return e
  }
}
async function openWithCopy(e, t, n) {
  window._mfFinderTmdbId = window._mfFinderTmdbId || null;
  let o = e;
  _isNonLatin(e) && (o = await _getEnglishTitle(e, t), o !== e && showToast(`🌐 Přeloženo: "${o}"`)), getGeminiKey() || getAnthropicKey() || getGroqKey() || getTavilyKey() || getJinaKey() ? verifyAndOpen(o, t, n) : _fallbackCopy(o, t)
}! function() {
  const e = document.createElement("style");
  e.textContent = "\n        @keyframes mfFinderSpin { to { transform: rotate(360deg); } }\n        #mfFinderModal button:active { transform: scale(0.96) !important; transition-duration: 0.08s !important; }\n      ", document.head.appendChild(e)
}();
