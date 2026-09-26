const test = require("node:test");
const assert = require("node:assert/strict");
const siblingI18nPlugin = require("../_11ty/plugins/sibling-i18n");

const { SiblingI18nIndex } = siblingI18nPlugin;

test("pairs sibling home pages in both directions", () => {
  const english = {
    inputPath: "./content/index.en.njk",
    url: "/",
    data: { lang: "en" },
  };
  const spanish = {
    inputPath: "./content/index.es.njk",
    url: "/es/",
    data: { lang: "es" },
  };
  const index = new SiblingI18nIndex({ extensions: ["md", "markdown", "njk"] });

  index.build([english, spanish]);

  assert.deepEqual(index.getAlternate(english.inputPath), {
    inputPath: "content/index.es.njk",
    lang: "es",
    url: "/es/",
  });
  assert.deepEqual(index.getAlternate(spanish.inputPath), {
    inputPath: "content/index.en.njk",
    lang: "en",
    url: "/",
  });
});

test("pairs sibling biography pages with independent permalinks", () => {
  const english = {
    inputPath: "./content/bio/index.en.md",
    url: "/bio/",
    data: { lang: "en" },
  };
  const spanish = {
    inputPath: "./content/bio/index.es.md",
    url: "/es/bio/",
    data: { lang: "es" },
  };
  const index = new SiblingI18nIndex();

  index.build([english, spanish]);

  assert.equal(index.getAlternate(english.inputPath).url, "/es/bio/");
  assert.equal(index.getAlternate(spanish.inputPath).url, "/bio/");
});

test("uses an explicit language before the filename or default", () => {
  const index = new SiblingI18nIndex({ defaultLanguage: "en" });

  assert.equal(index.getLanguage("./content/page.es.md"), "es");
  assert.equal(index.getLanguage("./content/page.es.md", "ca"), "ca");
  assert.equal(index.getLanguage("./content/page.md"), "en");
});
