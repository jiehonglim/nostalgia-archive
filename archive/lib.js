/* Pure helpers for the archive reader (browser + node tests). */
(function (root) {
  "use strict";

  var SKINS = ["plain", "win95", "geocities", "winamp"];
  var DEFAULT_SKIN = "plain";

  function normalizeRoutePath(pathname) {
    var p = pathname || "/";
    if (!p.endsWith("/")) p += "/";
    return p;
  }

  function resolveManifestRoute(routes, path) {
    if (!routes) return null;
    if (routes[path]) return routes[path];
    var alt = path.endsWith("/") ? path.slice(0, -1) : path + "/";
    return routes[alt] || routes[alt + "/"] || null;
  }

  function pickSkin(querySkin, storedSkin) {
    if (querySkin && SKINS.indexOf(querySkin) >= 0) return querySkin;
    if (storedSkin && SKINS.indexOf(storedSkin) >= 0) return storedSkin;
    return DEFAULT_SKIN;
  }

  function parseFrontmatter(text) {
    if (!text.startsWith("---\n")) return { meta: {}, body: text };
    var end = text.indexOf("\n---\n", 4);
    if (end < 0) return { meta: {}, body: text };
    var fm = text.slice(4, end);
    var body = text.slice(end + 5);
    var meta = {};
    fm.split("\n").forEach(function (line) {
      var i = line.indexOf(":");
      if (i < 0) return;
      var k = line.slice(0, i).trim();
      var v = line.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        try {
          v = JSON.parse(v);
        } catch (_) {
          v = v.slice(1, -1);
        }
      }
      meta[k] = v;
    });
    return { meta: meta, body: body };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var api = {
    SKINS: SKINS,
    DEFAULT_SKIN: DEFAULT_SKIN,
    normalizeRoutePath: normalizeRoutePath,
    resolveManifestRoute: resolveManifestRoute,
    pickSkin: pickSkin,
    parseFrontmatter: parseFrontmatter,
    escapeHtml: escapeHtml,
  };

  root.NostalgiaArchiveLib = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
