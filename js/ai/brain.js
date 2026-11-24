/* MůjFlix — AIBrain: lokální doporučovací paměť (žánrové preference, sledování).
 * Závisí na globálech z js/app/*: getActiveProfileId, safeSetItem. Načítá se PŘED js/app.js. */
class AIBrain {
  constructor() {
    this._key = () => "mf_ai_brain_" + (getActiveProfileId() || "default"), this.memory = this._load()
  }
  _load() {
    try {
      const e = localStorage.getItem(this._key());
      return e ? this._sanitize(JSON.parse(e)) : this._defaultMemory()
    } catch {
      return this._defaultMemory()
    }
  }
  /** Poškozená/stará data (null, pole, chybějící klíče, NaN) nesmí shodit doporučování. */
  _sanitize(e) {
    const t = this._defaultMemory();
    if (!e || "object" != typeof e || Array.isArray(e)) return t;
    const n = e => !!e && "object" == typeof e && !Array.isArray(e);
    ["genrePreferences", "genreIdPrefs", "ratings", "ratedGenres", "watchedSlugs", "watchedTmdbIds", "wt"].forEach(o => {
      t[o] = n(e[o]) ? e[o] : {}
    });
    t.sessionGenres = Array.isArray(e.sessionGenres) ? e.sessionGenres : [];
    ["watchedCount", "totalEpsWatched"].forEach(o => {
      t[o] = Number.isFinite(e[o]) ? e[o] : 0
    });
    ["genrePreferences", "genreIdPrefs"].forEach(o => {
      Object.keys(t[o]).forEach(n => {
        Number.isFinite(t[o][n]) || delete t[o][n]
      })
    });
    return Object.keys(e).forEach(n => {
      n in t || (t[n] = e[n])
    }), Number.isFinite(e.lastActive) && (t.lastActive = e.lastActive), t
  }
  _defaultMemory() {
    return {
      genrePreferences: {},
      genreIdPrefs: {},
      watchedCount: 0,
      ratings: {},
      ratedGenres: {},
      watchedSlugs: {},
      watchedTmdbIds: {},
      wt: {},
      sessionGenres: [],
      totalEpsWatched: 0,
      lastActive: Date.now()
    }
  }
  reloadForProfile() {
    this.memory = this._load()
  }
  save() {
    try {
      safeSetItem(this._key(), JSON.stringify(this.memory))
    } catch (e) {}
  }
  /** Názvy žánrů (EN i CZ, s/bez diakritiky) → klíč preferencí + TMDB ID. */
  static _genreTable() {
    return [
      { key: "akcni", id: 28, names: ["action", "akcni", "akce"], media: "movie" },
      { key: "akcni", id: 10759, names: ["action & adventure", "akcni & dobrodruzny", "akcni a dobrodruzny"], media: "tv" },
      { key: "dobrodruzny", id: 12, names: ["adventure", "dobrodruzny", "dobrodruzstvi"], media: "both" },
      { key: "animovany", id: 16, names: ["animation", "animovany", "animak"], media: "both" },
      { key: "komedie", id: 35, names: ["comedy", "komedie"], media: "both" },
      { key: "krimi", id: 80, names: ["crime", "krimi"], media: "movie" },
      { key: "dokument", id: 99, names: ["documentary", "dokumentarni", "dokument"], media: "both" },
      { key: "drama", id: 18, names: ["drama"], media: "both" },
      { key: "rodinny", id: 10751, names: ["family", "rodinny", "rodinne"], media: "both" },
      { key: "fantasy", id: 14, names: ["fantasy"], media: "movie" },
      { key: "historicky", id: 36, names: ["history", "historicky", "historie"], media: "both" },
      { key: "horor", id: 27, names: ["horror", "horor"], media: "movie" },
      { key: "hudba", id: 10402, names: ["music", "hudebni", "hudba"], media: "both" },
      { key: "krimi", id: 9648, names: ["mystery", "mysteriozni", "tajemny"], media: "tv" },
      { key: "romantika", id: 10749, names: ["romance", "romanticky", "romanticke", "romantika"], media: "both" },
      { key: "sci-fi", id: 878, names: ["science fiction", "sci-fi", "scifi"], media: "movie" },
      { key: "sci-fi", id: 10765, names: ["sci-fi & fantasy", "sci-fi a fantasy"], media: "tv" },
      { key: "napinavy", id: 53, names: ["thriller", "napinavy"], media: "both" },
      { key: "valecny", id: 10752, names: ["war", "valecny", "valecne"], media: "movie" },
      { key: "valecny", id: 10768, names: ["war & politics", "valka & politika", "valka a politika"], media: "tv" },
      { key: "western", id: 37, names: ["western"], media: "movie" },
      { key: "detsky", id: 10762, names: ["kids", "detsky"], media: "tv" },
      { key: "reality", id: 10764, names: ["reality"], media: "tv" },
      { key: "talk-show", id: 10767, names: ["talk", "talk show"], media: "tv" },
      { key: "zpravodajstvi", id: 10763, names: ["news", "zpravy"], media: "tv" },
      { key: "telenovela", id: 10766, names: ["soap", "telenovela"], media: "tv" }
    ]
  }
  static _norm(e) {
    return String(e || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
  }
  /** Najde záznam žánru. Pokud je dán mediaType ("movie"|"tv"), vrátí ten správný pro daný typ. */
  _lookupGenre(e, mediaType) {
    const t = AIBrain._norm(e);
    const table = AIBrain._genreTable();
    if (mediaType) {
      const exact = table.find(g => g.media === mediaType && g.names.includes(t));
      if (exact) return [exact.key, exact.id, exact.names];
      const both = table.find(g => g.media === "both" && g.names.includes(t));
      if (both) return [both.key, both.id, both.names];
    }
    // fallback: první shoda (pro kompatibilitu se starými daty) - vrať pole jako u mediaType
    const found = table.find(g => g.names.includes(t));
    return found ? [found.key, found.id, found.names] : null;
  }
  _tmdbMap(e, mediaType) {
    const t = this._lookupGenre(e, mediaType);
    return t ? t[0] : AIBrain._norm(e).replace(/\s+/g, "-")
  }
  /** Převod názvů žánrů na TMDB ID (pro hodnocení a skórování). */
  idsForNames(e, mediaType) {
    const t = [];
    return (e || []).forEach(e => {
      const n = this._lookupGenre(e, mediaType);
      n && !t.includes(n[1]) && t.push(n[1])
    }), t
  }
  boostGenresFromTmdb(e, t = .1, mediaType) {
    e?.length && (e.forEach(e => {
      const n = this._tmdbMap(e, mediaType);
      this.memory.genrePreferences[n] = Math.min(1, (this.memory.genrePreferences[n] || 0) + t)
    }), this.save())
  }
  boostGenreIds(e, t = .1) {
    e?.length && (e.forEach(e => {
      this.memory.genreIdPrefs[e] = Math.min(1, (this.memory.genreIdPrefs[e] || 0) + t)
    }), this.save())
  }
  /** „Méně podobného“: sníží váhu žánrů (může jít i pod nulu, a tak se žánr nebude doporučovat). */
  penalizeGenreIds(e, t = .3) {
    e?.length && (e.forEach(e => {
      this.memory.genreIdPrefs[e] = Math.max(-1, (this.memory.genreIdPrefs[e] || 0) - t)
    }), this.save())
  }
  recordWatch(e, t) {
    this.memory.watchedCount = (this.memory.watchedCount || 0) + 1, this.memory.totalEpsWatched = (this.memory.totalEpsWatched || 0) + 1, this.memory.watchedSlugs[e] = (this.memory.watchedSlugs[e] || 0) + 1, t?.length && this.boostGenresFromTmdb(t, .06), this.memory.sessionGenres || (this.memory.sessionGenres = []), t?.length && (this.memory.sessionGenres = [...t.slice(0, 2), ...this.memory.sessionGenres].slice(0, 10)), this.memory.lastActive = Date.now(), typeof db !== "undefined" && db[e]?.name && t?.length && (this.memory.lastWatchedName = db[e].name, this.memory.lastWatchedGenres = t, this.memory.lastWatchedSlug = e), this.save()
  }
  recordTmdbSeen(e) {
    e && (this.memory.watchedTmdbIds[e] = !0), this.save()
  }
  applyDecay() {
    const e = Date.now(),
      t = (e - (this.memory.lastDecay || this.memory.lastActive || e)) / 864e5,
      n = Math.max(.92, 1 - .01 * t);
    // Nepřevážej úbytek znovu při každém přihlášení: stejné období se smí odečíst jen jednou
    if (t < .5) return;
    this.memory.lastDecay = e;
    Object.keys(this.memory.genrePreferences).forEach(e => {
      this.memory.genrePreferences[e] *= n, this.memory.genrePreferences[e] < .01 && delete this.memory.genrePreferences[e]
    }), Object.keys(this.memory.genreIdPrefs).forEach(e => {
      this.memory.genreIdPrefs[e] *= n, Math.abs(this.memory.genreIdPrefs[e]) < .01 && delete this.memory.genreIdPrefs[e]
    }), this.save()
  }
  recordWatchTime() {
    const e = (new Date).getHours(),
      t = e < 6 ? "noc" : e < 12 ? "rano" : e < 18 ? "odpoledne" : "vecer";
    this.memory.wt || (this.memory.wt = {}), this.memory.wt[t] = (this.memory.wt[t] || 0) + 1, this.save()
  }
  getTopGenres(e = 3) {
    return Object.entries(this.memory.genrePreferences).sort((e, t) => t[1] - e[1]).slice(0, e).map(e => e[0])
  }
}
