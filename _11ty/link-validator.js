const fs = require("node:fs");
const path = require("node:path");

const LINK_PATTERN = /(?:href|src)=["']([^"']+)["']/g;
const ANCHOR_PATTERN = /\b(?:id|name)=["']([^"']+)["']/g;
const EXTERNAL_OR_SPECIAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&#x([\da-f]+);/gi, (_, hexadecimal) => String.fromCodePoint(Number.parseInt(hexadecimal, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"');
}

function outputPathToUrl(outputPath, outputDirectory) {
  const relativePath = path.relative(outputDirectory, outputPath).replaceAll("\\", "/");
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replace(/index\.html$/, "")}`;
}

function collectOutputUrls(directory, root = directory, urls = new Set()) {
  if (!fs.existsSync(directory)) return urls;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectOutputUrls(entryPath, root, urls);
      continue;
    }
    if (!entry.isFile()) continue;

    const relativePath = path.relative(root, entryPath).replaceAll("\\", "/");
    const url = `/${relativePath}`;
    urls.add(url);
    if (url.endsWith("/index.html")) {
      urls.add(url.slice(0, -"index.html".length));
      urls.add(url.slice(0, -"/index.html".length));
    }
  }

  return urls;
}

function resolveInternalLink(rawUrl, pageUrl) {
  const decodedUrl = decodeEntities(rawUrl).trim();
  if (!decodedUrl || EXTERNAL_OR_SPECIAL.test(decodedUrl)) return null;

  const hashIndex = decodedUrl.indexOf("#");
  const fragment = hashIndex === -1 ? "" : decodeURIComponent(decodedUrl.slice(hashIndex + 1));
  const withoutFragment = hashIndex === -1 ? decodedUrl : decodedUrl.slice(0, hashIndex);
  const queryIndex = withoutFragment.indexOf("?");
  const withoutSuffix = queryIndex === -1 ? withoutFragment : withoutFragment.slice(0, queryIndex);

  try {
    const target = new URL(
      `${withoutSuffix}${fragment ? `#${encodeURIComponent(fragment)}` : ""}`,
      `https://example.invalid${pageUrl}`
    );
    return { path: decodeURIComponent(target.pathname), fragment };
  } catch {
    return { path: withoutSuffix, fragment };
  }
}

function resolveInternalUrl(rawUrl, pageUrl) {
  return resolveInternalLink(rawUrl, pageUrl)?.path || null;
}

function collectAnchors(content) {
  return new Set([...content.matchAll(ANCHOR_PATTERN)].map((match) => decodeEntities(match[1])));
}

function isKnownUrl(url, validUrls) {
  if (validUrls.has(url)) return true;
  if (url.endsWith("/")) return validUrls.has(url.slice(0, -1));
  return validUrls.has(`${url}/`);
}

module.exports = function linkValidator(eleventyConfig) {
  const linksByOutputPath = new Map();
  const inputByOutputPath = new Map();

  eleventyConfig.addTransform("collectInternalLinks", function collectInternalLinks(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;

    const pageUrl = this.page && this.page.url
      ? this.page.url
      : outputPathToUrl(outputPath, path.resolve("_site"));
    const links = [];
    for (const match of content.matchAll(LINK_PATTERN)) {
      const link = resolveInternalLink(match[1], pageUrl);
      if (link) links.push(link);
    }

    const resolvedOutputPath = path.resolve(outputPath);
    linksByOutputPath.set(resolvedOutputPath, links);
    inputByOutputPath.set(resolvedOutputPath, this.page && this.page.inputPath);
    return content;
  });

  eleventyConfig.on("eleventy.after", ({ dir, runMode }) => {
    if (runMode === "watch") return;

    const outputDirectory = path.resolve((dir && dir.output) || "_site");
    const validUrls = collectOutputUrls(outputDirectory);
    const failures = [];

    for (const [outputPath, links] of linksByOutputPath) {
      for (const link of links) {
        const targetOutputPath = path.resolve(outputDirectory, link.path.replace(/^\/+/, ""));
        const targetCandidates = link.path.endsWith("/")
          ? [path.join(targetOutputPath, "index.html"), targetOutputPath]
          : [targetOutputPath, path.join(targetOutputPath, "index.html")];
        const targetPath = targetCandidates.find((candidate) => {
          try {
            return fs.statSync(candidate).isFile();
          } catch {
            return false;
          }
        });
        const url = `${link.path}${link.fragment ? `#${link.fragment}` : ""}`;

        if (!isKnownUrl(link.path, validUrls)) {
          failures.push({
            source: inputByOutputPath.get(outputPath) || path.relative(process.cwd(), outputPath),
            url,
          });
        } else if (link.fragment) {
          const anchors = targetPath
            ? collectAnchors(fs.readFileSync(targetPath, "utf8"))
            : null;
          if (!anchors || !anchors.has(link.fragment)) {
            failures.push({
              source: inputByOutputPath.get(outputPath) || path.relative(process.cwd(), outputPath),
              url,
              reason: "fragment does not exist",
            });
          }
        }
      }
    }

    if (failures.length === 0) {
      console.log(`[Link Validator] No broken internal links found (${linksByOutputPath.size} pages checked).`);
      return;
    }

    for (const failure of failures) {
      const reason = failure.reason || "link target does not exist";
      console.warn(`::warning file=${failure.source},title=Broken link::${reason}: ${failure.url}`);
    }
    console.warn(
      `[Link Validator] Found ${failures.length} broken internal link(s) in generated output. ` +
      "Warnings do not fail the build so legacy missing assets can be repaired incrementally."
    );
  });
};

module.exports._test = {
  collectOutputUrls,
  collectAnchors,
  resolveInternalLink,
  resolveInternalUrl,
  isKnownUrl,
};
