/* MůjFlix — ProfileGate: výběr/tvorba profilů, PIN, avatar picker.
 * Závisí na globálech z js/app.js (PROFILE_COLORS, PROFILE_EMOJIS, _loadProfiles, _saveProfiles, getActiveProfileId, ...)
 * používaných až za běhu. Načítá se PŘED js/app.js. */
const PROFILE_COLORS = ["#007AFF", "#ff6b6b", "#4ecdc4", "#a29bfe", "#fd79a8", "#fdcb6e", "#6c5ce7", "#00b894", "#e17055", "#74b9ff"];
const PROFILE_EMOJIS = ["🎬", "🍿", "🎭", "🎪", "🎡", "🃏", "🎲", "🎰", "🦁", "🐺", "🦊", "🐸", "👾", "🤖", "🦸", "🧙", "🧛", "🤡", "👻", "🤩", "😎", "🥷", "🦄", "🐉"];

const ProfileGate = {
  _pinBuffer: "",
  _pinTargetId: null,
  _editingId: null,
  _manageMode: false,
  _selectedEmoji: PROFILE_EMOJIS[0],
  _selectedColor: PROFILE_COLORS[0],
  _selectedAvatar: PROFILE_EMOJIS[0],
  show() {
    const e = document.getElementById("mfProfileGate");
    e && (e.style.display = "flex", e.classList.remove("hiding")), this._manageMode = false, this.renderGate()
  },
  hide() {
    const e = document.getElementById("mfProfileGate");
    e && (e.classList.add("hiding"), setTimeout(() => {
      e.style.display = "none"
    }, 520))
  },
  renderGate() {
    const e = document.getElementById("pgProfilesList");
    if (!e) return;
    const t = _getProfiles();
    e.innerHTML = "", t.forEach(t => {
      const n = document.createElement("div");
      n.dataset.profileId = t.id;
      n.className = "pg-profile-item" + (this._manageMode ? " pg-manage-mode" : "");
      const avatar = /^https?:\/\//i.test(t.avatar || "") ?
        `<img class="pg-avatar-image" src="${escapeHTML(t.avatar)}" alt="">` : escapeHTML(t.avatar || "🎬");
      n.innerHTML = `
            <div class="pg-avatar-wrap">
              <div class="pg-avatar" style="--pg-color:${escapeHTML(t.color||"#007AFF")};${getActiveProfileId()===t.id?"border-color:"+escapeHTML(t.color)+";box-shadow:0 0 0 1px "+escapeHTML(t.color)+",0 8px 40px rgba(0,0,0,0.6);":""}">
                ${avatar}
              </div>
              ${this._manageMode ? `<button class="pg-remove-btn" type="button" aria-label="Odebrat profil ${escapeHTML(t.name)}" onclick="event.stopPropagation(); window.ProfileGate?.removeProfile('${escapeHTML(t.id)}')">−</button>` : ""}
            </div>
            <div class="pg-name">${escapeHTML(t.name)}</div>
          `;
      n.onclick = () => this._manageMode ? void 0 : ProfileGate.selectProfile(t.id);
      e.appendChild(n);
    });
    const n = document.createElement("div");
    n.className = "pg-profile-item", n.innerHTML = '\n          <div class="pg-add-btn">＋</div>\n          <div class="pg-name" style="color:rgba(255,255,255,0.35)">Přidat profil</div>\n        ', n.onclick = () => ProfileGate.openCreate(), e.appendChild(n)
    const manage = document.getElementById("profileManageBtn");
    if (manage) {
      manage.textContent = this._manageMode ? "Hotovo" : "Upravit";
      manage.classList.toggle("active", this._manageMode);
    }
  },
  toggleManageMode() {
    this._manageMode = !this._manageMode;
    this.renderGate();
  },
  /** Smaže data odebraného profilu (sledování, hodnocení, AI paměť, klíče…), aby nezůstala v úložišti. */
  _purgeProfileData(e) {
    if (!e || "string" != typeof e) return;
    try {
      const t = "_" + e;
      Object.keys(localStorage).filter(n => n.startsWith("mf_") && (n.endsWith(t) || n.includes(t + "_"))).forEach(n => localStorage.removeItem(n))
    } catch (n) {}
  },
  removeProfile(e) {
    const t = _getProfiles().find(t => t.id === e);
    if (!t) return;
    const item = document.querySelector(`.pg-profile-item[data-profile-id="${e}"]`);
    if (item) item.classList.add("pg-removing");
    setTimeout(() => {
      const profiles = _getProfiles().filter(profile => profile.id !== e);
      _saveProfiles(profiles);
      this._purgeProfileData(e);
      if (getActiveProfileId() === e) {
        profiles.length ? setActiveUser(profiles[0].id) : localStorage.removeItem(ACTIVE_PID_KEY);
        this.renderBadge();
      }
      this._manageMode = true;
      this.renderGate();
      if (!profiles.length) this.show();
    }, item ? 220 : 0);
  },
  selectProfile(e) {
    try {
      const profiles = _getProfiles();
      const t = profiles.find(t => t.id === e);
      if (!t) {
        console.warn('[ProfileGate] selectProfile: profil nenalezen, id=', e, 'dostupné:', profiles.map(p=>p.id));
        if (profiles.length > 0) {
          
          this.activateProfile(profiles[0].id);
        }
        return;
      }
      t.pin ? this.openPin(t) : this.activateProfile(t.id);
    } catch(err) {
      console.error('[ProfileGate] selectProfile chyba:', err);
      this.hide();
    }
  },
  activateProfile(e) {
    localStorage.setItem(ACTIVE_PID_KEY, e), window.dispatchEvent(new Event("mf:profile-changed")), this.renderBadge(), _applyProfileAccent(), this.hide(), this.closePin(), setTimeout(() => {
      void 0 !== aiBrain && (aiBrain.reloadForProfile(), aiBrain.applyDecay()), "function" == typeof refreshUserContent && refreshUserContent(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns(), "function" == typeof updateLogoProgress && updateLogoProgress()
    }, 100);
    const t = _getProfiles().find(t => t.id === e);
    if (t) {
      const n = document.getElementById("mfWelcomeNote");
      n && (n.textContent = "Ahoj, " + czechVocative((t.name || "").split(" ")[0]), n.classList.add("show"), clearTimeout(n._timer), n._timer = setTimeout(() => n.classList.remove("show"), 4200));
    }
  },
  openPin(e) {
    this._pinBuffer = "", this._pinTargetId = e.id;
    const t = document.getElementById("mfPinModal");
    t && (this._setPinAvatar(e.avatar), document.getElementById("pmTitle").textContent = e.name, t.classList.add("show"), this._renderPinDots())
  },
  _setPinAvatar(av) {
    const el = document.getElementById("pmAvatar");
    if (!el) return;
    if (/^https?:\/\//i.test(av || "")) { el.textContent = ""; const im = document.createElement("img"); im.alt = ""; im.src = av; im.referrerPolicy = "no-referrer"; el.appendChild(im); }
    else el.textContent = av || "🎬";
  },
  closePin() {
    this._pinBuffer = "", this._pinTargetId = null;
    const e = document.getElementById("mfPinModal");
    e && e.classList.remove("show"), this._renderPinDots()
  },
  pinInput(e) {
    "back" === e ? this._pinBuffer = this._pinBuffer.slice(0, -1) : this._pinBuffer.length < 4 && (this._pinBuffer += e), this._renderPinDots(), 4 === this._pinBuffer.length && setTimeout(() => this._checkPin(), 120)
  },
  _renderPinDots(e) {
    for (let t = 0; t < 4; t++) {
      const n = document.getElementById("pmd" + t);
      n && (n.className = "pm-dot", t < this._pinBuffer.length && n.classList.add("filled"), "error" === e && n.classList.add("error"))
    }
  },
  _checkPin() {
    const e = _getProfiles().find(e => e.id === this._pinTargetId);
    e && (this._pinBuffer === e.pin ? this.activateProfile(e.id) : (this._renderPinDots("error"), setTimeout(() => {
      this._pinBuffer = "", this._renderPinDots()
    }, 700)))
  },
  openCreate(e) {
    this._editingId = e || null, this._selectedEmoji = PROFILE_EMOJIS[0], this._selectedColor = PROFILE_COLORS[0], this._selectedAvatar = PROFILE_EMOJIS[0];
    const t = document.getElementById("mfProfileCreate");
    if (!t) return;
    const _gate = document.getElementById("mfProfileGate");
    if (_gate) _gate.style.pointerEvents = "none";
    document.getElementById("pcModalTitle").textContent = e ? "Upravit profil" : "Vytvoř si svůj profil";
    const n = document.getElementById("pcName");
    if (e) {
      const t = _getProfiles().find(t => t.id === e);
      t && (n.value = t.name, this._selectedAvatar = t.avatar || PROFILE_EMOJIS[0], this._selectedColor = t.color || PROFILE_COLORS[0])
    } else n.value = "";
    const preview = document.getElementById("pcAvatarPreview");
    preview && (preview.innerHTML = /^https?:\/\//i.test(this._selectedAvatar) ? `<img src="${escapeHTML(this._selectedAvatar)}" alt="">` : escapeHTML(this._selectedAvatar));
    const picker = document.getElementById("pcAvatarPicker");
    picker && (picker.hidden = true, this._syncPickerClass());
    this.loadAvatarPicker();
    ["pcPin0", "pcPin1", "pcPin2", "pcPin3"].forEach(e => {
      const t = document.getElementById(e);
      t && (t.value = "")
    });
    const _pinRow = document.getElementById("pcPinRemoveRow"), _pinChk = document.getElementById("pcPinRemove");
    _pinChk && (_pinChk.checked = !1);
    _pinRow && (_pinRow.style.display = e && _getProfiles().find(t => t.id === e)?.pin ? "flex" : "none");
    t.classList.add("show"), setTimeout(() => n.focus(), 100)
  },
  closeCreate() {
    const e = document.getElementById("mfProfileCreate");
    e && e.classList.remove("show"), this._editingId = null;
    const _gate = document.getElementById("mfProfileGate");
    if (_gate) _gate.style.pointerEvents = "";
  },
  _pickEmoji(e, t) {
    this._selectedEmoji = e, document.querySelectorAll(".pc-emoji-btn").forEach(e => e.classList.remove("selected")), t.classList.add("selected")
  },
  toggleAvatarPicker() {
    const e = document.getElementById("pcAvatarPicker");
    if (e) e.hidden = !e.hidden, this._syncPickerClass();
  },
  _syncPickerClass() {
    const e = document.getElementById("pcAvatarPicker"), c = document.getElementById("mfProfileCreate");
    c && e && c.classList.toggle("picker-open", !e.hidden)
  },
  /* Výběr avatara jako v Netflixu: nahoře POSTAVY (AniList = anime postavy, Wikipedie = postavy ze seriálů a filmů),
     pod nimi řady podle titulů z TMDB (záběry a plakáty). TMDB sám obrázky postav nemá. */
  async _fetchJson(url, opts) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
    try { const r = await fetch(url, { ...(opts || {}), signal: ctl.signal }); return r.ok ? await r.json() : null; } catch (e) { return null; } finally { clearTimeout(t); }
  },
  async _anilistCharacters(q) {
    const nm = "name{full} image{large}",
      query = q
        ? `query($q:String){Page(perPage:16){characters(search:$q){${nm}}} Media(search:$q,type:ANIME){characters(perPage:14,sort:FAVOURITES_DESC){nodes{${nm}}}}}`
        : `query{Page(perPage:20){characters(sort:FAVOURITES_DESC){${nm}}}}`,
      d = await this._fetchJson("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ query, variables: q ? { q } : {} }) }),
      raw = [...((d && d.data && d.data.Media && d.data.Media.characters && d.data.Media.characters.nodes) || []), ...((d && d.data && d.data.Page && d.data.Page.characters) || [])], seen = {};
    return raw.filter(c => c && c.image && c.image.large && !/default\.jpg/.test(c.image.large) && !seen[c.image.large] && (seen[c.image.large] = 1)).map(c => ({ name: c.name && c.name.full || "", url: c.image.large }));
  },
  async _wikiCharacters(q) {
    const d = await this._fetchJson("https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=0&gsrlimit=12&prop=pageimages&piprop=thumbnail&pithumbsize=400&gsrsearch=" + encodeURIComponent(q));
    return Object.values((d && d.query && d.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0)).filter(p => p.thumbnail && p.thumbnail.source).map(p => ({ name: p.title || "", sub: "", url: p.thumbnail.source }));
  },
  /* Známé postavy: Wikipedie vrátí hlavní obrázek stránky postavy (jedním dotazem pro celou skupinu). */
  async _wikiByTitles(titles) {
    const d = await this._fetchJson("https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=" + encodeURIComponent(titles.join("|")));
    return Object.values((d && d.query && d.query.pages) || {}).filter(p => p.thumbnail && p.thumbnail.source).map(p => ({ name: String(p.title || "").replace(/ \(.*\)$/, ""), url: p.thumbnail.source }));
  },
  /* Nejoblíbenější anime: řada postav za každé anime (název + jeho hlavní postavy). */
  async _anilistByAnime() {
    const d = await this._fetchJson("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: "query{Page(perPage:12){media(sort:POPULARITY_DESC,type:ANIME){title{english romaji} characters(perPage:12,sort:FAVOURITES_DESC){nodes{name{full} image{large}}}}}}" }) });
    return ((d && d.data && d.data.Page && d.data.Page.media) || []).map(m => ({
      title: m.title && (m.title.english || m.title.romaji) || "",
      list: ((m.characters && m.characters.nodes) || []).filter(c => c && c.image && c.image.large && !/default\.jpg/.test(c.image.large)).map(c => ({ name: c.name && c.name.full || "", url: c.image.large }))
    })).filter(m => m.title && m.list.length);
  },
  _charRowHtml(title, list) {
    if (!list.length) return "";
    return `<section class="pc-av-row"><h4>${escapeHTML(title)}</h4><div class="pc-av-strip">${list.slice(0, 16).map(c => `
      <button type="button" class="pc-avatar-option pc-character-option" title="${escapeHTML(c.name)}" data-url="${escapeHTML(c.url)}" data-name="${escapeHTML(c.name)}" onclick="window.ProfileGate?.pickAvatarEl(this)">
        <img src="${escapeHTML(c.url)}" alt="${escapeHTML(c.name)}" loading="lazy" referrerpolicy="no-referrer">
        <span class="pc-av-cap">${escapeHTML(c.name)}</span>
      </button>`).join("")}</div></section>`;
  },
  async loadAvatarPicker() {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="pc-avatar-loading">Načítám postavy…</div>';
    const run = this._avRun = (this._avRun || 0) + 1;
    const groups = [
      ["Breaking Bad", ["Walter White (Breaking Bad)", "Jesse Pinkman", "Saul Goodman", "Skyler White", "Hank Schrader", "Gus Fring", "Mike Ehrmantraut"]],
      ["Game of Thrones", ["Daenerys Targaryen", "Jon Snow (character)", "Tyrion Lannister", "Arya Stark", "Cersei Lannister", "Sansa Stark", "Jaime Lannister", "Bran Stark", "Petyr Baelish"]],
      ["Stranger Things", ["Eleven (Stranger Things)", "Mike Wheeler", "Dustin Henderson", "Lucas Sinclair", "Will Byers", "Max Mayfield", "Steve Harrington", "Jim Hopper", "Joyce Byers", "Eddie Munson", "Vecna (Stranger Things)"]],
      ["Další seriály", ["Wednesday Addams", "Sherlock Holmes", "Tommy Shelby", "Dexter Morgan", "Michael Scott (The Office)", "Geralt of Rivia", "Yennefer of Vengerberg", "Joel Miller", "Ellie (The Last of Us)", "Billy Butcher", "Homelander", "Din Djarin", "Grogu"]],
      ["Přátelé", ["Rachel Green", "Ross Geller", "Monica Geller", "Chandler Bing", "Joey Tribbiani", "Phoebe Buffay"]],
      ["Marvel", ["Spider-Man", "Iron Man", "Captain America", "Thor (Marvel Comics)", "Deadpool", "Wolverine (character)", "Venom (character)", "Loki (Marvel Cinematic Universe)", "Black Panther (character)", "Doctor Strange", "Groot", "Thanos"]],
      ["DC", ["Batman", "Joker (character)", "Superman", "Wonder Woman", "Harley Quinn", "Aquaman", "The Flash", "Catwoman", "Robin (character)"]],
      ["Star Wars", ["Darth Vader", "Yoda", "Luke Skywalker", "Princess Leia", "Han Solo", "Obi-Wan Kenobi", "Ahsoka Tano", "Kylo Ren", "Chewbacca", "R2-D2"]],
      ["Harry Potter", ["Harry Potter (character)", "Hermione Granger", "Ron Weasley", "Albus Dumbledore", "Severus Snape", "Draco Malfoy", "Rubeus Hagrid", "Sirius Black", "Luna Lovegood"]],
      ["Animované", ["Homer Simpson", "Bart Simpson", "Lisa Simpson", "Marge Simpson", "Rick Sanchez", "Morty Smith", "Peter Griffin", "Eric Cartman", "SpongeBob SquarePants", "Elsa (Frozen)", "Simba", "Woody (Toy Story)", "Buzz Lightyear", "Shrek (character)", "Stitch (Lilo & Stitch)", "Mickey Mouse"]],
      ["Další seriály 2", ["Raymond Reddington", "Eleven Hopper", "Lucifer Morningstar (TV series)", "Ragnar Lothbrok", "Rick Grimes", "Daryl Dixon", "Negan", "Sam Winchester", "Dean Winchester", "The Doctor (Doctor Who)", "Spock", "James T. Kirk", "Jean-Luc Picard", "Frank Underwood", "Don Draper", "Carmy Berzatto", "Mandalorian"]],
      ["Pán prstenů a fantasy", ["Frodo Baggins", "Aragorn", "Legolas", "Gollum", "Sauron", "Galadriel", "Bilbo Baggins", "Jon Snow (character)", "Geralt of Rivia", "Jaskier"]],
      ["Filmové postavy", ["Gandalf", "Jack Sparrow", "Indiana Jones (character)", "John Wick (character)", "Forrest Gump (character)", "Neo (The Matrix)", "Terminator (character)", "Mario", "Hannibal Lecter", "James Bond", "Ellen Ripley", "Jason Bourne"]]
    ];
    try {
      const [ani, byAnime, ...wiki] = await Promise.all([this._anilistCharacters(""), this._anilistByAnime(), ...groups.map(g => this._wikiByTitles(g[1]))]);
      if (run !== this._avRun) return;
      const html = this._charRowHtml("Oblíbené anime postavy", ani) + byAnime.map(m => this._charRowHtml(m.title, m.list)).join("") + groups.map((g, i) => this._charRowHtml(g[0], wiki[i])).join("");
      grid.innerHTML = html || '<div class="pc-avatar-loading">Postavy se nepodařilo načíst. Zkus je vyhledat jménem.</div>';
    } catch (err) {
      grid.innerHTML = '<div class="pc-avatar-loading">Postavy se nepodařilo načíst.</div>';
    }
  },
  searchAvatarTitles(e) {
    const q = e.trim();
    clearTimeout(this._avatarSearchTimer);
    if (!q) return this.loadAvatarPicker();
    this._avatarSearchTimer = setTimeout(() => this._searchAvatarTitles(q), 320);
  },
  async _searchAvatarTitles(q) {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="pc-avatar-loading">Hledám…</div>';
    const run = this._avRun = (this._avRun || 0) + 1;
    const [ani, wiki] = await Promise.all([this._anilistCharacters(q), this._wikiCharacters(q)]);
    if (run !== this._avRun) return;
    grid.innerHTML = this._charRowHtml("Anime postavy", ani) + this._charRowHtml("Postavy ze seriálů a filmů (Wikipedie)", wiki) || '<div class="pc-avatar-loading">Nic jsme nenašli. Zkus anglické jméno postavy nebo názvu.</div>';
  },
  pickAvatarEl(el) {
    if (/^https:\/\//i.test(el.dataset.url || "")) this.pickAvatar(el.dataset.url, el.dataset.name, el);
  },
  pickAvatar(e, t, n) {
    this._selectedAvatar = e;
    const preview = document.getElementById("pcAvatarPreview");
    preview && (preview.innerHTML = `<img src="${e}" alt="">`);
    const label = document.getElementById("pcAvatarPickerLabel");
    label && (label.textContent = t || "Vybraný obrázek");
    document.querySelectorAll(".pc-avatar-option").forEach(e => e.classList.remove("selected"));
    n && n.classList.add("selected");
    // výběr se potvrdí sám: picker se zavře a vrátí se formulář s novým avatarem
    const picker = document.getElementById("pcAvatarPicker");
    picker && !picker.hidden && (picker.hidden = !0, this._syncPickerClass());
  },
  _pickColor(e, t) {
    this._selectedColor = e, document.querySelectorAll(".pc-color-swatch").forEach(e => e.classList.remove("selected")), t.classList.add("selected")
  },
  pinDigitNav(e, t) {
    if (e.value && t < 3) {
      const e = document.getElementById("pcPin" + (t + 1));
      e && e.focus()
    }
  },
  saveProfile() {
    const e = (document.getElementById("pcName")?.value || "").trim();
    if (!e) {
      const e = document.getElementById("pcName");
      return void(e && (e.style.borderColor = "rgba(255,80,80,0.5)", e.focus()))
    }
    const t = ["pcPin0", "pcPin1", "pcPin2", "pcPin3"].map(e => document.getElementById(e)?.value || "").join(""),
      n = 4 === t.length && /^\d{4}$/.test(t) ? t : null,
      o = _getProfiles();
    if (this._editingId) {
      const t = o.findIndex(e => e.id === this._editingId);
      t >= 0 && (o[t].name = e, o[t].avatar = this._selectedAvatar, (document.getElementById("pcPinRemove")?.checked ? delete o[t].pin : n && (o[t].pin = n)), _saveProfiles(o)), this.closeCreate(), this.renderGate(), this.renderBadge()
    } else {
      const t = this.createProfile({
        name: e,
        avatar: this._selectedAvatar,
        color: this._selectedColor,
        pin: n
      });
      this.openOnboarding(t), this.closeCreate(), this.activateProfile(t)
    }
  },
  createProfile({
    name: e,
    avatar: t,
    color: n,
    pin: o
  }) {
    const i = "p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      a = _getProfiles();
    return a.push({
      id: i,
      name: e,
      avatar: t || "🎬",
      color: n || PROFILE_COLORS[0],
      pin: o || null,
      created: Date.now(),
      history: [],
      likedGenres: [],
      prefs: {
        algo: {
          trending: .4,
          topRated: .3,
          watchlistBased: .3
        },
        features: {
          showTrailer: !0,
          showRating: !0,
          confettiOnWin: !0,
          darkGold: !0
        },
        contentPref: "all",
        lang: "cs"
      },
      trakt: null
    }), _saveProfiles(a), i
  },
  openOnboarding(e) {
    const t = document.getElementById("mfProfileWelcome"),
      n = document.getElementById("pwGenres");
    if (!t || !n) return;
    const o = [
      ["28", "Akce"], ["35", "Komedie"], ["18", "Drama"],
      ["878", "Sci-Fi"], ["27", "Horor"], ["16", "Animované"], ["anime", "Anime"],
      ["10749", "Romantika"], ["14", "Fantasy"], ["53", "Thriller"]
    ];
    n.innerHTML = o.map(([e, t]) => `<button type="button" class="pw-genre" data-genre="${e}" onclick="this.classList.toggle('selected')">${t}</button>`).join("");
    t.dataset.profileId = e, this._onboardingStep(1), t.classList.add("show"), t.setAttribute("aria-hidden", "false");
  },
  _onboardingStep(n) {
    const a = document.getElementById("pwStep1"), b = document.getElementById("pwStep2");
    if (a) a.style.display = 1 === n ? "" : "none";
    if (b) b.style.display = 2 === n ? "" : "none";
    if (2 === n) {
      const l = document.getElementById("pwAdblockLink");
      if (l && window.mfAdblock) l.innerHTML = window.mfAdblock.linkHtml();
    }
    const w = document.getElementById("mfProfileWelcome");
    w && w.scrollTo && w.scrollTo(0, 0);
  },
  skipOnboardingGenres() {
    const e = document.getElementById("mfProfileWelcome");
    e && e.classList.contains("show") && this._onboardingStep(2);
  },
  closeOnboarding() {
    const e = document.getElementById("mfProfileWelcome");
    e && (e.classList.remove("show"), e.setAttribute("aria-hidden", "true"));
  },
  finishOnboarding() {
    const e = document.getElementById("mfProfileWelcome");
    if (!e) return;
    const t = e.dataset.profileId || getActiveProfileId(),
      sel = [...e.querySelectorAll(".pw-genre.selected")].map(e => e.dataset.genre),
      likesAnime = sel.includes("anime"),
      n = [...new Set(sel.map(Number).filter(Number.isFinite))];
    if (t) {
      const o = _getProfiles(), i = o.find(e => e.id === t);
      i && (n.length && (i.likedGenres = n.slice(0, 5)), i.prefs = { ...i.prefs, onboardingDone: !0, likesAnime }, _saveProfiles(o));
      if (getActiveProfileId() === t && void 0 !== aiBrain) n.forEach(e => aiBrain.boostGenreIds([e], .12));
      try { if (typeof window.renderHomepage === "function") window.renderHomepage(); } catch (e) {}
    }
    this._onboardingStep(2);
  },
  renderBadge() {
    const e = getActiveProfile(),
      t = document.getElementById("_mfUserBadge");
    t && t.remove();
    let n = document.getElementById("mfProfileBadge");
    if (!n) {
      n = document.createElement("div");
      n.id = "mfProfileBadge";
      n.onclick = () => ProfileGate.show();
      document.body.appendChild(n);
    }
    if (e) {
      const avatar = /^https?:\/\//i.test(e.avatar || "")
        ? `<img src="${escapeHTML(e.avatar)}" alt="">`
        : escapeHTML(e.avatar || "🎬");
      n.style.borderColor = (e.color || "#007AFF") + "44";
      n.innerHTML = `
        <div class="mpb-avatar" style="border-color:${escapeHTML(e.color || "#007AFF")}88">${avatar}</div>
        <span class="mpb-name">${escapeHTML(e.name)}</span>
        <span class="mpb-arrow">▼</span>
      `;
    } else {
      n.style.borderColor = "rgba(255,255,255,0.1)";
      n.innerHTML = '<div class="mpb-avatar">👤</div><span class="mpb-name">Profil</span><span class="mpb-arrow">▼</span>';
    }
  }
};

window.ProfileGate = ProfileGate;

/* ── Klávesnice pro PIN ───────────────────────────────────────────────────────
   1) okno „Zadej PIN“: číslice (řada nad písmeny i numerická klávesnice, NumLock zapnutý), Backspace, Esc
   2) pole PIN při vytváření profilu: jen číslice, Backspace přeskočí zpět, vložení 4 číslic ze schránky */
document.addEventListener("keydown", e => {
  const modal = document.getElementById("mfPinModal");
  if (!modal || !modal.classList.contains("show")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  let handled = true;
  if (/^[0-9]$/.test(e.key)) ProfileGate.pinInput(e.key);
  else if (e.key === "Backspace" || e.key === "Delete") ProfileGate.pinInput("back");
  else if (e.key === "Escape") ProfileGate.closePin();
  else handled = false;
  if (handled) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);

(function wirePinInputs() {
  const ids = ["pcPin0", "pcPin1", "pcPin2", "pcPin3"];
  const inputs = () => ids.map(id => document.getElementById(id));
  document.addEventListener("input", e => {
    const i = ids.indexOf(e.target && e.target.id);
    if (i < 0) return;
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 1);
  }, true);
  document.addEventListener("keydown", e => {
    const i = ids.indexOf(e.target && e.target.id);
    if (i < 0) return;
    const all = inputs();
    if (e.key === "Backspace" && !e.target.value && i > 0) { all[i - 1].value = ""; all[i - 1].focus(); e.preventDefault(); }
    else if (e.key === "ArrowLeft" && i > 0) { all[i - 1].focus(); e.preventDefault(); }
    else if (e.key === "ArrowRight" && i < 3) { all[i + 1].focus(); e.preventDefault(); }
  }, true);
  document.addEventListener("paste", e => {
    const i = ids.indexOf(e.target && e.target.id);
    if (i < 0) return;
    const digits = ((e.clipboardData && e.clipboardData.getData("text")) || "").replace(/\D/g, "").slice(0, 4);
    if (!digits) { e.preventDefault(); return; }
    const all = inputs();
    digits.split("").forEach((d, k) => { if (all[k]) all[k].value = d; });
    all[Math.min(digits.length, 3)].focus();
    e.preventDefault();
  }, true);
})();
