function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderFeaturedBook(book, lang) {
  const localized = book?.locales?.[lang];
  if (!book?.title || !book?.cover || !book?.url || !localized) {
    throw new Error(`Featured book data is incomplete for language: ${lang || "(missing)"}`);
  }

  return `<section class="home-section home-book" aria-labelledby="book-title">
  <img class="home-book__cover" src="${escapeHtml(book.cover)}" alt="${escapeHtml(localized.coverAlt)}">
  <div class="home-book__content">
    <p class="home-section__label">${escapeHtml(localized.label)}</p>
    <h2 id="book-title"><cite>${escapeHtml(book.title)}</cite></h2>
    <p>${escapeHtml(localized.byline)}</p>
    <a class="home-book__link" href="${escapeHtml(book.url)}">${escapeHtml(localized.cta)} <span aria-hidden="true">→</span></a>
  </div>
</section>`;
}

function addFeaturedBookWidget(md) {
  md.core.ruler.after("inline", "featured_book_widget", (state) => {
    for (let index = 0; index < state.tokens.length - 2; index++) {
      const open = state.tokens[index];
      const inline = state.tokens[index + 1];
      const close = state.tokens[index + 2];
      const isFeaturedBook =
        inline.type === "inline" && inline.content.trim() === "[[featured-book]]";

      if (open.type === "paragraph_open" && isFeaturedBook && close.type === "paragraph_close") {
        const token = new state.Token("html_block", "", 0);
        token.content = renderFeaturedBook(state.env.featuredBook, state.env.lang);
        state.tokens.splice(index, 3, token);
      }
    }
  });
}

module.exports = {
  addFeaturedBookWidget,
  _test: { renderFeaturedBook },
};
