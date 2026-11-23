/* Tenký most pro starší volání (home.js, series.js) na MFCinemaPlayer (js/pages/cinema.js). Starý přehrávač už neexistuje. */
function openMovieInCinema(e, t, n) {
  // jednorázové předávané hodnoty se vždy vynulují, i kdyby je přehrávač nepřečetl
  const r = window.MFCinemaPlayer ? window.MFCinemaPlayer.open(e, t, n) : void 0;
  return window._cinSiteSlug = null, window._cinYear = null, r
}

function closeCinema() {
  if (window.MFCinemaPlayer && window.MFCinemaPlayer.close) window.MFCinemaPlayer.close()
}
window.openMovieInCinema = openMovieInCinema;
window.closeCinema = closeCinema;
