// Parametr ?v= u skriptů a stylů v index.html se při sestavení na Cloudflare Pages nahradí hashem obsahu souboru
// (a doplní se i tam, kde chybí).
// Změní se jen ten soubor, který se opravdu změnil, a nikdo nemusí ručně zvyšovat číslo ani na to zapomenout.
import { createHash } from "node:crypto";

// Odkazy na skripty a styly v js/ a css/, s parametrem ?v= i bez něj (ikony, písma, manifest a externí adresy se nedotknou)
const RE = /(?<![\w-])(src|href)="((?:js|css)\/[^"?#]+\.(?:js|css))(?:\?v=[^"]*)?"/g;

// Vrátí upravené HTML; `read(cesta)` vrací obsah souboru (Buffer), nebo hodí chybu, když neexistuje.
export function hashAssets(html, read) {
  return html.replace(RE, (all, attr, path) => {
    let buf;
    try { buf = read(path); } catch { return all; }
    return `${attr}="${path}?v=${createHash("sha256").update(buf).digest("hex").slice(0, 8)}"`;
  });
}
