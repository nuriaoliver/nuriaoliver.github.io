const HOME_TITLES = {
  en: "Nuria Oliver | Computer Scientist and AI Researcher",
  es: "Nuria Oliver | Investigadora en Inteligencia Artificial",
};

const BREADCRUMB_LABELS = {
  en: { home: "Home", projects: "Projects", ariaLabel: "Breadcrumb" },
  es: { home: "Inicio", projects: "Proyectos", ariaLabel: "Migas de pan" },
};

const PERSON = {
  "@type": "Person",
  "@id": "https://nuriaoliver.com/#person",
  name: "Nuria Oliver",
  honorificSuffix: "PhD",
  url: "https://nuriaoliver.com/",
  image: "https://nuriaoliver.com/bio/NuriaOliverFaceShotBlue.jpg",
  jobTitle: [
    "Director and Cofounder of ELLIS Alicante",
    "Vice-President and Cofounder of ELLIS",
    "Chief Data Scientist at Data-Pop Alliance",
  ],
  affiliation: [
    {
      "@type": "Organization",
      name: "ELLIS Alicante",
      url: "https://ellisalicante.org/",
    },
    {
      "@type": "Organization",
      name: "European Laboratory for Learning and Intelligent Systems",
      url: "https://ellis.eu/",
    },
    {
      "@type": "Organization",
      name: "Data-Pop Alliance",
      url: "https://datapopalliance.org/",
    },
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Massachusetts Institute of Technology",
      url: "https://www.mit.edu/",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Universidad Politécnica de Madrid",
      url: "https://www.upm.es/",
    },
  ],
  knowsAbout: [
    "Artificial intelligence",
    "Human-computer interaction",
    "Computational social science",
    "Mobile computing",
    "AI for social good",
  ],
  sameAs: [
    "https://orcid.org/0000-0001-5985-691X",
    "https://scholar.google.com/citations?user=VJlCMGYAAAAJ",
    "https://en.wikipedia.org/wiki/Nuria_Oliver",
    "https://es.wikipedia.org/wiki/Nuria_Oliver",
    "https://ellisalicante.org/people/nuriaoliver/",
  ],
};

function absoluteUrl(siteUrl, path) {
  return new URL(path, `${siteUrl.replace(/\/$/, "")}/`).href;
}

function getBreadcrumbs(data) {
  const pageUrl = data.page?.url || "";
  if (data.home || !pageUrl || !data.title || !pageUrl.startsWith("/")) {
    return [];
  }

  const lang = data.lang === "es" ? "es" : "en";
  const labels = BREADCRUMB_LABELS[lang];
  const homeUrl = lang === "es" ? "/es/" : "/";
  const breadcrumbs = [{ name: labels.home, url: homeUrl }];

  if (/^\/projects\/[^/]+\/$/.test(pageUrl)) {
    breadcrumbs.push({ name: labels.projects, url: "/projects/" });
  }

  breadcrumbs.push({
    name: data.shortTitle || data.title,
    url: pageUrl,
  });

  return breadcrumbs;
}

function buildBreadcrumbNode(breadcrumbs, siteUrl, pageUrl) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(siteUrl, pageUrl)}#breadcrumb`,
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.url),
    })),
  };
}

function validateStructuredData(document) {
  if (!document || document["@context"] !== "https://schema.org") {
    throw new Error("JSON-LD must use the Schema.org context");
  }
  if (!Array.isArray(document["@graph"]) || document["@graph"].length === 0) {
    throw new Error("JSON-LD must contain a non-empty @graph");
  }

  for (const node of document["@graph"]) {
    if (!node["@type"] || !node["@id"]) {
      throw new Error("Every JSON-LD node must have @type and @id");
    }
    if (node["@type"] === "WebSite" && (!node.name || !node.url)) {
      throw new Error("WebSite JSON-LD requires name and url");
    }
    if (node["@type"] === "Person" && (!node.name || !node.url || !node.image)) {
      throw new Error("Person JSON-LD requires name, url, and image");
    }
    if (node["@type"] === "ProfilePage" && !node.mainEntity?.["@id"]) {
      throw new Error("ProfilePage JSON-LD requires a mainEntity");
    }
    if (node["@type"] === "BreadcrumbList") {
      if (
        !Array.isArray(node.itemListElement) ||
        node.itemListElement.length < 2 ||
        node.itemListElement.some(
          (item, index) =>
            item["@type"] !== "ListItem" ||
            item.position !== index + 1 ||
            !item.name ||
            !item.item,
        )
      ) {
        throw new Error("BreadcrumbList JSON-LD contains invalid items");
      }
    }
  }

  return document;
}

function buildStructuredData(data, breadcrumbs) {
  const siteUrl = data.site?.url || "https://nuriaoliver.com";
  const pageUrl = data.page?.url || "/";
  const canonicalUrl = absoluteUrl(siteUrl, pageUrl);
  const lang = data.lang === "es" ? "es" : "en";
  const graph = [];

  if (data.home) {
    graph.push({
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Nuria Oliver",
      alternateName: "Nuria Oliver, PhD",
      inLanguage: ["en", "es"],
      about: { "@id": PERSON["@id"] },
    });
    graph.push({ ...PERSON, description: data.description });
  } else {
    graph.push({
      "@type": data.bio ? "ProfilePage" : "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: data.title,
      ...(data.description ? { description: data.description } : {}),
      inLanguage: lang,
      ...(data.bio ? { mainEntity: { "@id": PERSON["@id"] } } : {}),
      ...(breadcrumbs.length
        ? { breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` } }
        : {}),
    });
    if (data.bio) {
      graph.push({ ...PERSON, description: data.description });
    }
  }

  if (breadcrumbs.length) {
    graph.push(buildBreadcrumbNode(breadcrumbs, siteUrl, pageUrl));
  }

  return validateStructuredData({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}

function buildSeoData(data) {
  const siteUrl = data.site?.url || "https://nuriaoliver.com";
  const pageUrl = data.page?.url || "/";
  const lang = data.lang === "es" ? "es" : "en";
  const breadcrumbs = getBreadcrumbs(data);
  const defaultLanguageUrl =
    lang === "en"
      ? pageUrl
      : data.altpage?.lang === "en"
        ? data.altpage.url
        : "/";

  return {
    title: data.home
      ? HOME_TITLES[lang]
      : data.title
        ? `${data.title} | Nuria Oliver`
        : "Nuria Oliver",
    description: data.description || "",
    canonicalUrl: absoluteUrl(siteUrl, pageUrl),
    xDefaultUrl: absoluteUrl(siteUrl, defaultLanguageUrl),
    breadcrumbAriaLabel: BREADCRUMB_LABELS[lang].ariaLabel,
    breadcrumbs,
    structuredData: buildStructuredData(data, breadcrumbs),
  };
}

function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

module.exports = {
  buildSeoData,
  serializeJsonLd,
  validateStructuredData,
  _test: {
    absoluteUrl,
    buildBreadcrumbNode,
    buildStructuredData,
    getBreadcrumbs,
  },
};
