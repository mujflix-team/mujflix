/* MůjFlix — detekce prohlížeče a odkaz na blokovač reklam (jen jeden odkaz podle prohlížeče). */
(function () {
  "use strict";

  function detectBrowser() {
    var ua = (navigator.userAgent || "");
    if (/firefox|fxios/i.test(ua)) return "firefox";
    if (/safari/i.test(ua) && !/chrome|chromium|crios|edg|opr\//i.test(ua)) return "safari";
    return "chromium"; // Chrome, Edge, Brave, Opera, Vivaldi… (instalují z Chrome Web Store)
  }

  var LINKS = {
    firefox: { name: "Firefox", label: "uBlock Origin pro Firefox", url: "https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/" },
    chromium: { name: "Chrome", label: "uBlock Origin Lite pro Chrome", url: "https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh" },
    safari: { name: "Safari", label: "AdGuard pro Safari", url: "https://adguard.com/cs/adguard-safari/overview.html" }
  };

  window.mfAdblock = {
    browser: detectBrowser,
    link: function () { return LINKS[detectBrowser()]; },
    /** HTML s jedním odkazem, text je escapovaný (data jsou konstanty výše). */
    linkHtml: function () {
      var l = LINKS[detectBrowser()];
      return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer">' + l.label + "</a>";
    }
  };
})();
