const { readFileSync } = require("fs");
const { join } = require("path");

let publicationIndex;
let publicationFiles;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripBibValue(value) {
  return String(value || "")
    .trim()
    .replace(/^\{([\s\S]*)\}$/m, "$1")
    .replace(/^"([\s\S]*)"$/m, "$1")
    .replace(/\\%/g, "%")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBibFields(body) {
  const fields = {};
  let index = 0;

  while (index < body.length) {
    while (index < body.length && /[\s,]/.test(body[index])) index++;

    const nameStart = index;
    while (index < body.length && /[A-Za-z0-9_-]/.test(body[index])) index++;
    const name = body.slice(nameStart, index).toLowerCase();

    while (index < body.length && /\s/.test(body[index])) index++;
    if (!name || body[index] !== "=") break;
    index++;
    while (index < body.length && /\s/.test(body[index])) index++;

    let value = "";
    if (body[index] === "{") {
      const valueStart = index;
      let depth = 0;
      do {
        if (body[index] === "{") depth++;
        if (body[index] === "}") depth--;
        index++;
      } while (index < body.length && depth > 0);
      value = body.slice(valueStart, index);
    } else if (body[index] === '"') {
      const valueStart = index;
      index++;
      while (index < body.length && body[index] !== '"') index++;
      index++;
      value = body.slice(valueStart, index);
    } else {
      const valueStart = index;
      while (index < body.length && body[index] !== ",") index++;
      value = body.slice(valueStart, index);
    }

    fields[name] = stripBibValue(value);
  }

  return fields;
}

function parseBibEntries(contents) {
  const entries = new Map();
  let index = 0;

  while (index < contents.length) {
    const at = contents.indexOf("@", index);
    if (at === -1) break;

    const open = contents.indexOf("{", at);
    if (open === -1) break;

    const type = contents.slice(at + 1, open).trim().toLowerCase();
    const comma = contents.indexOf(",", open);
    if (comma === -1) break;

    const key = contents.slice(open + 1, comma).trim();
    let depth = 1;
    let end = open + 1;
    while (end < contents.length && depth > 0) {
      if (contents[end] === "{") depth++;
      if (contents[end] === "}") depth--;
      end++;
    }

    entries.set(key, {
      key,
      type,
      fields: parseBibFields(contents.slice(comma + 1, end - 1)),
    });
    index = end;
  }

  return entries;
}

function formatAuthors(authorField) {
  return stripBibValue(authorField)
    .split(/\s+and\s+/i)
    .map((author) => {
      const parts = author.split(",").map((part) => part.trim()).filter(Boolean);
      return parts.length >= 2 ? `${parts.slice(1).join(" ")} ${parts[0]}` : author.trim();
    })
    .filter(Boolean)
    .join(", ");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function getAward(fields) {
  if (fields.award) {
    return fields.awardyear ? `${fields.award} (${fields.awardyear})` : fields.award;
  }
  return /award|prize|spotlight|honou?rable mention|distinguished paper/i.test(fields.note || "")
    ? fields.note
    : "";
}

function getAltmetric(fields) {
  const altmetric = fields.altmetric || "";
  const score = parseInt(altmetric.match(/\d+/)?.[0], 10) || 0;
  const topPercent = parseInt(altmetric.match(/top\s+(\d+)\\?%/i)?.[1], 10) || 0;
  return { score, topPercent };
}

function renderBadgeRow(fields) {
  const award = getAward(fields);
  const { score: altmetricScore, topPercent: altmetricTopPercent } = getAltmetric(fields);
  const citationCount = parseInt(fields.cites || fields.citation_count, 10) || 0;
  const badges = [];

  if (award) badges.push(`<span class="pb-award">★ ${escapeHtml(award)}</span>`);
  if (altmetricScore) {
    badges.push(`<button type="button" class="pb-altmetric"
        data-bs-toggle="popover" data-bs-trigger="focus"
        data-bs-title="What is Altmetric?"
        data-bs-content="Altmetric tracks online attention to research, including mentions in news, social media, policy documents, blogs, and Wikipedia. Top ${escapeHtml(altmetricTopPercent)}% means this publication received more attention than most comparable research outputs.">
      Altmetric${altmetricTopPercent ? ` top ${escapeHtml(altmetricTopPercent)}%` : ""}
    </button>`);
  }
  if (citationCount >= 1000) badges.push(`<span class="pb-award">★ ${formatNumber(citationCount)} citations</span>`);

  return badges.length ? `<div class="publication-card__badges">${badges.join("\n    ")}</div>` : "";
}

function getPublicationIndex() {
  if (!publicationIndex) {
    publicationIndex = parseBibEntries(readFileSync(join(__dirname, "..", "data", "nuriabib.bib"), "utf-8"));
  }
  return publicationIndex;
}

function getPublicationFiles() {
  if (!publicationFiles) {
    try {
      publicationFiles = JSON.parse(readFileSync(join(__dirname, "..", "data", "publication-files.json"), "utf-8"));
    } catch {
      publicationFiles = {};
    }
  }
  return publicationFiles;
}

function renderPublicationWidget(key) {
  const entry = getPublicationIndex().get(key);
  if (!entry) {
    throw new Error(`Publication widget could not find bibliography key: ${key}`);
  }

  const fields = entry.fields;
  const files = getPublicationFiles();
  const title = fields.title || key;
  const authors = formatAuthors(fields.author);
  const venue = fields.journal || fields.booktitle || fields.school || fields.institution || "";
  const year = fields.year || "";
  const doi = fields.doi || "";
  const file = files[key] || "";
  const publicationUrl = `/publications/#${encodeURIComponent(key)}`;
  const primaryUrl = doi ? `https://doi.org/${encodeURIComponent(doi)}` : (fields.url || "");
  const details = [venue, year].filter(Boolean).join(" · ");
  const actions = [
    file ? `<a href="${escapeHtml(file)}">PDF</a>` : "",
    primaryUrl ? `<a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener">${doi ? "DOI" : "External link"}</a>` : "",
  ].filter(Boolean).join("\n      ");

  return `<article class="publication-card" id="publication-card-${escapeHtml(key)}">
  <div class="publication-card__topline">
    <div class="publication-card__eyebrow">Publication</div>
    ${actions ? `<div class="publication-card__actions">${actions}</div>` : ""}
  </div>
  ${renderBadgeRow(fields)}
  <h3 class="publication-card__title"><a href="${escapeHtml(publicationUrl)}">${escapeHtml(title)}</a></h3>
  ${authors ? `<div class="publication-card__authors">${escapeHtml(authors)}</div>` : ""}
  ${details ? `<div class="publication-card__details">${escapeHtml(details)}</div>` : ""}
</article>`;
}

function addPublicationWidgets(md) {
  md.core.ruler.after("inline", "publication_widgets", (state) => {
    for (let index = 0; index < state.tokens.length - 2; index++) {
      const open = state.tokens[index];
      const inline = state.tokens[index + 1];
      const close = state.tokens[index + 2];
      const match = inline.type === "inline" && inline.content.trim().match(/^\[\[(?:publication|paper):([A-Za-z0-9_-]+)\]\]$/);

      if (open.type === "paragraph_open" && match && close.type === "paragraph_close") {
        const token = new state.Token("html_block", "", 0);
        token.content = renderPublicationWidget(match[1]);
        state.tokens.splice(index, 3, token);
      }
    }
  });
}

module.exports = {
  addPublicationWidgets,
  _test: {
    formatAuthors,
    getPublicationFiles,
    getPublicationIndex,
    parseBibEntries,
    renderPublicationWidget,
  },
};
