import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { parse } from "@retorquere/bibtex-parser";

import loadBibliography from "../_data/bib.mjs";

const publicationFiles = JSON.parse(readFileSync("data/publication-files.json", "utf-8"));
const rawEntries = parse(readFileSync("data/nuriabib.bib", "utf-8"), { sentenceCase: false }).entries;
const bibliography = loadBibliography();
const entries = [...bibliography.publications, ...bibliography.patents];
const entriesByKey = new Map(entries.map((entry) => [entry.key, entry]));

test("renders one entry per bibliography key", () => {
  assert.equal(new Set(rawEntries.map((entry) => entry.key)).size, rawEntries.length);
  assert.equal(entries.length, 275);
  assert.equal(entriesByKey.size, entries.length);
  assert.equal(bibliography.totalPubs, 234);
  assert.equal(bibliography.totalPatents, 41);
});

test("overlays every local publication file by bibliography key", () => {
  assert.equal(Object.keys(publicationFiles).length, 55);

  for (const [key, file] of Object.entries(publicationFiles)) {
    assert.equal(entriesByKey.get(key)?.file, file, `${key} should use ${file}`);
    assert.equal(existsSync(join("static", file)), true, `${file} should exist in static assets`);
  }
});

test("loads structured CV metadata", () => {
  assert.equal(entries.filter((entry) => entry.award).length, 13);
  assert.equal(entries.filter((entry) => entry.altmetricScore > 0).length, 10);
  assert.equal(entries.filter((entry) => entry.altmetricScore > 0 && entry.isHighlighted).length, 10);
  assert.equal(entries.filter((entry) => entry.altmetricTopPercent > 0).length, 10);
  assert.equal(entriesByKey.get("oliver2000thesis")?.file, "/papers/nuria-oliver-thesis.pdf");
});
