const test = require("node:test");
const assert = require("node:assert/strict");
const markdownIt = require("markdown-it");
const {
  addResearchCountsWidget,
} = require("../_11ty/research-counts-widget");

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
  const md = markdownIt();
  addResearchCountsWidget(md);

  assert.throws(
    () => md.render("[[publication-count-floor]]", {
      bib: { totalPubs: 173 },
      lang: "es",
    }),
    /requires publication and patent totals/,
  );
});
