const markdownItContainer = require("markdown-it-container");

const CONTAINERS = {
  "home-intro": { tag: "section", className: "home-intro" },
  "home-research": { tag: "section", className: "home-section home-research-section" },
  "home-profile": { tag: "section", className: "home-section home-profile" },
  "home-profile-main": { tag: "div", className: "home-profile__main" },
  "home-recognition": { tag: "div", className: "home-recognition" },
  "home-credentials": { tag: "section", className: "home-section home-credentials" },
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
    const marker = line.match(/^::: (home-intro|home-research|home-profile|home-recognition|home-credentials)\s*$/);

    if (line.trim() === "[[featured-book]]") {
      closeCurrent();
      output.push(line);
      continue;
    }

    if (!marker) {
      output.push(line);
      continue;
    }

    const name = marker[1];
    if (name === "home-recognition") {
      if (current !== "home-profile-main") {
        throw new Error("home-recognition must follow home-profile");
      }
      output.push(":::", "::: home-recognition");
      current = name;
      continue;
    }

    closeCurrent();
    if (name === "home-profile") {
      output.push(":::: home-profile", "::: home-profile-main");
      current = "home-profile-main";
    } else {
      output.push(`::: ${name}`);
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
        return tokens[index].nesting === 1
          ? `<${tag} class="${className}">\n`
          : `</${tag}>\n`;
      },
    });
  }
}

module.exports = {
  addHomepageContainers,
  _test: { expandHomepageSections },
};
