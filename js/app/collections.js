/* Kolekce. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
const COLLECTIONS_DATA = [{
  id: 1,
  name: "Marvel Cinematic Universe",
  universe: "MCU",
  icon: "🦸",
  color: "#e23030",
  tmdbCollections: [131292, 86311, 263, 422837, 284433, 131296, 422834, 422843, 422834],
  films: [{
    title: "Iron Man",
    year: 2008,
    tmdbId: 1726,
    order: 1
  }, {
    title: "Iron Man 2",
    year: 2010,
    tmdbId: 10138,
    order: 2
  }, {
    title: "Thor",
    year: 2011,
    tmdbId: 10195,
    order: 3
  }, {
    title: "Captain America: První Avenger",
    year: 2011,
    tmdbId: 1771,
    order: 4
  }, {
    title: "Avengers",
    year: 2012,
    tmdbId: 24428,
    order: 5
  }, {
    title: "Iron Man 3",
    year: 2013,
    tmdbId: 68721,
    order: 6
  }, {
    title: "Thor: Temný svět",
    year: 2013,
    tmdbId: 76338,
    order: 7
  }, {
    title: "Captain America: Návrat prvního Avengera",
    year: 2014,
    tmdbId: 100402,
    order: 8
  }, {
    title: "Strážci Galaxie",
    year: 2014,
    tmdbId: 118340,
    order: 9
  }, {
    title: "Avengers: Age of Ultron",
    year: 2015,
    tmdbId: 99861,
    order: 10
  }, {
    title: "Ant-Man",
    year: 2015,
    tmdbId: 102899,
    order: 11
  }, {
    title: "Captain America: Občanská válka",
    year: 2016,
    tmdbId: 271110,
    order: 12
  }, {
    title: "Doctor Strange",
    year: 2016,
    tmdbId: 284052,
    order: 13
  }, {
    title: "Strážci Galaxie vol. 2",
    year: 2017,
    tmdbId: 283995,
    order: 14
  }, {
    title: "Spider-Man: Homecoming",
    year: 2017,
    tmdbId: 315635,
    order: 15
  }, {
    title: "Thor: Ragnarok",
    year: 2017,
    tmdbId: 284053,
    order: 16
  }, {
    title: "Black Panther",
    year: 2018,
    tmdbId: 284054,
    order: 17
  }, {
    title: "Avengers: Infinity War",
    year: 2018,
    tmdbId: 299536,
    order: 18
  }, {
    title: "Ant-Man a Vosa",
    year: 2018,
    tmdbId: 363088,
    order: 19
  }, {
    title: "Captain Marvel",
    year: 2019,
    tmdbId: 299537,
    order: 20
  }, {
    title: "Avengers: Endgame",
    year: 2019,
    tmdbId: 299534,
    order: 21
  }, {
    title: "Spider-Man: Daleko od domova",
    year: 2019,
    tmdbId: 429617,
    order: 22
  }]
}, {
  id: 2,
  name: "Harry Potter",
  universe: "Wizarding World",
  icon: "⚡",
  color: "#7c4dff",
  films: [{
    title: "Harry Potter a Kámen mudrců",
    year: 2001,
    tmdbId: 671,
    order: 1
  }, {
    title: "Harry Potter a Tajemná komnata",
    year: 2002,
    tmdbId: 672,
    order: 2
  }, {
    title: "Harry Potter a vězeň z Azkabanu",
    year: 2004,
    tmdbId: 673,
    order: 3
  }, {
    title: "Harry Potter a Ohnivý pohár",
    year: 2005,
    tmdbId: 674,
    order: 4
  }, {
    title: "Harry Potter a Fénixův řád",
    year: 2007,
    tmdbId: 675,
    order: 5
  }, {
    title: "Harry Potter a Princ dvojí krve",
    year: 2009,
    tmdbId: 767,
    order: 6
  }, {
    title: "Harry Potter a Relikvie smrti – část 1",
    year: 2010,
    tmdbId: 12444,
    order: 7
  }, {
    title: "Harry Potter a Relikvie smrti – část 2",
    year: 2011,
    tmdbId: 12445,
    order: 8
  }, {
    title: "Fantastická zvířata a kde je najít",
    year: 2016,
    tmdbId: 259316,
    order: 9
  }, {
    title: "Fantastická zvířata: Grindelwaldovy zločiny",
    year: 2018,
    tmdbId: 338952,
    order: 10
  }, {
    title: "Fantastická zvířata: Tajemství Dumbledora",
    year: 2022,
    tmdbId: 338953,
    order: 11
  }]
}, {
  id: 3,
  name: "Star Wars",
  universe: "Galaxy Far Far Away",
  icon: "⚔️",
  color: "#ffe340",
  films: [{
    title: "Epizoda I – Skrytá hrozba",
    year: 1999,
    tmdbId: 1893,
    order: 1
  }, {
    title: "Epizoda II – Klony útočí",
    year: 2002,
    tmdbId: 1894,
    order: 2
  }, {
    title: "Epizoda III – Pomsta Sithů",
    year: 2005,
    tmdbId: 1895,
    order: 3
  }, {
    title: "Solo: Star Wars Story",
    year: 2018,
    tmdbId: 348350,
    order: 4
  }, {
    title: "Rogue One",
    year: 2016,
    tmdbId: 330459,
    order: 5
  }, {
    title: "Epizoda IV – Nová naděje",
    year: 1977,
    tmdbId: 11,
    order: 6
  }, {
    title: "Epizoda V – Impérium vrací úder",
    year: 1980,
    tmdbId: 1891,
    order: 7
  }, {
    title: "Epizoda VI – Návrat Jediho",
    year: 1983,
    tmdbId: 1892,
    order: 8
  }, {
    title: "Epizoda VII – Síla se probouzí",
    year: 2015,
    tmdbId: 140607,
    order: 9
  }, {
    title: "Rogue One",
    year: 2016,
    tmdbId: 330459,
    order: 10
  }, {
    title: "Epizoda VIII – Poslední z Jediů",
    year: 2017,
    tmdbId: 181808,
    order: 11
  }, {
    title: "Epizoda IX – Vzestup Skywalkera",
    year: 2019,
    tmdbId: 181812,
    order: 12
  }]
}, {
  id: 4,
  name: "DC Extended Universe",
  universe: "DCU",
  icon: "🦇",
  color: "#2d5fcc",
  films: [{
    title: "Man of Steel",
    year: 2013,
    tmdbId: 49521,
    order: 1
  }, {
    title: "Batman v Superman",
    year: 2016,
    tmdbId: 209112,
    order: 2
  }, {
    title: "Suicide Squad",
    year: 2016,
    tmdbId: 297761,
    order: 3
  }, {
    title: "Wonder Woman",
    year: 2017,
    tmdbId: 297762,
    order: 4
  }, {
    title: "Justice League",
    year: 2017,
    tmdbId: 141052,
    order: 5
  }, {
    title: "Aquaman",
    year: 2018,
    tmdbId: 297802,
    order: 6
  }, {
    title: "Shazam!",
    year: 2019,
    tmdbId: 287947,
    order: 7
  }, {
    title: "Birds of Prey",
    year: 2020,
    tmdbId: 495764,
    order: 8
  }, {
    title: "Wonder Woman 1984",
    year: 2020,
    tmdbId: 464052,
    order: 9
  }, {
    title: "The Suicide Squad",
    year: 2021,
    tmdbId: 437209,
    order: 10
  }, {
    title: "Black Adam",
    year: 2022,
    tmdbId: 640146,
    order: 11
  }, {
    title: "Shazam! Fury of the Gods",
    year: 2023,
    tmdbId: 605116,
    order: 12
  }]
}, {
  id: 5,
  name: "James Bond 007",
  universe: "Špionážní ságy",
  icon: "🔫",
  color: "#c0a030",
  films: [{
    title: "GoldenEye",
    year: 1995,
    tmdbId: 710,
    order: 1
  }, {
    title: "Casino Royale",
    year: 2006,
    tmdbId: 36557,
    order: 2
  }, {
    title: "Quantum of Solace",
    year: 2008,
    tmdbId: 10764,
    order: 3
  }, {
    title: "Skyfall",
    year: 2012,
    tmdbId: 37724,
    order: 4
  }, {
    title: "Spectre",
    year: 2015,
    tmdbId: 206647,
    order: 5
  }, {
    title: "No Time to Die",
    year: 2021,
    tmdbId: 370172,
    order: 6
  }]
}, {
  id: 6,
  name: "John Wick",
  universe: "Kontinentální universe",
  icon: "🐶",
  color: "#007AFF",
  films: [{
    title: "John Wick",
    year: 2014,
    tmdbId: 245891,
    order: 1
  }, {
    title: "John Wick: Chapter 2",
    year: 2017,
    tmdbId: 370172,
    order: 2
  }, {
    title: "John Wick: Chapter 3 – Parabellum",
    year: 2019,
    tmdbId: 458156,
    order: 3
  }, {
    title: "John Wick: Chapter 4",
    year: 2023,
    tmdbId: 603692,
    order: 4
  }]
}];
let _collectionsActive = null;

function closeCollections() {
  const e = document.getElementById("collectionsOverlay");
  e && (e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 320))
}

function collectionsShowGrid() {
  const e = document.getElementById("collectionsGridView"),
    t = document.getElementById("collectionsDetailView"),
    n = document.getElementById("collectionsBreadcrumb");
  e && (e.style.display = "block"), t && t.classList.remove("active"), n && (n.innerHTML = '<span class="collections-breadcrumb-home">Kolekce</span>'), _collectionsActive = null, renderCollectionsGrid()
}

function renderCollectionsGrid(skipPosters) {
  const e = document.getElementById("collectionsGrid");
  e && (e.innerHTML = COLLECTIONS_DATA.map(e => {
    const t = e.films.slice(0, 3).map(e => '<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>').join("");
    return `<div class="collection-card" onclick="collectionsOpenDetail(${e.id})">\n        <div class="collection-card-banner" id="col-banner-${e.id}">${t}</div>\n        <div class="collection-card-overlay"></div>\n        <div class="collection-card-icon">${e.icon}</div>\n        <div class="collection-card-info">\n          <div class="collection-card-universe">${e.universe}</div>\n          <div class="collection-card-name">${e.name}</div>\n          <div class="collection-card-count">${e.films.length} filmů</div>\n        </div>\n      </div>`
  }).join(""), skipPosters || COLLECTIONS_DATA.forEach(e => loadCollectionPosters(e)))
}
async function loadCollectionPosters(e) {
  const t = mfTmdbKey();
  if (!t) return;
  const n = document.getElementById(`col-banner-${e.id}`);
  if (!n) return;
  const o = e.films.slice(0, 3),
    i = await Promise.all(o.map(async e => {
      try {
        const n = await fetch(`https://api.themoviedb.org/3/movie/${e.tmdbId}?api_key=${t}&language=cs`).then(e => e.json());
        return n.poster_path ? `https://image.tmdb.org/t/p/w185${n.poster_path}` : null
      } catch {
        return null
      }
    }));
  n && (n.innerHTML = i.map((e, t) => e ? `<img class="collection-card-banner-img" src="${e}" alt="" loading="lazy" style="${0===t?"grid-column:1/-1;height:60%;object-fit:cover;":""}">` : '<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>').join(""))
}
async function collectionsOpenDetail(e) {
  const t = COLLECTIONS_DATA.find(t => t.id === e);
  if (!t) return;
  _collectionsActive = t;
  const n = document.getElementById("collectionsGridView"),
    o = document.getElementById("collectionsDetailView"),
    i = document.getElementById("collectionsBreadcrumb"),
    a = document.getElementById("collectionsDetailTitle"),
    s = document.getElementById("collectionsDetailSubtitle"),
    r = document.getElementById("collectionsDetailIcon"),
    l = document.getElementById("collectionsDetailBg"),
    c = document.getElementById("collectionsDetailFilms");
  n && (n.style.display = "none"), o && o.classList.add("active"), i && (i.innerHTML = `\n      <span class="collections-breadcrumb-home" onclick="collectionsShowGrid()">Kolekce</span>\n      <span class="collections-breadcrumb-sep">›</span>\n      <span class="collections-breadcrumb-current">${t.name}</span>\n    `), a && (a.textContent = t.name), s && (s.textContent = `${t.films.length} filmů · ${t.universe}`), r && (r.textContent = t.icon), c && (c.innerHTML = '<div class="collections-loading"><div class="collections-loading-spinner"></div></div>');
  const d = mfTmdbKey(),
    m = await Promise.all(t.films.map(async e => {
      try {
        if (!d) return {
          ...e,
          poster: null,
          rating: null
        };
        const t = await fetch(`https://api.themoviedb.org/3/movie/${e.tmdbId}?api_key=${d}&language=cs`).then(e => e.json());
        return {
          ...e,
          poster: t.poster_path ? `https://image.tmdb.org/t/p/w185${t.poster_path}` : null,
          backdrop: t.backdrop_path,
          rating: t.vote_average?.toFixed(1)
        }
      } catch {
        return {
          ...e,
          poster: null,
          rating: null
        }
      }
    }));
  l && m[0]?.backdrop && (l.style.backgroundImage = `url(https://image.tmdb.org/t/p/w780${m[0].backdrop})`), c && (c.innerHTML = m.map((e, t) => `\n        <div class="collections-film-row" onclick="collectionsPlayFilm('${e.title.replace(/'/g,"\\'")}','movie')">\n          <div class="collections-film-num">${e.order}</div>\n          <div class="collections-film-poster">${e.poster?`<img src="${e.poster}" alt="" loading="lazy">`:""}</div>\n          <div class="collections-film-info">\n            <div class="collections-film-title">${e.title}</div>\n            <div class="collections-film-meta">${e.year}</div>\n          </div>\n          ${e.rating?`<div class="collections-film-rating">★ ${e.rating}</div>`:""}\n          <button class="collections-film-play" title="  Otevřít na externím webu" onclick="event.stopPropagation();collectionsPlayFilm('${e.title.replace(/'/g,"\\'")}','movie')">▶</button>\n        </div>\n      `).join(""))
}

function collectionsPlayFilm(e, t) {
  closeCollections(), setTimeout(() => {
    "function" == typeof openWithCopy ? openWithCopy(e, t) : showToast(`▶ ${e}`)
  }, 400)
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const e = document.getElementById("premiereFabBadge");
    e && e.classList.remove("has-items")
  }, 500), renderCollectionsGrid(!0) // plakáty se nestahují při startu — přehled kolekcí nemá v UI vstup
});
