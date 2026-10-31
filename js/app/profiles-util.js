/* Profily: klíče, oslovení, barva profilu. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
const PROFILES_KEY = "mf_profiles_v2",
  ACTIVE_PID_KEY = "mf_active_pid";

function _getProfiles() {
  const normalize = (value) => {
    if (Array.isArray(value)) return value.filter(profile => profile && typeof profile === "object");
    if (value && typeof value === "object") {
      return Object.entries(value).map(([id, profile]) => ({
        ...(profile && typeof profile === "object" ? profile : {}),
        id: profile && profile.id ? profile.id : "p_" + id
      }));
    }
    return [];
  };
  try {
    const stored = window.MFProfilesDB && typeof window.MFProfilesDB.getSync === "function"
      ? window.MFProfilesDB.getSync()
      : [];
    const databaseProfiles = normalize(stored);
    if (databaseProfiles.length) return databaseProfiles;
  } catch (e) {
    console.warn("[ProfileGate] Nelze načíst profily z databáze:", e);
  }
  try {
    const keys = [PROFILES_KEY, "mf_profiles", "mujflix_users_v1", "mujflix_users"];
    for (const key of keys) {
      const profiles = normalize(safeLS(key, "[]"));
      if (profiles.length) return profiles;
    }
  } catch (e) {
    console.warn("[ProfileGate] Nelze načíst profily z úložiště:", e);
  }
  return [];
}

function _saveProfiles(profiles) {
  try {
    if (window.MFProfilesDB && typeof window.MFProfilesDB.saveProfiles === "function") {
      window.MFProfilesDB.saveProfiles(profiles);
    }
  } catch (e) {
    console.warn("[ProfileGate] Nelze uložit profily do databáze:", e);
  }
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch(e) {
    console.warn("[ProfileGate] Nelze uložit profily do úložiště:", e);
  }
}

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PID_KEY) || null
}

function getActiveProfile() {
  const e = getActiveProfileId();
  return e && _getProfiles().find(t => t.id === e) || null
}

function uKey(e) {
  const t = getActiveProfileId();
  return t ? e + "_" + t : e
}

function setActiveUser(e) {
  safeSetItem(ACTIVE_PID_KEY, e), ProfileGate.renderBadge(), _applyProfileAccent()
}

const CZ_VOCATIVE_DICT = {
  "jan": "Jene", "honza": "Honzo", "jiří": "Jiří", "petr": "Petře", "pavel": "Pavle",
  "josef": "Josefe", "pepa": "Pepo", "jaroslav": "Jaroslave", "martin": "Martine",
  "tomáš": "Tomáši", "miroslav": "Miroslave", "františek": "Františku", "zdeněk": "Zdeňku",
  "václav": "Václave", "michal": "Michale", "vladimír": "Vladimíre", "karel": "Karle",
  "milan": "Milane", "jakub": "Jakube", "kuba": "Kubo", "lukáš": "Lukáši", "david": "Davide",
  "ondřej": "Ondřeji", "marek": "Marku", "radek": "Radku", "roman": "Romane",
  "stanislav": "Stanislave", "standa": "Stando", "antonín": "Antoníne", "tonda": "Tondo",
  "vojtěch": "Vojtěchu", "filip": "Filipe", "daniel": "Danieli", "adam": "Adame",
  "dominik": "Dominiku", "matěj": "Matěji", "patrik": "Patriku",
  "radim": "Radime", "libor": "Libore", "bohumil": "Bohumile", "vlastimil": "Vlastimile",
  "přemysl": "Přemysle", "rostislav": "Rostislave", "ladislav": "Ladislave",
  "otakar": "Otakare", "kryštof": "Kryštofe", "matyáš": "Matyáši", "alois": "Aloisi",
  "viktor": "Viktore", "robert": "Roberte", "richard": "Richarde", "erik": "Eriku",
  "denis": "Denisi", "kevin": "Kevine", "oliver": "Olivere", "vít": "Víte", "igor": "Igore",
  "alexandr": "Alexandře", "alex": "Alexi", "emil": "Emile", "bruno": "Bruno",
  "šimon": "Šimone", "ivo": "Ivo", "ivan": "Ivane", "dušan": "Dušane", "hynek": "Hynku",
  "sebastián": "Sebastiáne", "matouš": "Matouši", "šťěpán": "Štěpáne", "štěpán": "Štěpáne",
  "vašek": "Vašku", "jindřich": "Jindřichu", "bedřich": "Bedřichu", "oskar": "Oskare",
  "leoš": "Leoši", "miloš": "Miloši", "luboš": "Luboši", "aleš": "Aleši",
  "jana": "Jano", "marie": "Marie", "eva": "Evo", "hana": "Hano", "anna": "Anno",
  "věra": "Věro", "petra": "Petro", "lenka": "Lenko", "lucie": "Lucie",
  "kateřina": "Kateřino", "káťa": "Káťo", "kristýna": "Kristýno", "barbora": "Barboro",
  "bára": "Báro", "tereza": "Terezo", "míša": "Míšo", "michaela": "Michaelo",
  "veronika": "Veroniko", "zuzana": "Zuzano", "alena": "Aleno", "ivana": "Ivano",
  "jitka": "Jitko", "monika": "Moniko", "renata": "Renato", "simona": "Simono",
  "nikola": "Nikolo", "klára": "Kláro", "adéla": "Adélo", "karolína": "Karolíno",
  "natálie": "Natálie", "eliška": "Eliško", "sofie": "Sofie", "viktorie": "Viktorie",
  "aneta": "Aneto", "denisa": "Deniso", "gabriela": "Gabrielo", "andrea": "Andreo",
  "dana": "Dano", "ludmila": "Ludmilo", "vlasta": "Vlasto", "milena": "Mileno",
  "olga": "Olgo", "marta": "Marto", "blanka": "Blanko", "iveta": "Iveto",
  "radka": "Radko", "silvie": "Silvie", "kamila": "Kamilo", "pavla": "Pavlo",
  "helena": "Heleno", "markéta": "Markéto", "julie": "Julie", "ema": "Emo",
  "amálie": "Amálie", "vendula": "Vendulo", "šárka": "Šárko", "štěpánka": "Štěpánko",
  "magdaléna": "Magdaléno", "linda": "Lindo", "sára": "Sáro", "diana": "Diano"
};

function czechVocative(name) {
  try {
    if (!name || typeof name !== "string") return name;
    const trimmed = name.trim();
    if (!trimmed) return name;
    const key = trimmed.toLowerCase();
    if (CZ_VOCATIVE_DICT[key]) return CZ_VOCATIVE_DICT[key];

    const lower = trimmed.toLowerCase();
    const base = trimmed.slice(0, -1);

    if (/[aeiouyáéíóúůý]$/i.test(trimmed) === false) {
      if (lower.endsWith("ch")) return trimmed + "u";
      const last = lower.slice(-1);
      if ("khg".includes(last)) return trimmed + "u";
      if ("cčřšžj".includes(last)) return trimmed + "i";
      if (last === "r") {
        const before = lower.slice(-2, -1);
        const isVowel = /[aeiouyáéíóúůý]/.test(before);
        return isVowel ? trimmed + "e" : trimmed.slice(0, -1) + "ře";
      }
      return trimmed + "e";
    }
    if (lower.endsWith("a")) return base + "o";
    return trimmed;
  } catch (e) {
    return name;
  }
}
window.czechVocative = czechVocative;

function _applyProfileAccent() {
  const e = getActiveProfile(),
    t = /^#[0-9a-f]{6}$/i.test(e?.color || "") ? e.color : "#007AFF";
  document.documentElement.style.setProperty("--accent", t), document.documentElement.style.setProperty("--accent2", /^#[0-9a-f]{6}$/i.test(e?.color || "") ? t : "#5ac8fa");
  const n = document.getElementById("mfProfileBadge");
  if (n) {
    n.style.borderColor = t + "44";
    const e = n.querySelector(".mpb-avatar");
    e && (e.style.borderColor = t + "88")
  }
  const o = document.querySelector(".bg-glow");
  if (o) {
    const e = parseInt(t.slice(1, 3), 16),
      n = parseInt(t.slice(3, 5), 16),
      i = parseInt(t.slice(5, 7), 16);
    o.style.background = `\n          radial-gradient(ellipse 70% 55% at 15% 15%, rgba(${e},${n},${i},0.07) 0%, transparent 65%),\n          radial-gradient(ellipse 55% 65% at 85% 85%, rgba(60,80,255,0.05) 0%, transparent 65%),\n          radial-gradient(ellipse 40% 40% at 50% 100%, rgba(${e},${n},${i},0.03) 0%, transparent 70%)`
  }
}

/* ProfileGate → js/profiles/gate.js */

function refreshUserContent() {
  void 0 !== db && Object.keys(db).forEach(e => {
    "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
  }), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns(), "function" == typeof updateStreak && updateStreak()
}! function() {
  const e = _getProfiles();
  try {
    const t = safeLS("mujflix_users_v1", "{}"),
      n = Object.keys(t);
    if (n.length && 0 === e.length) {
      n.forEach(e => {
        const n = t[e],
          o = {
            id: "p_" + e,
            name: n.name || "Uživatel",
            avatar: n.avatar || "🎬",
            color: PROFILE_COLORS[0],
            pin: null,
            created: n.created || Date.now(),
            history: n.history || [],
            likedGenres: n.likedGenres || [],
            prefs: n.prefs || {},
            trakt: null
          };
        _getProfiles();
        const i = _getProfiles();
        i.push(o), _saveProfiles(i)
      });
      const e = localStorage.getItem("mujflix_active_user");
      e && localStorage.setItem(ACTIVE_PID_KEY, "p_" + e)
    }
  } catch (e) {}
  ProfileGate.renderBadge();

  function _showProfileGateOnLoad() {
    const gate = document.getElementById("mfProfileGate");
    if (!gate) return;
    const skipId = window.mfGateSkipId && window.mfGateSkipId();
    if (skipId) { ProfileGate.activateProfile(skipId); return; }
    gate.style.display = "flex";
    gate.style.opacity = "1";
    gate.classList.remove("hiding");
    ProfileGate.renderGate();
    requestAnimationFrame(() => {
      const list = document.getElementById("pgProfilesList");
      if (list && !list.children.length) ProfileGate.renderGate();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _showProfileGateOnLoad);
  } else {
    _showProfileGateOnLoad();
  }
}();
