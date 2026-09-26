const test = require("node:test");
const assert = require("node:assert/strict");
const { _test } = require("../_11ty/featured-book-widget");

const book = {
  title: "A title",
  cover: "/cover.jpg",
  url: "https://example.com/?first=1&second=2",
  locales: {
    es: {
      label: "Nueva edición",
      byline: "Una frase clara.",
      cta: "Descubrir el libro",
      coverAlt: "Portada del libro",
    },
  },
};

test("renders localized featured book data", () => {
  const output = _test.renderFeaturedBook(book, "es");

  assert.match(output, /Nueva edición/);
  assert.match(output, /Una frase clara\./);
  assert.match(output, /first=1&amp;second=2/);
});

test("fails when localized featured book data is missing", () => {
  assert.throws(
    () => _test.renderFeaturedBook(book, "en"),
    /Featured book data is incomplete for language: en/,
  );
});
