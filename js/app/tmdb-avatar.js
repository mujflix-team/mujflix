/* Vyhledání avatara v TMDB. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
let _tmdbAvSelectedUrl = null,
  _tmdbAvSelectedName = null,
  _tmdbAvCallback = null,
  _tmdbAvMode = "person";
window._tmdbSetTab = function(e) {
  _tmdbAvMode = e, document.getElementById("tmdbTabPerson").classList.toggle("active", "person" === e), document.getElementById("tmdbTabMovie").classList.toggle("active", "movie" === e);
  const t = document.getElementById("tmdbAvHint"),
    n = document.getElementById("tmdbAvInput");
  "person" === e ? (t && (t.textContent = "Vyhledej herce, režiséra nebo jakoukoli osobnost z TMDB."), n && (n.placeholder = "Jméno herce nebo osobnosti…")) : (t && (t.textContent = "Vyhledej film nebo seriál a použij jeho poster jako avatar."), n && (n.placeholder = "Název filmu nebo seriálu…")), document.getElementById("tmdbAvGrid").innerHTML = '<div class="tmdb-av-loading">Zadej název a hledej…</div>'
}, window._tmdbAvOpen = function(e) {
  _tmdbAvCallback = e, _tmdbAvSelectedUrl = null, _tmdbAvSelectedName = null, document.getElementById("tmdbAvInput").value = "", document.getElementById("tmdbAvGrid").innerHTML = '<div class="tmdb-av-loading">Zadej jméno a hledej…</div>', document.getElementById("tmdbAvatarModal").classList.add("open"), setTimeout(() => document.getElementById("tmdbAvInput").focus(), 100)
}, window._tmdbAvClose = function() {
  document.getElementById("tmdbAvatarModal").classList.remove("open"), _tmdbAvCallback = null
}, window._tmdbAvSearch = async function() {
    const e = document.getElementById("tmdbAvInput").value.trim();
    if (!e) return;
    const t = document.getElementById("tmdbAvGrid");
    t.innerHTML = '<div class="tmdb-av-loading">🔍 Hledám…</div>';
    const n = mfTmdbKey();
    if (n) try {
      let o = [];
      if ("person" === _tmdbAvMode) {
        const t = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`);
        o = ((await t.json()).results || []).filter(e => e.profile_path).slice(0, 20).map(e => ({
          imgPath: e.profile_path,
          name: e.name,
          size: "w185"
        }))
      } else {
        const [t, i] = await Promise.all([fetch(`https://api.themoviedb.org/3/search/movie?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`), fetch(`https://api.themoviedb.org/3/search/tv?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`)]), [a, s] = await Promise.all([t.json(), i.json()]), r = (a.results || []).filter(e => e.poster_path).slice(0, 10).map(e => ({
          imgPath: e.poster_path,
          name: e.title || e.name,
          size: "w342"
        })), l = (s.results || []).filter(e => e.poster_path).slice(0, 10).map(e => ({
          imgPath: e.poster_path,
          name: e.name,
          size: "w342"
        }));
        o = [...r, ...l].slice(0, 20)
      }
      if (!o.length) return void(t.innerHTML = '<div class="tmdb-av-loading">Žádné výsledky. Zkus jiný název.</div>');
      t.innerHTML = "", o.forEach(e => {
        const n = `https://image.tmdb.org/t/p/${e.size}${e.imgPath}`,
          o = document.createElement("div");
        o.className = "tmdb-av-item", o.dataset.url = n, o.dataset.name = e.name, o.innerHTML = `\n        <img class="tmdb-av-img" src="${escapeHTML(n)}" alt="${escapeHTML(e.name)}" loading="lazy" onerror="this.parentElement.remove()">\n        <span class="tmdb-av-name">${escapeHTML(e.name)}</span>\n      `, o.onclick = () => {
          document.querySelectorAll(".tmdb-av-item").forEach(e => e.classList.remove("selected")), o.classList.add("selected"), _tmdbAvSelectedUrl = n, _tmdbAvSelectedName = e.name
        }, t.appendChild(o)
      })
    } catch (e) {
      t.innerHTML = '<div class="tmdb-av-loading">⚠ Chyba při hledání: ' + e.message + "</div>"
    } else t.innerHTML = '<div class="tmdb-av-loading">⚠ Nastav TMDB API klíč v nastavení, aby šlo hledat.</div>'
  }, window._tmdbAvConfirm = function() {
    _tmdbAvSelectedUrl ? (_tmdbAvCallback && _tmdbAvCallback(_tmdbAvSelectedUrl, _tmdbAvSelectedName), _tmdbAvClose()) : "function" == typeof showToast && showToast("⚠ Vyber nejdřív obrázek")
  }, document.addEventListener("DOMContentLoaded", function() {
    if (!document.querySelector(".pc-box .pc-label")) return;
    const e = document.querySelectorAll(".pc-box .pc-label");
    let t = null;
    if (e.forEach(e => {
        "Avatar" === e.textContent.trim() && (t = e)
      }), !t) return;
    const n = document.createElement("button");
    n.className = "pc-tmdb-btn", n.textContent = "🎬 Vybrat foto z TMDB (herec/osobnost)", n.onclick = () => {
      window._tmdbAvOpen((e, t) => {
        ProfileGate._selectedAvatarUrl = e, ProfileGate._selectedAvatarName = t, document.querySelectorAll(".pc-emoji-btn").forEach(e => e.classList.remove("selected")), "function" == typeof showToast && showToast("✓ Obrázek z TMDB vybrán: " + t);
        let o = document.getElementById("pcTmdbPreview");
        o || (o = document.createElement("div"), o.id = "pcTmdbPreview", o.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;", n.insertAdjacentElement("afterend", o)), o.innerHTML = `\n          <img src="${escapeHTML(e)}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">\n          <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${escapeHTML(t)}</span>\n          <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>\n        `
      })
    }, document.getElementById("pcEmojiGrid") && t.insertAdjacentElement("afterend", n)
  }),
  function() {
    const e = ProfileGate.saveProfile.bind(ProfileGate);
    ProfileGate.saveProfile = function() {
      if (this._selectedAvatarUrl) {
        if (!(document.getElementById("pcName")?.value || "").trim()) return void e.call(this);
        this._editingId ? (e.call(this), setTimeout(() => {
          const e = _getProfiles(),
            t = e.findIndex(e => e.id === this._editingId);
          t >= 0 && (e[t].avatarUrl = this._selectedAvatarUrl, e[t].avatarTmdbName = this._selectedAvatarName, _saveProfiles(e), this.renderGate(), this.renderBadge()), this._selectedAvatarUrl = null, this._selectedAvatarName = null
        }, 50)) : (e.call(this), setTimeout(() => {
          const e = _getProfiles();
          if (e.length) {
            const t = e[e.length - 1];
            t.avatarUrl = this._selectedAvatarUrl, t.avatarTmdbName = this._selectedAvatarName, _saveProfiles(e), this.renderGate(), this.renderBadge()
          }
          this._selectedAvatarUrl = null, this._selectedAvatarName = null
        }, 50))
      } else e.call(this)
    }
  }(),
  function() {
    const e = ProfileGate.renderBadge.bind(ProfileGate);
    ProfileGate.renderBadge = function() {
      e.call(this);
      const t = "function" == typeof getActiveProfile ? getActiveProfile() : null;
      if (!t || !t.avatarUrl) return;
      const n = document.getElementById("mfProfileBadge");
      if (!n) return;
      const o = n.querySelector(".mpb-avatar");
      o && (o.innerHTML = `<img src="${escapeHTML(t.avatarUrl)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`)
    };
    const t = ProfileGate.renderGate.bind(ProfileGate);
    ProfileGate.renderGate = function() {
      t.call(this);
      const e = "function" == typeof _getProfiles ? _getProfiles() : [];
      document.querySelectorAll("#pgProfilesList .pg-profile-item").forEach((t, n) => {
        if (!e[n] || !e[n].avatarUrl) return;
        const o = t.querySelector(".pg-avatar");
        o && (o.innerHTML = `<img src="${escapeHTML(e[n].avatarUrl)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="">`)
      })
    }
  }(),
  function() {
    const e = ProfileGate.openCreate.bind(ProfileGate);
    ProfileGate.openCreate = function(t) {
      e.call(this, t), this._selectedAvatarUrl = null, this._selectedAvatarName = null;
      const n = document.getElementById("pcTmdbPreview");
      if (n && n.remove(), t) {
        const e = ("function" == typeof _getProfiles ? _getProfiles() : []).find(e => e.id === t);
        e && e.avatarUrl && (this._selectedAvatarUrl = e.avatarUrl, this._selectedAvatarName = e.avatarTmdbName || "", setTimeout(() => {
          const t = document.querySelector(".pc-tmdb-btn");
          if (!t) return;
          let n = document.getElementById("pcTmdbPreview");
          n || (n = document.createElement("div"), n.id = "pcTmdbPreview", n.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;", t.insertAdjacentElement("afterend", n)), n.innerHTML = `\n            <img src="${escapeHTML(e.avatarUrl)}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">\n            <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${escapeHTML(e.avatarTmdbName||"TMDB obrázek")}</span>\n            <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>\n          `
        }, 80))
      }
    }
  }(), document.addEventListener("keydown", function(e) {
    function t(e, t) {
      const n = e ? document.getElementById(e) : document.querySelector(t);
      return !!n && (n.classList.contains("open") || n.classList.contains("visible") || n.style.display && "none" !== n.style.display)
    }
    "Escape" === e.key && (t("tmdbAvatarModal") ? _tmdbAvClose() : t("epRatingOverlay") ? "function" == typeof closeEpRating && closeEpRating(!1) : void 0)
  }, {
    capture: !0
  }), document.getElementById("tmdbAvatarModal").addEventListener("click", function(e) {
    e.target === this && _tmdbAvClose()
  }), document.addEventListener("DOMContentLoaded", function() {
    void 0 !== ProfileGate && setTimeout(() => {
      ProfileGate.renderBadge(), ProfileGate.renderGate()
    }, 200)
  }), function() {
    function e() {
      const n = document.querySelector(".pg-gate"),
        o = n && (n.classList.contains("visible") || "none" !== n.style.display);
      document.body.classList.toggle("mf-panel-open", !!o)
    }
    const t = new MutationObserver(e);
    document.addEventListener("DOMContentLoaded", () => {
      const o = document.querySelector(".pg-gate");
      o && t.observe(o, {
        attributes: !0,
        attributeFilter: ["class", "style"]
      }), e()
    });
  }();
