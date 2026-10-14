// Test Workeru (propojení zařízení) s KV v paměti – bez sítě.
import w from "../worker/tmdb-proxy.js";
import { check, finish } from "./helpers.mjs";

const m = new Map();
const env = { SYNC: { get: async k => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, delete: async k => { m.delete(k); } }, TMDB_API_KEY: "x", ALLOWED_ORIGINS: "https://a.b" };
const call = async (path, body, origin = "https://a.b", ip = "1.1.1.1") => {
  const r = await w.fetch(new Request("https://w" + path, { method: "POST", headers: { Origin: origin, "CF-Connecting-IP": ip }, body: JSON.stringify(body) }), env, {});
  return { status: r.status, json: await r.json(), cors: r.headers.get("Access-Control-Allow-Origin") };
};
const id = "a".repeat(40);

const noData = await call("/sync/code", { id });
check("worker: kód nejde vytvořit pro neexistující sadu dat", noData.status === 404);
check("worker: push uloží data", (await call("/sync/push", { id, data: { keys: { a: { v: "1", t: 1 } } } })).status === 200);
const c = await call("/sync/code", { id });
check("worker: kód má 6 znaků bez 0/O/1/I", c.status === 200 && /^[A-HJ-NP-Z2-9]{6}$/.test(c.json.code), JSON.stringify(c.json));
check("worker: pull vrátí uložená data", (await call("/sync/pull", { id })).json.data.keys.a.v === "1");
const j = await call("/sync/join", { code: c.json.code.toLowerCase() });
check("worker: kód (i malými písmeny) vymění za ID", j.json.id === id);
check("worker: kód je jednorázový", (await call("/sync/join", { code: c.json.code })).status === 404);
check("worker: krátké ID se odmítne", (await call("/sync/pull", { id: "short" })).status === 400);
check("worker: cizí Origin se odmítne a nedostane CORS", (await call("/sync/pull", { id }, "https://evil.x")).status === 403);
const writesBefore = [...m.keys()].filter(k => k.startsWith("r:")).length;
await call("/sync/join", { code: c.json.code }, "https://a.b", "2.2.2.2");
check("worker: neúspěšné pokusy se počítají (zápis do KV jen při chybě)", [...m.keys()].filter(k => k.startsWith("r:")).length === writesBefore + 1);
for (let i = 0; i < 12; i++) await call("/sync/join", { code: "AAAAAA" }, "https://a.b", "3.3.3.3");
check("worker: po 10 neúspěšných pokusech blokuje (429)", (await call("/sync/join", { code: "AAAAAA" }, "https://a.b", "3.3.3.3")).status === 429);
const big = await call("/sync/push", { id, data: { x: "y".repeat(4 * 1024 * 1024 + 10) } });
check("worker: příliš velká data se odmítnou", big.status === 413);
const get = await w.fetch(new Request("https://w/sync/pull", { method: "GET", headers: { Origin: "https://a.b" } }), env, {});
check("worker: /sync/ vyžaduje POST", get.status === 405);
const noKv = await w.fetch(new Request("https://w/sync/pull", { method: "POST", headers: { Origin: "https://a.b" }, body: "{}" }), { TMDB_API_KEY: "x" }, {});
check("worker: bez KV odpoví 501", noKv.status === 501);

// --- sdílená paměť zdrojů
const sg0 = await call("/src/get", { key: "tv:1399" });
check("worker: /src/get bez hlášení vrátí prázdný zdroj", sg0.status === 200 && sg0.json.label === "");
await call("/src/report", { key: "tv:1399", label: "Zdroj A" }, "https://a.b", "4.4.4.1");
await call("/src/report", { key: "tv:1399", label: "Zdroj B" }, "https://a.b", "4.4.4.2");
await call("/src/report", { key: "tv:1399", label: "Zdroj B" }, "https://a.b", "4.4.4.3");
const sg1 = await call("/src/get", { key: "tv:1399" });
check("worker: vrátí nejčastěji hlášený zdroj", sg1.json.label === "Zdroj B" && sg1.json.n === 2, JSON.stringify(sg1.json));
check("worker: špatný klíč / název se odmítne", (await call("/src/get", { key: "x:1" })).status === 400 && (await call("/src/report", { key: "tv:1", label: "<b>" })).status === 400);
let last;
for (let i = 0; i < 22; i++) last = await call("/src/report", { key: "movie:5", label: "Z" }, "https://a.b", "5.5.5.5");
check("worker: hlášení z jedné IP jsou omezená (429)", last.status === 429);
check("worker: cizí Origin nesmí do /src/", (await call("/src/get", { key: "tv:1" }, "https://evil.x")).status === 403);
const off = await w.fetch(new Request("https://w/src/get", { method: "POST", headers: { Origin: "https://a.b" }, body: JSON.stringify({ key: "tv:1" }) }), { ...env, SRC_SHARE: "off" }, {});
check("worker: SRC_SHARE=off sdílení vypne (501)", off.status === 501);

finish();
