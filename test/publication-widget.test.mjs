import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { _test } = require("../_11ty/publication-widget.js");

test("publication widget renders a bibliography card from a key", () => {
  const html = _test.renderPublicationWidget("sparacino1997responsive");

  assert.match(html, /class="publication-card"/);
  assert.match(html, /Responsive portraits/i);
  assert.match(html, /\/papers\/ResponsivePortraits\.pdf/);
  assert.match(
    html,
    /<h3 class="publication-card__title"><a class="publication-card__primary-link" href="\/papers\/ResponsivePortraits\.pdf"/,
  );
  assert.doesNotMatch(html, /View in publications/);
});

test("publication widget caches bibliography and file indexes", () => {
  assert.equal(_test.getPublicationIndex(), _test.getPublicationIndex());
  assert.equal(_test.getPublicationFiles(), _test.getPublicationFiles());
});

test("publication widget fails on missing bibliography keys", () => {
  assert.throws(
    () => _test.renderPublicationWidget("missing-publication-key"),
    /Publication widget could not find bibliography key: missing-publication-key/,
  );
});

test("publication widget renders highlight badges", () => {
  const awardHtml = _test.renderPublicationWidget("oliver2000lafter");
  const citationHtml = _test.renderPublicationWidget("hertzmann2001image");
  const altmetricHtml = _test.renderPublicationWidget("lepri2017fair");

  assert.match(awardHtml, /Special Mention Award/);
  assert.match(citationHtml, /2,426 citations/);
  assert.match(altmetricHtml, /Altmetric top 5%/);
  assert.match(altmetricHtml, /What is Altmetric\?/);
});

test("publication title falls back to DOI when no PDF is available", () => {
  const html = _test.renderPublicationWidget("lepri2025socialcontract");

  assert.match(
    html,
    /<h3 class="publication-card__title"><a class="publication-card__primary-link" href="https:\/\/doi\.org\//,
  );
  assert.match(html, /target="_blank" rel="noopener"/);
});

test("publication title prefers URL over DOI", () => {
  const html = _test.renderPublicationWidget("letouze2023aisdgs");

  assert.match(
    html,
    /<h3 class="publication-card__title"><a class="publication-card__primary-link" href="https:\/\/unesdoc\.unesco\.org\//,
  );
  assert.doesNotMatch(
    html,
    /<h3 class="publication-card__title"><a class="publication-card__primary-link" href="https:\/\/doi\.org\//,
  );
});

test("publication title is not clickable without a destination", () => {
  const html = _test.renderPublicationWidget("oliver2017digitalerudites");

  assert.match(html, /<h3 class="publication-card__title">Digital Erudites<\/h3>/);
  assert.doesNotMatch(html, /<h3 class="publication-card__title"><a /);
});
