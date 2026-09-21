const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Copy static/ to output root
  eleventyConfig.addPassthroughCopy({ static: "/" });
  // Copy nav.css
  eleventyConfig.addPassthroughCopy({ "assets/css": "/css" });
  // Copy compiled Bootstrap assets from the pinned npm package
  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap/dist/css/bootstrap.min.css": "/css/bootstrap.min.css",
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "/js/bootstrap.bundle.min.js",
  });
  // Copy images and PDFs from content page bundles
  eleventyConfig.addPassthroughCopy(
    "content/**/*.{jpg,jpeg,png,gif,svg,webp,pdf,mp4,gif}"
  );

  // Collection: projects grouped by category in defined order
  const PROJECT_CATEGORY_ORDER = [
    "Wearable, Mobile and Urban Computing",
    "Multimedia Analysis, Search and Retrieval",
    "Data Mining, Social Network Analysis and User Modeling",
    "Recommender Systems",
    "Intelligent User Interfaces",
    "Perceptual and Multimodal Interfaces",
    "Human Behavior Modeling and Recognition",
    "Computer Graphics",
    "Machine Learning",
  ];

  eleventyConfig.addCollection("projectsByCategory", function (collectionApi) {
    const projects = collectionApi.getAll().filter(
      (p) =>
        p.data.category &&
        p.inputPath.includes("/projects/") &&
        !p.inputPath.endsWith("/projects/index.md")
    );

    const grouped = {};
    for (const p of projects) {
      const cat = p.data.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    }

    // Sort each group by date descending
    for (const cat of Object.keys(grouped)) {
      grouped[cat].sort((a, b) =>
        (b.data.date || "") > (a.data.date || "") ? 1 : -1
      );
    }

    return PROJECT_CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => ({
      category: cat,
      id: cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      projects: grouped[cat],
    }));
  });

  // Set default layout for all pages
  eleventyConfig.addGlobalData("layout", "layouts/default.njk");

  // Layout aliases
  eleventyConfig.addLayoutAlias("publications", "layouts/publications.njk");
  eleventyConfig.addLayoutAlias("patents",      "layouts/patents.njk");
  eleventyConfig.addLayoutAlias("projects",     "layouts/projects.njk");
  eleventyConfig.addLayoutAlias("project",      "layouts/project.njk");

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
      return content
        .replace(/href="([^"#?]*?)\.md"/g, (_, path) => `href="${path}/"`)
        .replace(
          /href="(awards|bio|invitedtalks|patents|pictures|press|programcommittees|projects|publications|summary|summary2015|videos)\.htm(#[^"]*)?"/g,
          (_, path, hash = "") => `href="/${path}/${hash}"`
        );
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
