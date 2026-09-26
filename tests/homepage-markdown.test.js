const test = require("node:test");
const assert = require("node:assert/strict");
const markdownIt = require("markdown-it");
const { addHomepageContainers, _test } = require("../_11ty/homepage-markdown");

test("renders homepage sections with implied endings", () => {
  const md = markdownIt();
  addHomepageContainers(md);

  const output = md.render("::: section cards columns=4\n## Research");

  assert.match(
    output,
    /<section class="home-section home-research-section" style="--home-columns: 4">/,
  );
  assert.match(output, /<h2>Research<\/h2>/);
  assert.match(output, /<\/section>/);
});

test("infers the nested profile structure", () => {
  const expanded = _test.expandHomepageSections(
    "::: section split\nProfile\n::: aside list\nAwards\n::: section links\nLinks",
  );

  assert.match(expanded, /:::: home-profile\n::: home-profile-main/);
  assert.match(expanded, /:::\n::: home-recognition/);
  assert.match(expanded, /:::\n::::\n::: home-credentials/);
});

test("renders unstyled standard sections", () => {
  const md = markdownIt();
  addHomepageContainers(md);

  assert.match(md.render("::: section\n## News"), /class="home-section home-standard"/);
});

test("places the featured book outside homepage sections", () => {
  const expanded = _test.expandHomepageSections(
    "::: section hero\nIntroduction\n[[featured-book]]",
  );

  assert.match(
    expanded,
    /Introduction\n:::\n\[\[featured-book\]\]/,
  );
});
