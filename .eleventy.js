const markdownIt = require("markdown-it");
const yaml = require("yaml");
const redirectsPlugin = require("./_11ty/redirects");
const { addPublicationWidgets } = require("./_11ty/publication-widget");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(redirectsPlugin);
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.parse(contents));

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
    "content/**/*.{jpg,jpeg,png,gif,svg,webp,pdf,mp4,ppt}"
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

  eleventyConfig.addCollection("projectsByCareerPeriod", function (collectionApi) {
    const projects = collectionApi.getAll().filter(
      (p) =>
        p.data.category &&
        p.inputPath.includes("/projects/") &&
        !p.inputPath.endsWith("/projects/index.md")
    );
    const periods = [
      { id: "telefonica", title: "Telefónica Research", start: 2007, end: 2016 },
      { id: "microsoft", title: "Microsoft Research", start: 2000, end: 2007 },
      { id: "mit", title: "MIT Media Lab", start: 1995, end: 2001 },
    ];
    const grouped = Object.fromEntries(periods.map((period) => [period.id, []]));

    for (const project of projects) {
      const period = periods.find(
        (candidate) => candidate.id === project.data.careerPeriod,
      );
      if (!period) {
        throw new Error(
          `Project ${project.inputPath} must define careerPeriod as mit, microsoft, or telefonica`,
        );
      }
      grouped[period.id].push(project);
    }

    return periods.map((period) => ({
      ...period,
      projects: grouped[period.id]
        .sort((a, b) => (b.data.years || "").localeCompare(a.data.years || ""))
        .map((project) => ({
          project,
          shortTitle: project.data.shortTitle || project.data.title,
          description: project.data.description || "Research project details and publications.",
        })),
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
  addPublicationWidgets(md);
  const defaultLinkOpen = md.renderer.rules.link_open || function (tokens, index, options, env, self) {
    return self.renderToken(tokens, index, options);
  };
  const defaultLinkClose = md.renderer.rules.link_close || function (tokens, index, options, env, self) {
    return self.renderToken(tokens, index, options);
  };
  md.renderer.rules.link_open = function (tokens, index, options, env, self) {
    const href = tokens[index].attrGet("href") || "";
    if (/\.mp4(?:[?#].*)?$/i.test(href)) {
      env.renderingVideoLink = true;
      return `<video class="project-video" controls preload="metadata" src="${md.utils.escapeHtml(href)}">`;
    }
    return defaultLinkOpen(tokens, index, options, env, self);
  };
  md.renderer.rules.link_close = function (tokens, index, options, env, self) {
    if (env.renderingVideoLink) {
      env.renderingVideoLink = false;
      return "</video>";
    }
    return defaultLinkClose(tokens, index, options, env, self);
  };
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("markdown", function (content) {
    return md.render(content || "");
  });
  eleventyConfig.addFilter("markdownInline", function (content) {
    return md.renderInline(content || "");
  });
  eleventyConfig.addFilter("archiveByDecade", function (archive, category) {
    const decades = new Map();

    for (const [year, categories] of Object.entries(archive || {})) {
      const talks = categories[category];
      if (!talks) continue;
      const numericYear = Number(year);
      const decade = Math.floor(numericYear / 10) * 10;
      if (!decades.has(decade)) decades.set(decade, []);
      decades.get(decade).push({ year: numericYear, talks });
    }

    return [...decades.entries()]
      .sort(([first], [second]) => second - first)
      .map(([decade, years]) => ({
        decade,
        years: years.sort((first, second) => second.year - first.year),
      }));
  });

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

  // Validate the final URLs after link-rewriting transforms have run.
  require("./_11ty/link-validator")(eleventyConfig);

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
