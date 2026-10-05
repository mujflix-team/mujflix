/* MůjFlix — AIBrain: lokální doporučovací paměť (žánrové preference, sledování).
 * Závisí na globálech z app.js: getActiveProfileId, safeSetItem. Načítá se PŘED app.js. */
class AIBrain {
  constructor() {
    this._key = () => "mf_ai_brain_" + (getActiveProfileId() || "default"), this.memory = this._load()
  }
  _load() {
    try {
      const e = localStorage.getItem(this._key());
      return e ? JSON.parse(e) : this._defaultMemory()
    } catch {
      return this._defaultMemory()
    }
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
      ["akcni", 28, ["action", "akcni", "akce"]],
      ["akcni", 10759, ["action & adventure", "akcni & dobrodruzny", "akcni a dobrodruzny"]],
      ["dobrodruzny", 12, ["adventure", "dobrodruzny", "dobrodruzstvi"]],
      ["animovany", 16, ["animation", "animovany", "animak"]],
      ["komedie", 35, ["comedy", "komedie"]],
      ["krimi", 80, ["crime", "krimi"]],
      ["dokument", 99, ["documentary", "dokumentarni", "dokument"]],
      ["drama", 18, ["drama"]],
      ["rodinny", 10751, ["family", "rodinny", "rodinne"]],
      ["fantasy", 14, ["fantasy"]],
      ["historicky", 36, ["history", "historicky", "historie"]],
      ["horor", 27, ["horror", "horor"]],
      ["hudba", 10402, ["music", "hudebni", "hudba"]],
      ["krimi", 9648, ["mystery", "mysteriozni", "tajemny"]],
      ["romantika", 10749, ["romance", "romanticky", "romanticke", "romantika"]],
      ["sci-fi", 878, ["science fiction", "sci-fi", "scifi"]],
      ["sci-fi", 10765, ["sci-fi & fantasy", "sci-fi a fantasy"]],
      ["napinavy", 53, ["thriller", "napinavy"]],
      ["valecny", 10752, ["war", "valecny", "valecne"]],
      ["valecny", 10768, ["war & politics", "valka & politika", "valka a politika"]],
      ["western", 37, ["western"]],
      ["detsky", 10762, ["kids", "detsky"]],
      ["reality", 10764, ["reality"]],
      ["talk-show", 10767, ["talk", "talk show"]],
      ["zpravodajstvi", 10763, ["news", "zpravy"]],
      ["telenovela", 10766, ["soap", "telenovela"]]
    ]
  }
  static _norm(e) {
    return String(e || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  }
  _lookupGenre(e) {
    const t = AIBrain._norm(e);
    return AIBrain._genreTable().find(e => e[2].includes(t)) || null
  }
  _tmdbMap(e) {
    const t = this._lookupGenre(e);
    return t ? t[0] : AIBrain._norm(e).replace(/\s+/g, "-")
  }
  /** Převod názvů žánrů na TMDB ID (pro hodnocení a skórování). */
  idsForNames(e) {
    const t = [];
    return (e || []).forEach(e => {
      const n = this._lookupGenre(e);
      n && !t.includes(n[1]) && t.push(n[1])
    }), t
  }
  boostGenres(e, t = .1) {
    e?.length && (e.forEach(e => {
      const n = e.toLowerCase().replace(/\s+/g, "-");
      this.memory.genrePreferences[n] = Math.min(1, (this.memory.genrePreferences[n] || 0) + t)
    }), this.save())
  }
  boostGenresFromTmdb(e, t = .1) {
    e?.length && (e.forEach(e => {
      const n = this._tmdbMap(e);
      this.memory.genrePreferences[n] = Math.min(1, (this.memory.genrePreferences[n] || 0) + t)
    }), this.save())
  }
  boostGenreIds(e, t = .1) {
    e?.length && (e.forEach(e => {
      this.memory.genreIdPrefs[e] = Math.min(1, (this.memory.genreIdPrefs[e] || 0) + t)
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
      this.memory.genreIdPrefs[e] *= n, this.memory.genreIdPrefs[e] < .01 && delete this.memory.genreIdPrefs[e]
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
