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

function addResearchCountsWidget(md) {
  md.core.ruler.after("inline", "research_counts_widget", (state) => {
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
  _test: { getResearchCounts },
};
