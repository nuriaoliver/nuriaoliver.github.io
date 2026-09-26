# Sibling i18n plugin for Eleventy

This repository-local Eleventy plugin pairs translations stored as sibling
files:

```text
about.en.md
about.es.md
```

The plugin is self-contained and has no ELLIS Alicante dependencies. Copy the
`sibling-i18n` directory into another Eleventy project and register it from the
project's configuration:

```javascript
const siblingI18n = require('./_11ty/plugins/sibling-i18n');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(siblingI18n, {
    languages: ['en', 'es'],
    defaultLanguage: 'en',
    extensions: ['md', 'markdown']
  });
};
```

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `languages` | `['en', 'es']` | Supported language suffixes and fallback order |
| `defaultLanguage` | First configured language | Language for files without a suffix or explicit `lang` |
| `extensions` | `['md', 'markdown']` | File extensions considered for sibling matching |
| `benchmark` | None | Optional object implementing `record()` and `trackAggregate()` |

Translation identity is the normalized input path without its language and
extension. Public permalinks may differ because pairing does not depend on URL
structure.

## Eleventy API

The plugin registers:

- Computed `lang`: explicit front matter, filename suffix, then default language.
- Computed `altpage`: the first alternate in configured language order.
- Computed `translations`: every alternate in configured language order.
- `findAltPage(page, collection)`: returns the first alternate page object.
- `findTranslations(page, collection)`: returns all alternate page objects.
- `filterPreferredLanguage(pages, lang)`: one page per sibling group, preferring
  the requested language.
- `filterByLang(pages, lang)`: compatibility alias with pass-through behavior
  when no language is supplied.

The translation index scans the Eleventy collection once per build and uses
constant-time lookup maps afterward. It resets before an Eleventy watch rebuild.
Duplicate files for the same translation key and language fail the build.

## Exported JavaScript API

The module also exports:

- `SiblingI18nIndex`
- `getTranslationKey(inputPath, options)`
- `localizedInputPath(basePath, lang, extension)`
- `normalizeInputPath(inputPath)`
- `parseLocalizedInputPath(inputPath, options)`

These helpers let permalink, redirect, and computed-data modules share the same
filename convention without moving those responsibilities into the plugin.

## Integration boundary

The plugin owns language detection, sibling identity, alternate lookup, and
preferred-language selection. It intentionally does not render language
switchers, generate redirects or permalinks, build navigation, paginate
content, or emit SEO metadata. Those remain site concerns that consume the
plugin's data and helpers.
