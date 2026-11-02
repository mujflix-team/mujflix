/* Přehrávač: tenký most na MFCinemaPlayer (js/pages/cinema.js). Starý záložní přehrávač byl odstraněn. */
function openMovieInCinema(e, t, n) {
  // jednorázové předávané hodnoty se vždy vynulují, i kdyby je přehrávač nepřečetl
  const r = window.MFCinemaPlayer ? window.MFCinemaPlayer.open(e, t, n) : void 0;
  return window._cinSiteSlug = null, window._cinYear = null, r
}

function closeCinema() {
  const t = document.getElementById("cinemaModal");
  t && (t.classList.remove("open"), t.style.display = "none"), document.body.style.overflow = ""
}
window.openMovieInCinema = openMovieInCinema;
window.closeCinema = closeCinema;
