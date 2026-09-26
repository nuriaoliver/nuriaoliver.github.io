const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildSitemapAlternates,
  collectPdfUrls,
  includeInSitemap,
} = require("../_11ty/sitemap");

const siteUrl = "https://nuriaoliver.com";

test("builds reciprocal multilingual sitemap alternates with x-default", () => {
  const alternates = buildSitemapAlternates(
    {
      url: "/es/bio/",
      data: {
        lang: "es",
        translations: [{ lang: "en", url: "/bio/" }],
      },
    },
    siteUrl,
  );

  assert.deepEqual(alternates, [
    { lang: "es", href: "https://nuriaoliver.com/es/bio/" },
    { lang: "en", href: "https://nuriaoliver.com/bio/" },
    { lang: "x-default", href: "https://nuriaoliver.com/bio/" },
  ]);
});

test("includes every language in a translation set", () => {
  const alternates = buildSitemapAlternates(
    {
      url: "/",
      data: {
        lang: "en",
        translations: [
          { lang: "es", url: "/es/" },
          { lang: "ca", url: "/ca/" },
        ],
      },
    },
    siteUrl,
  );

  assert.deepEqual(
    alternates.map((alternate) => alternate.lang),
    ["en", "es", "ca", "x-default"],
  );
});

test("omits alternate links for pages without translations", () => {
  assert.deepEqual(
    buildSitemapAlternates(
      { url: "/projects/", data: { lang: "en" } },
      siteUrl,
    ),
    [],
  );
});

test("filters redirects, excluded pages, and unsupported assets", () => {
  assert.equal(includeInSitemap({ url: "/bio/", data: {} }), true);
  assert.equal(
    includeInSitemap({ url: "/old/", data: { layout: "redirect" } }),
    false,
  );
  assert.equal(
    includeInSitemap({ url: "/private/", data: { sitemap: false } }),
    false,
  );
  assert.equal(includeInSitemap({ url: "/data.json", data: {} }), false);
  assert.equal(includeInSitemap({ url: "/document.pdf", data: {} }), true);
});

test("collects PDF assets recursively with URL-safe paths", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-pdfs-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  fs.mkdirSync(path.join(directory, "Project Files"));
  fs.writeFileSync(path.join(directory, "Project Files", "Paper One.PDF"), "");
  fs.writeFileSync(path.join(directory, "Project Files", "notes.txt"), "");

  assert.deepEqual(collectPdfUrls(directory), [
    "/Project%20Files/Paper%20One.PDF",
  ]);
});
