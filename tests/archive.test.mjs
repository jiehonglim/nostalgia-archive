import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const Lib = require("../archive/lib.js");

const POST_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/;

function loadManifest() {
  return JSON.parse(
    fs.readFileSync(path.join(root, "archive/content/manifest.json"), "utf8")
  );
}

test("lib.js and app.js parse as JS", () => {
  const lib = fs.readFileSync(path.join(root, "archive/lib.js"), "utf8");
  const app = fs.readFileSync(path.join(root, "archive/app.js"), "utf8");
  assert.doesNotThrow(() => new Function(lib), "lib.js");
  // app.js needs Lib global; concatenate so SyntaxError in either fails the suite
  assert.doesNotThrow(() => new Function(lib + "\n" + app), "lib.js+app.js");
});

test("renderIndex does not break on class= inside double-quoted strings", () => {
  // Regression: `"</p><ul class="post-list">"` closes the string at class=" → Unexpected identifier 'post'
  const app = fs.readFileSync(path.join(root, "archive/app.js"), "utf8");
  assert.match(app, /'\)<\/p><ul class="post-list">'/);
  assert.doesNotMatch(
    app,
    /"\)<\/p><ul class="post-list">"/,
    "double-quoted HTML with nested class= quotes must not return"
  );
});

test("parseFrontmatter reads title and body", () => {
  const sample =
    '---\ntitle: "Hello & World"\ndate: 2017-12-30\n---\n\n# Hello\n\nBody text.\n';
  const parsed = Lib.parseFrontmatter(sample);
  assert.equal(parsed.meta.title, "Hello & World");
  assert.equal(parsed.meta.date, "2017-12-30");
  assert.match(parsed.body, /# Hello/);
  assert.equal(Lib.parseFrontmatter("no fm").meta.title, undefined);
});

test("escapeHtml escapes markup", () => {
  assert.equal(Lib.escapeHtml('<a href="x">'), "&lt;a href=&quot;x&quot;&gt;");
});

test("normalizeRoutePath and resolveManifestRoute", () => {
  assert.equal(Lib.normalizeRoutePath("/2017/12/30/slug"), "/2017/12/30/slug/");
  assert.equal(Lib.normalizeRoutePath("/"), "/");
  const routes = {
    "/2017/12/30/year-end-clean-up/": "content/posts/a.md",
  };
  assert.equal(
    Lib.resolveManifestRoute(routes, "/2017/12/30/year-end-clean-up/"),
    "content/posts/a.md"
  );
  assert.equal(
    Lib.resolveManifestRoute(routes, "/2017/12/30/year-end-clean-up"),
    "content/posts/a.md"
  );
  assert.equal(Lib.resolveManifestRoute(routes, "/missing/"), null);
});

test("pickSkin prefers query then storage then default", () => {
  assert.equal(Lib.pickSkin("win95", "plain"), "win95");
  assert.equal(Lib.pickSkin(null, "geocities"), "geocities");
  assert.equal(Lib.pickSkin("nope", "also-nope"), Lib.DEFAULT_SKIN);
  assert.equal(Lib.DEFAULT_SKIN, "plain");
  assert.deepEqual(Lib.SKINS, [
    "plain",
    "win95",
    "geocities",
    "winamp",
  ]);
});

test("manifest routes resolve /YYYY/MM/DD/slug/ to markdown files", () => {
  const manifest = loadManifest();
  assert.ok(manifest.posts.length >= 100);
  assert.ok(manifest.routes);

  for (const p of manifest.posts) {
    assert.match(p.path, POST_PATH_RE, p.path);
    assert.equal(
      manifest.routes[p.path],
      p.file,
      `route mismatch for ${p.path}`
    );
  }

  // trailing-slash variants used by the reader
  const sample = manifest.posts[0];
  const file = Lib.resolveManifestRoute(
    manifest.routes,
    sample.path.replace(/\/$/, "")
  );
  assert.equal(file, sample.file);

  for (const p of manifest.posts.slice(0, 20)) {
    const filePath = path.join(root, "archive", p.file);
    assert.ok(fs.existsSync(filePath), `missing ${p.file}`);
    const text = fs.readFileSync(filePath, "utf8");
    assert.ok(text.startsWith("---\n"), `no frontmatter ${p.file}`);
  }
});

test("skin CSS and switcher wiring exist", () => {
  for (const s of Lib.SKINS) {
    assert.ok(
      fs.existsSync(path.join(root, `archive/skins/${s}/skin.css`)),
      s
    );
  }
  const app = fs.readFileSync(path.join(root, "archive/app.js"), "utf8");
  assert.match(app, /site-nav/);
  assert.match(app, /site-nav-skin/);
  assert.match(app, /setSkin/);
  assert.match(app, /NostalgiaArchiveLib/);
  const index = fs.readFileSync(path.join(root, "archive/index.html"), "utf8");
  assert.match(index, /src="\/lib\.js"/);
  assert.match(index, /src="\/app\.js"/);
  assert.match(index, /id="skin-css"/);
  assert.match(index, /href="\/banner\.css"/);
  assert.ok(fs.existsSync(path.join(root, "archive/banner.css")));
});

test("nginx config encodes legacy redirects", () => {
  const ngPath = path.join(root, "deploy/nginx-config.sh");
  if (!fs.existsSync(ngPath)) {
    return; // public clone — deploy tooling is local-only
  }
  const ng = fs.readFileSync(ngPath, "utf8");
  assert.match(ng, /20\[0-9\]\{2\}/);
  assert.match(ng, /archive\.jiehong\.org/);
  assert.match(ng, /try_files \\\$uri \\\$uri\/ \/index\.html/);
});
