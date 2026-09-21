document.addEventListener("DOMContentLoaded", () => {
  const archiveHeading = document.querySelector("#talks-by-setting");
  const queryInput = document.querySelector("#talks-query");
  const count = document.querySelector("#talks-count");

  if (!archiveHeading || !queryInput || !count) return;

  const categoryHeadings = [];
  let sibling = archiveHeading.nextElementSibling;
  while (sibling) {
    if (sibling.tagName === "H3") categoryHeadings.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  for (const heading of categoryHeadings) {
    const details = document.createElement("details");
    details.className = "talks-archive-group";
    details.id = heading.id;

    const summary = document.createElement("summary");
    summary.textContent = heading.textContent;
    const content = document.createElement("div");
    content.className = "talks-archive-content";

    heading.before(details);
    let node = heading.nextSibling;
    heading.remove();
    while (
      node &&
      !(
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName === "H2" || node.tagName === "H3")
      )
    ) {
      const next = node.nextSibling;
      content.append(node);
      node = next;
    }

    details.append(summary, content);
  }

  const talkItems = [...document.querySelectorAll("main li")];
  const recentYears = [...document.querySelectorAll('h3[id^="talks-"]')].map(
    (heading) => ({ heading, list: heading.nextElementSibling })
  );
  const archiveGroups = [...document.querySelectorAll(".talks-archive-group")];

  for (const group of archiveGroups) {
    const categorySummary = group.querySelector(":scope > summary");
    const categoryCount = group.querySelectorAll("li").length;
    categorySummary.textContent = `${categorySummary.textContent} (${categoryCount})`;
  }

  for (const link of document.querySelectorAll('.talks-jump a[href^="#"]')) {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.hash);
      if (target?.classList.contains("talks-archive-group")) target.open = true;
    });
  }

  const hashTarget = window.location.hash
    ? document.querySelector(window.location.hash)
    : null;
  if (hashTarget?.classList.contains("talks-archive-group")) hashTarget.open = true;

  const decadeGroups = [...document.querySelectorAll(".talks-decade")];
  let hadQuery = false;

  const filterTalks = () => {
    const query = queryInput.value.trim().toLocaleLowerCase();
    const isClearingQuery = hadQuery && !query;
    let visibleCount = 0;

    for (const item of talkItems) {
      const matches = !query || item.textContent.toLocaleLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    for (const { heading, list } of recentYears) {
      if (!heading || !list) continue;
      const hasMatch = [...list.children].some((item) => !item.hidden);
      heading.hidden = !hasMatch;
      list.hidden = !hasMatch;
    }

    for (const group of archiveGroups) {
      const hasMatch = [...group.querySelectorAll("li")].some((item) => !item.hidden);
      group.hidden = !hasMatch;
      if (query && hasMatch) group.open = true;
      if (isClearingQuery) group.open = group === hashTarget;
    }

    for (const decade of decadeGroups) {
      const hasMatch = [...decade.querySelectorAll("li")].some((item) => !item.hidden);
      decade.hidden = !hasMatch;
      if (query && hasMatch) decade.open = true;
      if (isClearingQuery) decade.open = false;
    }

    count.textContent = query
      ? `${visibleCount} of ${talkItems.length} talks`
      : `${talkItems.length} talks`;
    hadQuery = Boolean(query);
  };

  queryInput.addEventListener("input", filterTalks);
  filterTalks();
});