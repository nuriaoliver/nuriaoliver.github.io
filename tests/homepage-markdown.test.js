const test = require("node:test");
const assert = require("node:assert/strict");
const markdownIt = require("markdown-it");
const { addHomepageContainers, _test } = require("../_11ty/homepage-markdown");

test("renders homepage sections with implied endings", () => {
  const md = markdownIt();
  addHomepageContainers(md);

  const output = md.render("::: home-research\n## Research");

  assert.match(output, /<section class="home-section home-research-section">/);
  assert.match(output, /<h2>Research<\/h2>/);
  assert.match(output, /<\/section>/);
});

test("infers the nested profile structure", () => {
  const expanded = _test.expandHomepageSections(
    "::: home-profile\nProfile\n::: home-recognition\nAwards\n::: home-credentials\nLinks",
  );

  assert.match(expanded, /:::: home-profile\n::: home-profile-main/);
  assert.match(expanded, /:::\n::: home-recognition/);
  assert.match(expanded, /:::\n::::\n::: home-credentials/);
});
