const LOCALES = {
  en: {
    ariaLabel: "Research output",
    moreThan: "More than",
    publications: "Publications",
    patents: "Patents",
  },
  es: {
    ariaLabel: "Producción científica",
    moreThan: "Más de",
    publications: "Publicaciones",
    patents: "Patentes",
  },
};

function getResearchCounts(bib) {
  if (
    !Number.isInteger(bib?.totalPubs) ||
    bib.totalPubs < 0 ||
    !Number.isInteger(bib?.totalPatents) ||
    bib.totalPatents < 0
  ) {
    throw new Error("Research counts widget requires publication and patent totals");
  }
  return {
    publications: String(bib.totalPubs),
    publicationFloor: String(Math.floor(bib.totalPubs / 10) * 10),
    patents: String(bib.totalPatents),
    patentFloor: String(Math.floor(bib.totalPatents / 10) * 10),
  };
}

function renderResearchCounts(bib, lang) {
  const localized = LOCALES[lang];
  if (!localized) {
    throw new Error(`Research counts widget does not support language: ${lang || "(missing)"}`);
  }
  const counts = getResearchCounts(bib);

  return `<section class="home-section home-research-counts" aria-label="${localized.ariaLabel}">
  <a href="/publications/">
    <span>${localized.moreThan}</span>
    <strong>${counts.publicationFloor}</strong>
    <span>${localized.publications}</span>
  </a>
  <a href="/patents/">
    <span>${localized.moreThan}</span>
    <strong>${counts.patentFloor}</strong>
    <span>${localized.patents}</span>
  </a>
</section>`;
}

function addResearchCountsWidget(md) {
  md.core.ruler.after("inline", "research_counts_widget", (state) => {
    for (let index = 0; index < state.tokens.length - 2; index++) {
      const open = state.tokens[index];
      const inline = state.tokens[index + 1];
      const close = state.tokens[index + 2];
      const isResearchCounts =
        inline.type === "inline" && inline.content.trim() === "[[research-counts]]";

      if (open.type === "paragraph_open" && isResearchCounts && close.type === "paragraph_close") {
        const token = new state.Token("html_block", "", 0);
        token.content = renderResearchCounts(state.env.bib, state.env.lang);
        state.tokens.splice(index, 3, token);
      }
    }

    const hasInlineCounts = state.tokens.some(
      (token) =>
        token.type === "inline" &&
        /\[\[(?:publication-count(?:-floor)?|patent-count(?:-floor)?)\]\]/.test(token.content),
    );
    if (!hasInlineCounts) {
      return;
    }

    const counts = getResearchCounts(state.env.bib);
    for (const token of state.tokens) {
      if (token.type !== "inline") {
        continue;
      }
      for (const child of token.children || []) {
        if (child.type === "text") {
          child.content = child.content
            .replaceAll("[[publication-count]]", counts.publications)
            .replaceAll("[[publication-count-floor]]", counts.publicationFloor)
            .replaceAll("[[patent-count]]", counts.patents)
            .replaceAll("[[patent-count-floor]]", counts.patentFloor);
        }
      }
    }
  });
}

module.exports = {
  addResearchCountsWidget,
  _test: { getResearchCounts, renderResearchCounts },
};
