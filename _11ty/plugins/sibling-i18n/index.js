const DEFAULT_LANGUAGES = ['en', 'es'];
const DEFAULT_EXTENSIONS = ['md', 'markdown'];

function normalizeInputPath(inputPath) {
  return (inputPath || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createLocalizedPathPattern(languages, extensions) {
  const languagePattern = languages.map(escapeRegExp).join('|');
  const extensionPattern = extensions.map(escapeRegExp).join('|');
  return new RegExp(`^(.+)\\.(${languagePattern})\\.(${extensionPattern})$`);
}

function parseLocalizedInputPath(inputPath, options = {}) {
  const languages = options.languages || DEFAULT_LANGUAGES;
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const normalized = normalizeInputPath(inputPath);
  const match = normalized.match(createLocalizedPathPattern(languages, extensions));

  if (!match) {
    return null;
  }

  return {
    baseName: match[1],
    extension: match[3],
    inputPath: normalized,
    lang: match[2]
  };
}

function getTranslationKey(inputPath, options = {}) {
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const normalized = normalizeInputPath(inputPath);
  const localized = parseLocalizedInputPath(normalized, options);
  if (localized) {
    return localized.baseName;
  }

  const extensionPattern = extensions.map(escapeRegExp).join('|');
  return normalized.replace(new RegExp(`\\.(${extensionPattern})$`), '');
}

function localizedInputPath(basePath, lang, extension = 'md') {
  return `${normalizeInputPath(basePath)}.${lang}.${extension}`;
}

class SiblingI18nIndex {
  constructor(options = {}) {
    this.languages = options.languages || DEFAULT_LANGUAGES;
    this.extensions = options.extensions || DEFAULT_EXTENSIONS;
    this.defaultLanguage = options.defaultLanguage || this.languages[0];
    this.benchmark = options.benchmark;
    this.localizedPathPattern = createLocalizedPathPattern(
      this.languages,
      this.extensions
    );
    this.reset();
  }

  reset() {
    this.built = false;
    this.alternates = new Map();
    this.translationSets = new Map();
    this.stats = {
      pagesScanned: 0,
      localizedPages: 0,
      alternates: 0,
      buildTimeMs: 0
    };
  }

  build(collections) {
    if (this.built) {
      return this.stats;
    }

    const pages = Array.isArray(collections) ? collections : collections?.all;
    if (!Array.isArray(pages) || pages.length === 0) {
      return this.stats;
    }

    const startTime = performance.now();
    const groups = new Map();

    for (const page of pages) {
      if (!page.inputPath || !page.url) {
        continue;
      }

      const inputPath = normalizeInputPath(page.inputPath);
      const match = inputPath.match(this.localizedPathPattern);
      if (!match) {
        continue;
      }

      const [, baseName, lang] = match;
      if (!groups.has(baseName)) {
        groups.set(baseName, new Map());
      }

      const translations = groups.get(baseName);
      if (translations.has(lang)) {
        throw new Error(
          `Duplicate ${lang} translation for ${baseName}: ` +
          `${translations.get(lang).inputPath} and ${inputPath}`
        );
      }
      const entry = { inputPath, lang, page, url: page.url };
      translations.set(lang, entry);
    }

    for (const translations of groups.values()) {
      if (translations.size < 2) {
        continue;
      }

      for (const current of translations.values()) {
        const alternateEntries = this.languages
          .map(lang => translations.get(lang))
          .filter(candidate => candidate && candidate.lang !== current.lang);

        if (alternateEntries.length > 0) {
          this.alternates.set(current.inputPath, alternateEntries[0]);
          this.translationSets.set(current.inputPath, alternateEntries);
        }
      }
    }

    this.built = true;
    const buildTimeMs = performance.now() - startTime;
    const localizedPages = [...groups.values()]
      .reduce((total, translations) => total + translations.size, 0);
    this.stats = {
      pagesScanned: pages.length,
      localizedPages,
      alternates: this.alternates.size,
      buildTimeMs
    };
    this.benchmark?.record(
      'Cache: Build sibling translations',
      buildTimeMs,
      {
        note: `${pages.length} pages scanned, ${this.alternates.size} localized pages linked`
      }
    );

    return this.stats;
  }

  getAlternate(inputPath) {
    const alternate = this.alternates.get(normalizeInputPath(inputPath));
    if (!alternate) {
      return null;
    }

    return {
      inputPath: alternate.inputPath,
      lang: alternate.lang,
      url: alternate.url
    };
  }

  getAlternatePage(inputPath) {
    return this.alternates.get(normalizeInputPath(inputPath))?.page || null;
  }

  getTranslations(inputPath) {
    return (this.translationSets.get(normalizeInputPath(inputPath)) || [])
      .map(translation => ({
        inputPath: translation.inputPath,
        lang: translation.lang,
        url: translation.url
      }));
  }

  getTranslationPages(inputPath) {
    return (this.translationSets.get(normalizeInputPath(inputPath)) || [])
      .map(translation => translation.page);
  }

  getLanguage(inputPath, fallback) {
    const match = normalizeInputPath(inputPath).match(this.localizedPathPattern);
    return fallback || match?.[2] || this.defaultLanguage;
  }

  preferLanguage(pages, preferredLang = this.defaultLanguage) {
    if (!Array.isArray(pages) || pages.length === 0) {
      return [];
    }

    const groups = new Map();
    for (const page of pages) {
      const inputPath = page.inputPath || page.path || '';
      const match = normalizeInputPath(inputPath).match(this.localizedPathPattern);
      const key = match?.[1] || normalizeInputPath(inputPath);

      if (!groups.has(key)) {
        groups.set(key, {
          fallback: null,
          translations: new Map()
        });
      }

      const group = groups.get(key);
      if (!match) {
        group.fallback = page;
        continue;
      }

      const lang = match[2] || page.lang || page.data?.lang;
      group.translations.set(lang, page);
    }

    return [...groups.values()]
      .map(group => {
        if (group.fallback) {
          return group.fallback;
        }

        return group.translations.get(preferredLang) ||
          this.languages
            .map(lang => group.translations.get(lang))
            .find(Boolean) ||
          null;
      })
      .filter(Boolean);
  }
}

module.exports = function siblingI18nPlugin(eleventyConfig, options = {}) {
  const index = new SiblingI18nIndex(options);
  const trackFilter = (label, callback) => {
    if (index.benchmark) {
      return index.benchmark.trackAggregate(label, callback);
    }
    return callback();
  };

  eleventyConfig.on('eleventy.beforeWatch', () => {
    index.reset();
  });

  eleventyConfig.addCollection('_siblingI18n', collectionApi => {
    index.build(collectionApi.getAll());
    return [];
  });

  eleventyConfig.addGlobalData('eleventyComputed.altpage', () => data => {
    index.build(data.collections);
    return index.getAlternate(data.page?.inputPath);
  });

  eleventyConfig.addGlobalData('eleventyComputed.translations', () => data => {
    index.build(data.collections);
    return index.getTranslations(data.page?.inputPath);
  });

  eleventyConfig.addGlobalData('eleventyComputed.lang', () => data => {
    return index.getLanguage(data.page?.inputPath, data.lang);
  });

  eleventyConfig.addFilter('findAltPage', function(currentPage, collection) {
    if (!currentPage) {
      return null;
    }

    index.build(collection);
    const inputPath = currentPage.inputPath ||
      currentPage.page?.inputPath ||
      currentPage.path;

    if (!inputPath) {
      return null;
    }

    return index.getAlternatePage(inputPath);
  });

  eleventyConfig.addFilter('findTranslations', function(currentPage, collection) {
    if (!currentPage) {
      return [];
    }

    index.build(collection);
    const inputPath = currentPage.inputPath ||
      currentPage.page?.inputPath ||
      currentPage.path;

    return inputPath ? index.getTranslationPages(inputPath) : [];
  });

  eleventyConfig.addFilter('filterPreferredLanguage', function(pages, preferredLang) {
    return trackFilter(
      'Filter: filterPreferredLanguage',
      () => index.preferLanguage(pages, preferredLang)
    );
  });

  eleventyConfig.addFilter('filterByLang', function(pages, currentLang) {
    if (!currentLang) {
      return Array.isArray(pages) ? pages : [];
    }

    return trackFilter(
      'Filter: filterByLang',
      () => index.preferLanguage(pages, currentLang)
    );
  });
};

module.exports.SiblingI18nIndex = SiblingI18nIndex;
module.exports.getTranslationKey = getTranslationKey;
module.exports.localizedInputPath = localizedInputPath;
module.exports.normalizeInputPath = normalizeInputPath;
module.exports.parseLocalizedInputPath = parseLocalizedInputPath;
