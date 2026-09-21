import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const {
  collectAnchors,
  collectOutputUrls,
  isKnownUrl,
  resolveInternalLink,
  resolveInternalUrl,
} = require("../_11ty/link-validator")._test;

test("resolves relative and root-relative internal links", () => {
  assert.equal(resolveInternalUrl("../papers/example.pdf", "/projects/demo/"), "/projects/papers/example.pdf");
  assert.equal(resolveInternalUrl("/publications/?year=2026#papers", "/projects/demo/"), "/publications/");
  assert.deepEqual(resolveInternalLink("#papers", "/publications/"), {
    path: "/publications/",
    fragment: "papers",
  });
});

test("ignores external, fragment-only, and special links", () => {
  assert.equal(resolveInternalUrl("https://example.com/page", "/"), null);
  assert.equal(resolveInternalUrl("mailto:test@example.com", "/"), null);
  assert.equal(resolveInternalUrl("#section", "/"), "/");
});

test("collects id and legacy name anchors", () => {
  assert.deepEqual(
    collectAnchors('<h2 id="papers">Papers</h2><a name="legacy">Legacy</a>'),
    new Set(["papers", "legacy"]),
  );
});

test("recognizes clean page URLs generated from index files", () => {
  const urls = new Set(["/", "/projects/demo/", "/projects/demo", "/papers/example.pdf"]);
  assert.equal(isKnownUrl("/projects/demo/", urls), true);
  assert.equal(isKnownUrl("/projects/demo", urls), true);
  assert.equal(isKnownUrl("/missing/", urls), false);
});

test("returns an empty URL set for a missing output directory", () => {
  assert.deepEqual([...collectOutputUrls("directory-that-does-not-exist")], []);
});
