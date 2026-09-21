document.addEventListener("DOMContentLoaded", () => {
  const headings = [...document.querySelectorAll("main h2, main h3")];
  const heading = (label) => headings.find((item) => item.textContent.trim().toLowerCase() === label);
  const chairingList = heading("conference chairing")?.nextElementSibling;
  const committeeList = heading("program committees")?.nextElementSibling;
  const historicalHeading = heading("before 2015");
  const historicalList = historicalHeading?.nextElementSibling;

  chairingList?.classList.add("service-list");
  committeeList?.classList.add("service-list");

  if (historicalHeading && historicalList?.tagName === "UL") {
    const details = document.createElement("details");
    details.className = "historical-service";
    const summary = document.createElement("summary");
    summary.textContent = historicalHeading.textContent;
    historicalList.classList.add("service-list");
    historicalHeading.replaceWith(details);
    details.append(summary, historicalList);
  }
});