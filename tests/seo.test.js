const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildSeoData,
  serializeJsonLd,
  validateStructuredData,
} = require("../_11ty/seo");

const site = { url: "https://nuriaoliver.com" };

test("builds English homepage metadata and entity JSON-LD", () => {
  const seo = buildSeoData({
    site,
    page: { url: "/" },
    title: "Nuria Oliver, PhD",
    description: "Official website.",
    lang: "en",
    home: true,
    altpage: { lang: "es", url: "/es/" },
  });

  assert.equal(seo.title, "Nuria Oliver | Computer Scientist and AI Researcher");
  assert.equal(seo.canonicalUrl, "https://nuriaoliver.com/");
  assert.equal(seo.xDefaultUrl, "https://nuriaoliver.com/");
  assert.deepEqual(
    seo.structuredData["@graph"].map((node) => node["@type"]),
    ["WebSite", "Person"],
  );
});

test("builds a localized profile page and breadcrumb trail", () => {
  const seo = buildSeoData({
    site,
    page: { url: "/es/bio/" },
    title: "Biografía",
    description: "Biografía de Nuria Oliver.",
    lang: "es",
    bio: true,
    altpage: { lang: "en", url: "/bio/" },
  });

  assert.equal(seo.xDefaultUrl, "https://nuriaoliver.com/bio/");
  assert.equal(seo.breadcrumbAriaLabel, "Migas de pan");
  assert.deepEqual(seo.breadcrumbs, [
    { name: "Inicio", url: "/es/" },
    { name: "Biografía", url: "/es/bio/" },
  ]);
  assert.deepEqual(
    seo.structuredData["@graph"].map((node) => node["@type"]),
    ["ProfilePage", "Person", "BreadcrumbList"],
  );
});

test("builds a three-level project breadcrumb trail", () => {
  const seo = buildSeoData({
    site,
    page: { url: "/projects/healthgear/" },
    title: "HealthGear",
    shortTitle: "HealthGear",
    description: "A wearable health project.",
    lang: "en",
  });

  assert.deepEqual(seo.breadcrumbs, [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects/" },
    { name: "HealthGear", url: "/projects/healthgear/" },
  ]);
});

test("serializes valid JSON-LD and escapes closing markup", () => {
  const seo = buildSeoData({
    site,
    page: { url: "/bio/" },
    title: "Biography </script>",
    description: "Biography.",
    lang: "en",
    bio: true,
  });
  const serialized = serializeJsonLd(seo.structuredData);

  assert.doesNotMatch(serialized, /<\/script>/i);
  assert.deepEqual(validateStructuredData(JSON.parse(serialized)), seo.structuredData);
});

test("rejects malformed structured data", () => {
  assert.throws(
    () =>
      validateStructuredData({
        "@context": "https://schema.org",
        "@graph": [{ "@type": "Person", "@id": "#person", name: "Nuria Oliver" }],
      }),
    /Person JSON-LD requires name, url, and image/,
  );
});
