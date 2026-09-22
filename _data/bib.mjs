import { parse }     from '@retorquere/bibtex-parser';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Entry type mapping ────────────────────────────────────────────────────────
const TYPE_MAP = {
  article      : 'journal',
  inproceedings: 'conference',
  incollection : 'chapter',
  book         : 'book',
  phdthesis    : 'thesis',
  techreport   : 'techreport',
  misc         : 'preprint',
  patent       : 'patent',
};

// ── Build a Google Patents URL from the number + type field ───────────────────
function buildPatentUrl(patentTypeField, numberField) {
  const raw = (numberField || '').trim();
  if (!raw) return '';
  const t = (patentTypeField || '').toLowerCase();
  if (t === 'patentwipo') return `https://patents.google.com/patent/${raw.replace(/\//g, '')}`;
  if (t === 'patenteuro') return `https://patents.google.com/patent/EP${raw.replace(/^EP/i, '')}`;
  return `https://patents.google.com/patent/US${raw.replace(/[,/\s]/g, '')}`;
}

// ── Format author objects → "First Last" strings ─────────────────────────────
function formatAuthor(a) {
  // The parser returns {firstName, lastName, ...} or a plain string
  if (typeof a === 'string') return a.trim();
  const parts = [a.firstName, a.von, a.lastName, a.jr].filter(Boolean);
  return parts.join(' ').trim();
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function () {
  const bibPath = join(__dirname, '..', 'data', 'nuriabib.bib');
  const publicationFilesPath = join(__dirname, '..', 'data', 'publication-files.json');
  const publicationFiles = JSON.parse(readFileSync(publicationFilesPath, 'utf-8'));
  const { entries: raw } = parse(
    readFileSync(bibPath, 'utf-8'),
    { sentenceCase: false }   // preserve original title casing
  );

  // Keep the CV source byte-for-byte mergeable; resolve repeated keys only for rendering.
  const entriesByKey = new Map();
  for (const entry of raw) {
    const current = entriesByKey.get(entry.key);
    const populatedFields = Object.values(entry.fields).filter(value => value != null && value !== '').length;
    const currentPopulatedFields = current
      ? Object.values(current.fields).filter(value => value != null && value !== '').length
      : -1;
    if (!current || populatedFields > currentPopulatedFields) entriesByKey.set(entry.key, entry);
  }
  const uniqueEntries = [...entriesByKey.values()];

  const f = (e, name) => {
    const v = e.fields[name];
    if (v == null) return '';
    if (typeof v === 'number') return String(v);
    return v;
  };

  const all = uniqueEntries.map(e => {
    const bibType = e.type;
    const type    = TYPE_MAP[bibType] || 'other';
    const year    = parseInt(f(e, 'year'), 10) || 0;
    const doi     = (f(e, 'doi') || '').trim();
    const url     = (f(e, 'url') || '').trim();
    const file    = publicationFiles[e.key] || '';
    const link    = doi ? `https://doi.org/${doi}` : url;
    const note    = f(e, 'note');
    const award   = f(e, 'award');
    const awardYear = parseInt(f(e, 'awardyear'), 10) || 0;
    const altmetric = f(e, 'altmetric');
    const altmetricScore = parseInt(altmetric.match(/\d+/)?.[0], 10) || 0;
    const altmetricTopPercent = parseInt(altmetric.match(/top\s+(\d+)\\?%/i)?.[1], 10) || 0;
    const citationCount = parseInt(f(e, 'cites') || f(e, 'citation_count'), 10) || 0;
    const hasAward = Boolean(award) || /award|prize|spotlight|honou?rable mention|distinguished paper/i.test(note);
    const isHighlighted = hasAward || altmetricScore > 0 || citationCount >= 1000;

    // authors: the parser returns an array of {firstName,lastName,...}
    const rawAuthors = e.fields.author || [];
    const authors = rawAuthors.map(formatAuthor).filter(Boolean);

    // venue
    const venue = f(e, 'journal') || f(e, 'booktitle') ||
                  f(e, 'school')  || f(e, 'institution');

    // patent-specific: the 'type' *field* (e.g. patentus) lives in fields.type
    const patentTypeField = f(e, 'type');
    const patentNumber    = f(e, 'number');

    return {
      key         : e.key,
      bibType,
      type,
      title       : f(e, 'title'),
      authors,
      year,
      venue,
      volume      : f(e, 'volume'),
      number      : patentNumber,
      pages       : f(e, 'pages'),
      publisher   : f(e, 'publisher'),
      doi,
      url,
      file,
      link,
      note,
      award,
      awardYear,
      altmetric,
      altmetricScore,
      altmetricTopPercent,
      citationCount,
      citationCountLabel: citationCount.toLocaleString('en-US'),
      hasAward,
      isHighlighted,
      // patent
      patentNumber,
      patentType  : patentTypeField.toLowerCase(),
      patentUrl   : bibType === 'patent' ? (url || buildPatentUrl(patentTypeField, patentNumber)) : '',
    };
  });

  // ── Publications (everything except patents) ─────────────────────────────
  const PUB_TYPES = new Set(['journal','conference','chapter','book','thesis','techreport','preprint']);
  const publications = all
    .filter(e => PUB_TYPES.has(e.type))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  const typeCounts = {};
  for (const e of publications) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  const highlightedCount = publications.filter(e => e.isHighlighted).length;

  const yearMap = {};
  for (const e of publications) {
    if (!yearMap[e.year]) yearMap[e.year] = [];
    yearMap[e.year].push(e);
  }
  const pubYearGroups = Object.keys(yearMap)
    .map(Number).sort((a, b) => b - a)
    .map(year => ({ year, entries: yearMap[year] }));

  // ── Patents ───────────────────────────────────────────────────────────────
  const patents = all
    .filter(e => e.type === 'patent')
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  return {
    publications,
    pubYearGroups,
    typeCounts,
    highlightedCount,
    totalPubs   : publications.length,
    patents,
    totalPatents: patents.length,
  };
}
