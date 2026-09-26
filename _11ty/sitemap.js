const fs = require("node:fs");
const path = require("node:path");

const EXCLUDED_EXTENSIONS = new Set(["css", "js", "json", "svg"]);

function absoluteUrl(siteUrl, pageUrl) {
  if (!siteUrl || !pageUrl) {
    throw new Error("Sitemap URLs require both a site URL and a page URL");
  }

  return new URL(pageUrl, `${siteUrl.replace(/\/$/, "")}/`).href;
}

function includeInSitemap(item) {
  if (
    !item?.url ||
    item.data?.sitemap === false ||
    item.data?.layout === "redirect"
  ) {
    return false;
  }

  const pathname = new URL(item.url, "https://example.invalid").pathname;
  const extension = pathname.includes(".")
    ? pathname.split(".").pop().toLowerCase()
    : "";

  return !EXCLUDED_EXTENSIONS.has(extension);
}

function buildSitemapAlternates(item, siteUrl, defaultLanguage = "en") {
  if (!item?.url) {
    throw new Error("Sitemap alternate links require a current page URL");
  }

  const translations =
    Array.isArray(item.data?.translations) && item.data.translations.length
      ? item.data.translations
      : item.data?.altpage
        ? [item.data.altpage]
        : [];

  if (translations.length === 0) {
    return [];
  }

  const linksByLanguage = new Map([
    [
      item.data?.lang || defaultLanguage,
      absoluteUrl(siteUrl, item.url),
    ],
  ]);

  for (const translation of translations) {
    if (!translation?.lang || !translation?.url) {
      throw new Error("Sitemap translations require a language and URL");
    }
    linksByLanguage.set(
      translation.lang,
      absoluteUrl(siteUrl, translation.url),
    );
  }

  if (linksByLanguage.size < 2) {
    return [];
  }

  const alternates = [...linksByLanguage].map(([lang, href]) => ({
    lang,
    href,
  }));
  const defaultHref =
    linksByLanguage.get(defaultLanguage) ||
    item.data?.seo?.xDefaultUrl ||
    alternates[0].href;

  alternates.push({ lang: "x-default", href: defaultHref });
  return alternates;
}

function collectPdfUrls(directory, urlPrefix = "/") {
  const urls = [];

  function visit(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".pdf") {
        const relativePath = path.relative(directory, fullPath);
        const encodedPath = relativePath
          .split(path.sep)
          .map(encodeURIComponent)
          .join("/");
        urls.push(`${urlPrefix.replace(/\/?$/, "/")}${encodedPath}`);
      }
    }
  }

  visit(directory);
  return urls.sort();
}

module.exports = {
  buildSitemapAlternates,
  collectPdfUrls,
  includeInSitemap,
};
