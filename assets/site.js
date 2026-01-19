(() => {
  const mdPath = document.body.getAttribute("data-md");
  if (!mdPath) {
    return;
  }

  const content = document.getElementById("content");
  const status = document.getElementById("status");
  const toc = document.getElementById("toc");
  const tocStatus = document.getElementById("toc-status");
  const docTitle = document.querySelector("[data-doc-title]");

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  if (!content) {
    return;
  }

  if (!window.marked) {
    setStatus("Markdown renderer unavailable.");
    return;
  }

  marked.setOptions({
    mangle: false,
    headerIds: true
  });

  fetch(mdPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load markdown.");
      }
      return response.text();
    })
    .then((text) => {
      content.innerHTML = marked.parse(text);
      if (status) {
        status.remove();
      }
      syncTitle(content, docTitle);
      enhanceLinks(content);
      buildToc(content, toc, tocStatus);
    })
    .catch(() => {
      setStatus("Could not load the document.");
      if (tocStatus) {
        tocStatus.textContent = "Contents unavailable.";
      }
    });

  function enhanceLinks(root) {
    const links = root.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      if (href.startsWith("http://") || href.startsWith("https://")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
    });
  }

  function syncTitle(root, titleTarget) {
    if (!titleTarget) {
      return;
    }
    const heading = root.querySelector("h1");
    if (heading && heading.textContent) {
      titleTarget.textContent = heading.textContent;
      heading.remove();
    }
  }

  function buildToc(root, tocRoot, statusEl) {
    if (!tocRoot) {
      return;
    }
    const headings = root.querySelectorAll("h2, h3");
    if (!headings.length) {
      if (statusEl) {
        statusEl.textContent = "No sections available.";
      }
      return;
    }
    const list = document.createElement("ul");
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent);
      }
      const item = document.createElement("li");
      if (heading.tagName === "H3") {
        item.classList.add("sub");
      }
      const anchor = document.createElement("a");
      anchor.href = "#" + heading.id;
      anchor.textContent = heading.textContent;
      item.appendChild(anchor);
      list.appendChild(item);
    });
    tocRoot.innerHTML = "";
    tocRoot.appendChild(list);
    if (statusEl) {
      statusEl.remove();
    }
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
})();