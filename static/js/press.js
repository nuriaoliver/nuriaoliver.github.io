document.addEventListener("DOMContentLoaded", () => {
  const queryInput = document.querySelector("#press-query");
  const count = document.querySelector("#press-count");
  const jumpNav = document.querySelector(".press-jump");
  const sectionHeadings = [...document.querySelectorAll(".press-page h2[id]")];

  if (!queryInput || !count || !jumpNav || !sectionHeadings.length) return;

  const currentYear = new Date().getFullYear();
  const getYear = (text) => {
    const fullYears = [...text.matchAll(/\b(?:19|20)\d{2}\b/g)]
      .map((match) => Number(match[0]))
      .filter((year) => year <= currentYear);
    if (fullYears.length) return fullYears.at(-1);

    const shortYear = text.match(
      /\b(?:Jan|Feb|Mar|Apr|May|Mayo|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{2})\b/i
    );
    if (!shortYear) return null;
    const year = Number(shortYear[1]);
    return year >= 70 ? 1900 + year : 2000 + year;
  };

  const pressItems = [];
  const decadeGroups = [];
  const yearGroups = [];
  const grouped = new Map();
  const mediaLabels = {
    "printed-online-media": "Print & online",
    "radio-video-tv": "Radio & TV",
    "blog-posts": "Blog",
  };

  for (const heading of sectionHeadings) {
    const sourceList = heading.nextElementSibling;
    if (sourceList?.tagName !== "UL") continue;

    for (const item of [...sourceList.children]) {
      const year = getYear(item.textContent);
      const decade = year ? Math.floor(year / 10) * 10 : "undated";
      if (!grouped.has(decade)) grouped.set(decade, new Map());
      const years = grouped.get(decade);
      const yearLabel = year || "Date not listed";
      if (!years.has(yearLabel)) years.set(yearLabel, []);
      const tag = document.createElement("span");
      tag.className = "press-tag";
      tag.textContent = mediaLabels[heading.id];
      item.prepend(tag);
      years.get(yearLabel).push(item);
      pressItems.push(item);
    }

    sourceList.remove();
    heading.remove();
  }

  const archive = document.createElement("div");
  archive.className = "press-archive";
  document.querySelector(".press-tools").after(archive);
  const sortedDecades = [...grouped.entries()].sort(([first], [second]) => {
    if (first === "undated") return 1;
    if (second === "undated") return -1;
    return second - first;
  });

  for (const [decade, years] of sortedDecades) {
    const details = document.createElement("details");
    details.className = "press-decade";
    details.id = decade === "undated" ? "press-undated" : `press-${decade}s`;
    details.open = decade !== "undated" && decade >= 2020;
    const summary = document.createElement("summary");
    const itemCount = [...years.values()].reduce((total, items) => total + items.length, 0);
    summary.textContent = decade === "undated" ? `Date not listed (${itemCount})` : `${decade}s (${itemCount})`;
    details.append(summary);

    const jumpLink = document.createElement("a");
    jumpLink.href = `#${details.id}`;
    jumpLink.textContent = summary.textContent;
    jumpLink.addEventListener("click", () => {
      details.open = true;
    });
    jumpNav.append(jumpLink);

    const sortedYears = [...years.entries()].sort(([first], [second]) => {
      if (first === "Date not listed") return 1;
      if (second === "Date not listed") return -1;
      return second - first;
    });

    for (const [year, items] of sortedYears) {
      const yearHeading = document.createElement("h3");
      yearHeading.className = "press-year";
      yearHeading.textContent = year;
      const yearList = document.createElement("ul");
      yearList.className = "press-year-list";
      yearList.append(...items);
      details.append(yearHeading, yearList);
      yearGroups.push({ heading: yearHeading, list: yearList });
    }

    archive.append(details);
    decadeGroups.push(details);
  }

  let hadQuery = false;
  const filterPress = () => {
    const query = queryInput.value.trim().toLocaleLowerCase();
    const clearingQuery = hadQuery && !query;
    let visibleCount = 0;

    for (const item of pressItems) {
      const matches = !query || item.textContent.toLocaleLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    for (const { heading, list } of yearGroups) {
      const hasMatch = [...list.children].some((item) => !item.hidden);
      heading.hidden = !hasMatch;
      list.hidden = !hasMatch;
    }

    for (const decade of decadeGroups) {
      const hasMatch = [...decade.querySelectorAll("li")].some((item) => !item.hidden);
      decade.hidden = !hasMatch;
      if (query && hasMatch) decade.open = true;
      if (clearingQuery) {
        decade.open = decade.querySelector("summary").textContent.startsWith("2020s");
      }
    }

    count.textContent = query
      ? `${visibleCount} of ${pressItems.length} entries`
      : `${pressItems.length} entries`;
    hadQuery = Boolean(query);
  };

  queryInput.addEventListener("input", filterPress);
  filterPress();
});