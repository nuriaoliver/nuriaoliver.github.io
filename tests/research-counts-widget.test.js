const test = require("node:test");
const assert = require("node:assert/strict");
const markdownIt = require("markdown-it");
const {
  addResearchCountsWidget,
  _test,
} = require("../_11ty/research-counts-widget");

test("renders localized publication and patent counts", () => {
  const output = _test.renderResearchCounts(
    { totalPubs: 173, totalPatents: 41 },
    "es",
  );

  assert.match(
    output,
    /<span>Más de<\/span>\s*<strong>170<\/strong>\s*<span>Publicaciones<\/span>/,
  );
  assert.match(
    output,
    /<span>Más de<\/span>\s*<strong>40<\/strong>\s*<span>Patentes<\/span>/,
  );
  assert.match(output, /href="\/publications\/"/);
  assert.match(output, /href="\/patents\/"/);
});

test("renders the widget from Markdown environment data", () => {
  const md = markdownIt();
  addResearchCountsWidget(md);

  const output = md.render("[[research-counts]]", {
    bib: { totalPubs: 173, totalPatents: 40 },
    lang: "en",
  });

  assert.match(output, /<span>Publications<\/span>/);
  assert.doesNotMatch(output, /\[\[research-counts\]\]/);
});

test("renders inline exact and floored research counts", () => {
  const md = markdownIt();
  addResearchCountsWidget(md);

  const output = md.render(
    "Author of [[publication-count]] publications, more than [[publication-count-floor]] publications, [[patent-count]] patents exactly, and more than [[patent-count-floor]] patents.",
    {
      bib: { totalPubs: 173, totalPatents: 41 },
      lang: "en",
    },
  );

  assert.match(
    output,
    /Author of 173 publications, more than 170 publications, 41 patents exactly, and more than 40 patents\./,
  );
});

test("fails when bibliography totals are unavailable", () => {
  assert.throws(
    () => _test.renderResearchCounts({ totalPubs: 173 }, "es"),
    /requires publication and patent totals/,
  );
});
