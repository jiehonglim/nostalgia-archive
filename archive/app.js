/* archive reader — skin-agnostic routing + markdown render */
(function () {
  "use strict";

  var Lib = globalThis.NostalgiaArchiveLib;
  if (!Lib) {
    throw new Error("NostalgiaArchiveLib missing — load lib.js before app.js");
  }

  var SKINS = Lib.SKINS;
  var DEFAULT_SKIN = Lib.DEFAULT_SKIN;
  var parseFrontmatter = Lib.parseFrontmatter;
  var escapeHtml = Lib.escapeHtml;
  var normalizeRoutePath = Lib.normalizeRoutePath;
  var resolveManifestRoute = Lib.resolveManifestRoute;
  var pickSkin = Lib.pickSkin;

  let manifest = null;
  let pulseRaf = 0;

  function qs(sel, el) {
    return (el || document).querySelector(sel);
  }

  function getSkin() {
    const u = new URL(location.href);
    let stored = null;
    try {
      stored = localStorage.getItem("na-skin");
    } catch (_) {}
    return pickSkin(u.searchParams.get("skin"), stored);
  }

  function setSkin(name) {
    if (!SKINS.includes(name)) name = DEFAULT_SKIN;
    try {
      localStorage.setItem("na-skin", name);
    } catch (_) {}
    document.body.dataset.skin = name;
    const link = qs("#skin-css");
    if (link) link.href = "/skins/" + name + "/skin.css";
    // keep ?skin= in URL without reload when switching
    const u = new URL(location.href);
    if (name === DEFAULT_SKIN) u.searchParams.delete("skin");
    else u.searchParams.set("skin", name);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
    renderChrome();
    refreshView();
  }

  function routePath() {
    return normalizeRoutePath(location.pathname);
  }

  function mdToHtml(md) {
    if (typeof marked !== "undefined" && marked.parse) {
      return marked.parse(md, { breaks: false, gfm: true });
    }
    // tiny fallback
    return md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }

  function rewriteMissingImages(html) {
    // already rewritten to /media/_missing.svg by scrape; ensure broken remote imgs get placeholder on error
    return html;
  }

  function skinHref(name) {
    const path = location.pathname || "/";
    if (name === DEFAULT_SKIN) return path;
    return path + "?skin=" + encodeURIComponent(name);
  }

  function siteNavHtml() {
    const cur = getSkin();
    return (
      '<header class="site-nav" aria-label="Archive navigation">' +
      '<div class="site-nav-inner">' +
      '<a class="site-nav-brand" href="/">jiehong archive</a>' +
      '<nav class="site-nav-skins" aria-label="Archive skin">' +
      SKINS.map(function (s) {
        const active = s === cur;
        return (
          '<a class="site-nav-skin' +
          (active ? " is-active" : "") +
          '" href="' +
          skinHref(s) +
          '" data-skin="' +
          s +
          '"' +
          (active ? ' aria-current="page"' : "") +
          ">" +
          s +
          "</a>"
        );
      }).join("") +
      "</nav></div></header>"
    );
  }

  function bindSkinNav() {
    document.querySelectorAll(".site-nav-skin[data-skin]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setSkin(a.getAttribute("data-skin"));
      });
    });
  }

  function renderChrome() {
    const skin = getSkin();
    const chrome = qs("#chrome");
    if (!chrome) return;
    const templates = {
      plain: "",
      win95:
        '<div class="win95-shell"><div class="win95-window">' +
        '<div class="win95-titlebar"><span class="win95-title">Explorer — jiehong archive</span><span class="win95-btns">_ □ ×</span></div>' +
        '<div class="win95-menubar">File Edit View Help</div>' +
        '<div class="win95-toolbar"><a href="/">Up</a></div></div></div>',
      geocities:
        '<div class="gc-flavor">' +
        '<div class="gc-strip"><blink class="gc-blink">★ Under construction ★</blink></div>' +
        '<div class="gc-counter">You are visitor #<!-- est. -->115+</div></div>',
      winamp: "",
    };
    chrome.innerHTML = siteNavHtml() + (templates[skin] || "");
    bindSkinNav();
  }

  function waDuration(date) {
    var d = String(date || "").slice(0, 10);
    if (d.length >= 10) return d.slice(5, 7) + ":" + d.slice(8, 10);
    return "--:--";
  }

  function waYear(date) {
    var d = String(date || "").slice(0, 4);
    return /^\d{4}$/.test(d) ? d : "????";
  }

  function waEqColsHtml() {
    var bands = [
      { label: "PRE", h: 62 },
      { label: "60", h: 48 },
      { label: "170", h: 55 },
      { label: "310", h: 40 },
      { label: "600", h: 58 },
      { label: "1K", h: 45 },
      { label: "3K", h: 52 },
      { label: "6K", h: 38 },
      { label: "12K", h: 60 },
      { label: "14K", h: 42 },
      { label: "16K", h: 50 },
    ];
    return bands
      .map(function (b, i) {
        return (
          '<div class="wa-eq-col' +
          (i === 0 ? " is-pre" : "") +
          '" aria-hidden="true">' +
          '<div class="wa-eq-track"><div class="wa-eq-thumb" style="top:' +
          b.h +
          '%"></div></div>' +
          '<span class="wa-eq-label">' +
          b.label +
          "</span></div>"
        );
      })
      .join("");
  }

  function waPlaylistHtml(activePath) {
    var posts = (manifest && manifest.posts) || [];
    var html = '<ol class="wa-tracks">';
    posts.forEach(function (p, i) {
      var active = p.path === activePath;
      html +=
        '<li class="wa-track' +
        (active ? " is-active" : "") +
        '"><a href="' +
        p.path +
        '"><span class="wa-num">' +
        (i + 1) +
        '.</span><span class="wa-track-title">' +
        escapeHtml(p.title) +
        '</span><span class="wa-len">' +
        waDuration(p.date) +
        "</span></a></li>";
    });
    html += "</ol>";
    return html;
  }

  function stopPulse() {
    if (pulseRaf) {
      cancelAnimationFrame(pulseRaf);
      pulseRaf = 0;
    }
  }

  function startPulse(canvas) {
    stopPulse();
    if (!canvas || !canvas.getContext) return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    var ctx = canvas.getContext("2d");
    var t0 = performance.now();
    function frame(now) {
      var w = (canvas.width = canvas.clientWidth || 420);
      var h = (canvas.height = canvas.clientHeight || 160);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      var t = (now - t0) / 1000;
      var bars = 48;
      var bw = w / bars;
      for (var i = 0; i < bars; i++) {
        var n =
          0.35 +
          0.35 * Math.sin(t * 2.2 + i * 0.35) +
          0.25 * Math.sin(t * 5.1 + i * 0.12);
        var bh = Math.max(4, n * h * 0.85);
        ctx.fillStyle = i % 7 === 0 ? "#00ff66" : "#00c820";
        ctx.fillRect(i * bw + 1, h - bh, Math.max(1, bw - 2), bh);
      }
      // soft milkdrop-ish blobs
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(
        w * (0.5 + 0.3 * Math.sin(t * 0.7)),
        h * (0.4 + 0.2 * Math.cos(t * 0.9)),
        40 + 20 * Math.sin(t),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      pulseRaf = requestAnimationFrame(frame);
    }
    pulseRaf = requestAnimationFrame(frame);
  }

  function renderWinamp(opts) {
    stopPulse();
    var app = qs("#app");
    var posts = (manifest && manifest.posts) || [];
    var now = opts.nowPlaying || "jiehong archive *** STOPPED ***";
    var yearBit = opts.year ? String(opts.year).slice(2) : "44";
    var totalMin = String(Math.min(99, posts.length)).padStart(2, "0");
    var body =
      opts.bodyHtml ||
      '<div class="wa-pulse-wrap">' +
        '<canvas class="wa-pulse" width="420" height="160" aria-hidden="true"></canvas>' +
        '<p class="wa-pulse-msg">Pick a track from the playlist — ' +
        posts.length +
        " posts archived. Broken Flickr / pre-2010 media show a placeholder.</p>" +
        "</div>";

    app.innerHTML =
      '<div class="wa-desktop">' +
      '<div class="wa-stack">' +
      '<div class="wa-win wa-main">' +
      '<div class="wa-tb"><span class="wa-tb-title">WINAMP</span></div>' +
      '<div class="wa-display">' +
      '<div class="wa-mini-viz" aria-hidden="true"></div>' +
      '<div class="wa-now" title="' +
      escapeHtml(now) +
      '">' +
      escapeHtml(now) +
      "</div>" +
      '<div class="wa-bits"><strong>128</strong> kbps <strong>' +
      escapeHtml(yearBit) +
      "</strong> kHz stereo</div>" +
      "</div>" +
      '<div class="wa-seek" aria-hidden="true"><div class="wa-seek-thumb"></div></div>' +
      '<div class="wa-controls">' +
      '<button type="button" class="wa-btn" tabindex="-1" aria-hidden="true">|&lt;</button>' +
      '<button type="button" class="wa-btn" tabindex="-1" aria-hidden="true">&gt;</button>' +
      '<button type="button" class="wa-btn" tabindex="-1" aria-hidden="true">||</button>' +
      '<button type="button" class="wa-btn" tabindex="-1" aria-hidden="true">[]</button>' +
      '<button type="button" class="wa-btn" tabindex="-1" aria-hidden="true">&gt;|</button>' +
      '<div class="wa-toggles">' +
      '<span class="wa-tog">SHUF</span>' +
      '<span class="wa-tog">REP</span>' +
      '<span class="wa-tog is-on">EQ</span>' +
      '<a class="wa-tog is-on" href="/">PL</a>' +
      "</div></div></div>" +
      '<div class="wa-win wa-eq">' +
      '<div class="wa-tb"><span class="wa-tb-title">WINAMP EQUALIZER</span></div>' +
      '<div class="wa-eq-top">' +
      '<span class="wa-eq-chip is-on">ON</span>' +
      '<span class="wa-eq-chip">AUTO</span>' +
      '<div class="wa-eq-graph" aria-hidden="true"></div>' +
      '<span class="wa-eq-chip">PRESETS</span>' +
      "</div>" +
      '<div class="wa-eq-sliders">' +
      waEqColsHtml() +
      "</div></div>" +
      '<div class="wa-win wa-pl">' +
      '<div class="wa-tb"><span class="wa-tb-title">WINAMP PLAYLIST</span></div>' +
      '<div class="wa-pl-scroll">' +
      waPlaylistHtml(opts.activePath || "") +
      "</div>" +
      '<div class="wa-pl-bar">' +
      '<span class="wa-pl-chip">ADD</span>' +
      '<span class="wa-pl-chip">REM</span>' +
      '<span class="wa-pl-chip">SEL</span>' +
      '<span class="wa-pl-chip">MISC</span>' +
      '<span class="wa-pl-chip">LIST</span>' +
      '<span class="wa-pl-time">0:00/' +
      totalMin +
      ":00</span>" +
      "</div></div></div>" +
      '<div class="wa-win wa-md">' +
      '<div class="wa-tb"><span class="wa-tb-title">MILKDROP</span></div>' +
      '<div class="wa-md-viewport">' +
      body +
      "</div></div></div>";

    var active = qs(".wa-track.is-active");
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "nearest" });
    }
    var canvas = qs("canvas.wa-pulse", app);
    if (canvas) startPulse(canvas);
    // missing image onerror for articles
    app.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        if (!img.dataset.missing) {
          img.dataset.missing = "1";
          img.src = "/media/_missing.svg";
          img.alt = (img.alt || "") + " (unavailable)";
        }
      });
    });
  }

  function renderIndex() {
    if (getSkin() === "winamp") {
      renderWinamp({
        nowPlaying: "jiehong archive *** " +
          (((manifest && manifest.posts) || []).length) +
          " tracks ***",
        activePath: "",
      });
      document.title = "jiehong archive";
      return;
    }

    const app = qs("#app");
    const posts = (manifest && manifest.posts) || [];
    const broken = (manifest && manifest.counts && manifest.counts.broken_images) || 0;
    let html =
      '<main class="index"><h1>Archive</h1>' +
      '<p class="meta">' +
      posts.length +
      " posts · missing images documented (" +
      broken +
      ')</p><ul class="post-list">';
    posts.forEach(function (p) {
      html +=
        '<li><a href="' +
        p.path +
        '"><time>' +
        (p.date || "").slice(0, 10) +
        "</time> " +
        escapeHtml(p.title) +
        "</a></li>";
    });
    html += "</ul>";
    if (manifest.pages && manifest.pages.length) {
      html += '<h2>Pages</h2><ul class="post-list">';
      manifest.pages.forEach(function (p) {
        html +=
          '<li><a href="' + p.path + '">' + escapeHtml(p.title) + "</a></li>";
      });
      html += "</ul>";
    }
    html +=
      '<p class="note">Broken Flickr / pre-2010 media show a placeholder — that is part of the archive story.</p></main>';
    app.innerHTML = html;
    document.title = "jiehong archive";
  }

  async function renderPost(file) {
    if (getSkin() === "winamp") {
      const app = qs("#app");
      app.innerHTML = '<p class="boot">Loading…</p>';
      const res = await fetch("/" + file.replace(/^\//, ""));
      if (!res.ok) {
        renderWinamp({
          nowPlaying: "file not found ***",
          bodyHtml:
            '<div class="wa-article"><p>Not found.</p><p class="crumb"><a href="/">← playlist</a></p></div>',
        });
        return;
      }
      const text = await res.text();
      const parsed = parseFrontmatter(text);
      let body = parsed.body.replace(/^#\s+.+\n+/, "");
      const html = rewriteMissingImages(mdToHtml(body));
      const title = parsed.meta.title || "Post";
      const date = (parsed.meta.date || "").slice(0, 10);
      const path = routePath();
      renderWinamp({
        nowPlaying: title + " <" + waDuration(date) + "> ***",
        year: waYear(date),
        activePath: path,
        bodyHtml:
          '<article class="wa-article">' +
          '<p class="crumb"><a href="/">Playlist</a></p>' +
          "<h1>" +
          escapeHtml(title) +
          "</h1>" +
          (date ? '<p class="meta"><time>' + date + "</time></p>" : "") +
          '<div class="body">' +
          html +
          "</div></article>",
      });
      document.title = title + " — jiehong archive";
      return;
    }

    const app = qs("#app");
    app.innerHTML = '<p class="boot">Loading…</p>';
    const res = await fetch("/" + file.replace(/^\//, ""));
    if (!res.ok) {
      app.innerHTML =
        '<main class="post"><p>Not found.</p><p><a href="/">← Archive home</a></p></main>';
      return;
    }
    const text = await res.text();
    const parsed = parseFrontmatter(text);
    let body = parsed.body;
    // drop duplicate H1 if frontmatter title already shown
    body = body.replace(/^#\s+.+\n+/, "");
    const html = rewriteMissingImages(mdToHtml(body));
    const title = parsed.meta.title || "Post";
    const date = (parsed.meta.date || "").slice(0, 10);
    app.innerHTML =
      '<main class="post"><p class="crumb"><a href="/">Archive</a></p>' +
      "<h1>" +
      escapeHtml(title) +
      "</h1>" +
      (date ? '<p class="meta"><time>' + date + "</time></p>" : "") +
      '<article class="body">' +
      html +
      "</article></main>";
    document.title = title + " — jiehong archive";
    // missing image onerror
    app.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        if (!img.dataset.missing) {
          img.dataset.missing = "1";
          img.src = "/media/_missing.svg";
          img.alt = (img.alt || "") + " (unavailable)";
        }
      });
    });
  }

  function refreshView() {
    if (!manifest) return;
    const path = routePath();
    if (path === "/" || path === "") {
      renderIndex();
      return;
    }
    const file = resolveManifestRoute(manifest.routes, path);
    if (file) {
      renderPost(file);
      return;
    }
    if (getSkin() === "winamp") {
      renderWinamp({
        nowPlaying: "not found ***",
        bodyHtml:
          '<div class="wa-article"><p>Not found: ' +
          escapeHtml(path) +
          '</p><p class="crumb"><a href="/">← playlist</a></p></div>',
      });
      return;
    }
    qs("#app").innerHTML =
      '<main class="post"><p>Not found: ' +
      escapeHtml(path) +
      '</p><p><a href="/">← Archive home</a></p></main>';
  }

  async function boot() {
    // apply skin chrome/css without refreshView (manifest not loaded yet)
    var name = getSkin();
    if (!SKINS.includes(name)) name = DEFAULT_SKIN;
    try {
      localStorage.setItem("na-skin", name);
    } catch (_) {}
    document.body.dataset.skin = name;
    const link = qs("#skin-css");
    if (link) link.href = "/skins/" + name + "/skin.css";
    const u = new URL(location.href);
    if (name === DEFAULT_SKIN) u.searchParams.delete("skin");
    else u.searchParams.set("skin", name);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
    renderChrome();

    const manRes = await fetch("/content/manifest.json");
    if (!manRes.ok) {
      qs("#app").innerHTML =
        '<p class="boot">Missing manifest — run <code>bash scripts/build-manifest.sh</code></p>';
      return;
    }
    manifest = await manRes.json();
    renderChrome();
    refreshView();
  }

  // Client-side nav for same-origin links (skin preserved)
  document.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    if (a.target === "_blank") return;
    if (!href.startsWith("/")) return;
    e.preventDefault();
    const u = new URL(location.href);
    const skin = u.searchParams.get("skin");
    let next = href;
    if (skin) {
      next += (href.indexOf("?") >= 0 ? "&" : "?") + "skin=" + encodeURIComponent(skin);
    }
    history.pushState(null, "", next);
    boot();
  });

  window.addEventListener("popstate", function () {
    boot();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
