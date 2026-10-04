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
  _tmdbMap(e) {
    return {
      Comedy: "komedie",
      "Action & Adventure": "akcni",
      "Sci-Fi & Fantasy": "sci-fi",
      Drama: "drama",
      Family: "rodinny",
      Mystery: "krimi",
      Animation: "animovany",
      Horror: "horor",
      Adventure: "dobrodruzny",
      Crime: "krimi",
      "Science Fiction": "sci-fi",
      Fantasy: "fantasy",
      Action: "akcni",
      Thriller: "napinavy",
      Romance: "romantika",
      Documentary: "dokument",
      "War & Politics": "valecny",
      Western: "western",
      History: "historicky",
      Music: "hudba",
      Kids: "detsky",
      Reality: "reality",
      Talk: "talk-show",
      News: "zpravodajstvi",
      Soap: "telenovela"
    } [e] || e.toLowerCase().replace(/\s+/g, "-")
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
      t = (e - (this.memory.lastActive || e)) / 864e5,
      n = Math.max(.92, 1 - .01 * t);
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
