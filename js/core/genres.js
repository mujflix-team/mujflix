/* MůjFlix — převod ID žánrů mezi filmy a seriály (TMDB používá pro seriály částečně jiná ID).
 * mfGenreIdsFor([28, 27], 'tv') → ['10759']   (Horor u seriálů neexistuje)
 * mfGenreIdsFor([10759], 'movie') → ['28', '12'] */
(function () {
  "use strict";

  // ID, která existují jen u seriálů → odpovídající filmová ID
  var TV_ONLY_TO_MOVIE = { 10759: [28, 12], 10765: [878, 14], 10768: [10752] };
  // filmová ID, která mají u seriálů jiné ID (nebo žádné)
  var MOVIE_TO_TV = { 28: [10759], 12: [10759], 878: [10765], 14: [10765], 10752: [10768], 53: [9648] };
  // filmová ID bez ekvivalentu u seriálů
  var MOVIE_ONLY = { 27: 1, 10749: 1, 36: 1, 10402: 1, 10770: 1 };

  window.mfGenreIdsFor = function (ids, type) {
    var out = [], seen = {};
    function add(v) { v = String(v); if (!seen[v]) { seen[v] = 1; out.push(v); } }
    (ids || []).forEach(function (raw) {
      var id = parseInt(raw, 10);
      if (isNaN(id)) return;
      if (type === "tv") {
        if (MOVIE_ONLY[id]) return;
        (MOVIE_TO_TV[id] || [id]).forEach(add);
      } else {
        (TV_ONLY_TO_MOVIE[id] || [id]).forEach(add);
      }
    });
    return out;
  };

  // Anime není v TMDB samostatný žánr: je to animace (16) japonského původu. Zájem o něj je v profilu jako prefs.likesAnime.
  window.mfLikesAnime = function () {
    try { var p = typeof getActiveProfile === "function" ? getActiveProfile() : null; return !!(p && p.prefs && p.prefs.likesAnime); } catch (e) { return false; }
  };
  // Anime = animace (16) japonského původu. „Animované“ (Simpsonovi, Pixar …) jsou ostatní, ať se nemíchají.
  window.mfIsAnime = function (r) {
    if (!r) return false;
    var ids = r.genre_ids || r.genreIds || [];
    return (r.original_language || r.lang) === "ja" && ids.indexOf(16) > -1;
  };
  window.MF_ANIME_QUERY = "&with_genres=16&with_original_language=ja";
})();
