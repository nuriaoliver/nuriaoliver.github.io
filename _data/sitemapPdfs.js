const path = require("node:path");
const { collectPdfUrls } = require("../_11ty/sitemap");

module.exports = function sitemapPdfs() {
  const root = path.resolve(__dirname, "..");
  const urls = [
    ...collectPdfUrls(path.join(root, "static")),
    ...collectPdfUrls(path.join(root, "content")),
  ];

  return [...new Set(urls)].sort();
};
