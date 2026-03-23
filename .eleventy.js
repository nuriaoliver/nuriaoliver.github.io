const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Copy static/ to output root
  eleventyConfig.addPassthroughCopy({ static: "/" });
  // Copy nav.css
  eleventyConfig.addPassthroughCopy({ "assets/css": "/css" });
  // Copy images and PDFs from content page bundles
  eleventyConfig.addPassthroughCopy(
    "content/**/*.{jpg,jpeg,png,gif,svg,webp,pdf,mp4,gif}"
  );

  // Set default layout for all pages
  eleventyConfig.addGlobalData("layout", "layouts/default.njk");

  // Layout alias: front matter `layout: publications` → layouts/publications.njk
  eleventyConfig.addLayoutAlias("publications", "layouts/publications.njk");

  // Markdown with raw HTML enabled
  const md = markdownIt({ html: true, linkify: true });
  eleventyConfig.setLibrary("md", md);

  // Filter: keep only matching types and exclude arxiv entries
  eleventyConfig.addFilter("filterPublications", function (pubs, types) {
    if (!pubs || !types) return [];
    return pubs
      .filter((p) => types.includes(p.type))
      .filter((p) => !(p.journal || "").toLowerCase().includes("arxiv"));
  });

  // Filter: sort publications by sort_date descending
  eleventyConfig.addFilter("sortByDate", function (pubs) {
    if (!pubs) return [];
    return [...pubs].sort((a, b) =>
      (b.sort_date || "").localeCompare(a.sort_date || "")
    );
  });

  // Transform: rewrite .md hrefs to clean URL paths
  eleventyConfig.addTransform("fixMdLinks", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return content.replace(/href="([^"#?]*?)\.md"/g, (_, p1) => `href="${p1}/"`);
    }
    return content;
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    // Don't pre-process markdown through a template engine — layouts still apply
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
};
