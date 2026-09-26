const markdownItContainer = require("markdown-it-container");

const CONTAINERS = {
  "home-intro": { tag: "section", className: "home-intro" },
  "home-research": { tag: "section", className: "home-section home-research-section" },
  "home-profile": { tag: "section", className: "home-section home-profile" },
  "home-profile-main": { tag: "div", className: "home-profile__main" },
  "home-recognition": { tag: "div", className: "home-recognition" },
  "home-credentials": { tag: "section", className: "home-section home-credentials" },
  "home-standard": { tag: "section", className: "home-section home-standard" },
};

function expandHomepageSections(source) {
  const lines = source.split("\n");
  const output = [];
  let current;

  function closeCurrent() {
    if (!current) {
      return;
    }
    output.push(":::");
    if (current === "home-profile-main" || current === "home-recognition") {
      output.push("::::");
    }
    current = undefined;
  }

  for (const line of lines) {
    const section = line.match(
      /^::: section(?: +(hero|cards|split|links))?(?: +columns=(\d+))?\s*$/,
    );
    const aside = line.match(/^::: aside(?: +list)?\s*$/);

    if (line.trim() === "[[featured-book]]") {
      closeCurrent();
      output.push(line);
      continue;
    }

    if (aside) {
      if (current !== "home-profile-main") {
        throw new Error("A homepage aside must follow a split section");
      }
      output.push(":::", "::: home-recognition");
      current = "home-recognition";
      continue;
    }

    if (!section) {
      output.push(line);
      continue;
    }

    closeCurrent();
    const [, variant = "standard", columns] = section;
    if (variant === "split") {
      output.push(":::: home-profile", "::: home-profile-main");
      current = "home-profile-main";
    } else {
      const name = {
        hero: "home-intro",
        cards: "home-research",
        links: "home-credentials",
        standard: "home-standard",
      }[variant];
      const options = variant === "cards" && columns ? ` columns=${columns}` : "";
      output.push(`::: ${name}${options}`);
      current = name;
    }
  }

  closeCurrent();
  return output.join("\n");
}

function addHomepageContainers(md) {
  md.core.ruler.before("block", "homepage_sections", (state) => {
    state.src = expandHomepageSections(state.src);
  });

  for (const [name, { tag, className }] of Object.entries(CONTAINERS)) {
    md.use(markdownItContainer, name, {
      render(tokens, index) {
        if (tokens[index].nesting !== 1) {
          return `</${tag}>\n`;
        }
        const columns = tokens[index].info.match(/\bcolumns=(\d+)\b/)?.[1];
        const style = columns ? ` style="--home-columns: ${columns}"` : "";
        return `<${tag} class="${className}"${style}>\n`;
      },
    });
  }
}

module.exports = {
  addHomepageContainers,
  _test: { expandHomepageSections },
};
