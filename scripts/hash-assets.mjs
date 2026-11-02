// Parametr ?v= u skriptů a stylů v index.html se při sestavení na Cloudflare Pages nahradí hashem obsahu souboru.
// Změní se jen ten soubor, který se opravdu změnil, a nikdo nemusí ručně zvyšovat číslo ani na to zapomenout.
import { createHash } from "node:crypto";

const RE = /\b(src|href)="((?:js|css)\/[^"?#]+)\?v=[^"]*"/g;

// Vrátí upravené HTML; `read(cesta)` vrací obsah souboru (Buffer), nebo hodí chybu, když neexistuje.
export function hashAssets(html, read) {
  return html.replace(RE, (all, attr, path) => {
    let buf;
    try { buf = read(path); } catch { return all; }
    return `${attr}="${path}?v=${createHash("sha256").update(buf).digest("hex").slice(0, 8)}"`;
  });
}
