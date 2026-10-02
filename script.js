(() => {
  document.documentElement.classList.add("js");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

  function closeMenu(returnFocus = false) {
    nav?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (returnFocus) menuButton?.focus();
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(isOpen));
    nav?.classList.toggle("is-open", isOpen);
  });
  navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", () => closeMenu());

  // Update the section indicator without changing the URL during scrolling.
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  let scheduled = false;
  const updateCurrentSection = () => {
    let current = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 155) current = `#${section.id}`;
    });
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scheduled = false;
  };
  window.addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateCurrentSection);
    }
  }, { passive: true });
  window.addEventListener("resize", updateCurrentSection);
  updateCurrentSection();

  // A small, keyboard-accessible field notebook explains the three capabilities.
  const capabilityTabs = [...document.querySelectorAll('.study-tabs [role="tab"]')];
  function activateCapability(tab) {
    capabilityTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
  }
  capabilityTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateCapability(tab));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % capabilityTabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + capabilityTabs.length) % capabilityTabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = capabilityTabs.length - 1;
      else return;
      event.preventDefault();
      activateCapability(capabilityTabs[next]);
      capabilityTabs[next].focus();
    });
  });

  const copyButton = document.getElementById("copy-bibtex");
  const bibtex = document.getElementById("bibtex");
  const status = document.getElementById("copy-status");
  let resetCopy;
  copyButton?.addEventListener("click", async () => {
    window.clearTimeout(resetCopy);
    try {
      await navigator.clipboard.writeText(bibtex.textContent || "");
      copyButton.textContent = "Copied!";
      copyButton.classList.add("is-copied");
      status.textContent = "BibTeX citation copied to clipboard.";
      resetCopy = window.setTimeout(() => {
        copyButton.textContent = "Copy citation";
        copyButton.classList.remove("is-copied");
        status.textContent = "";
      }, 2200);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(bibtex);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      copyButton.textContent = "Text selected";
      status.textContent = "Automatic copy is unavailable. The citation is selected; use your device's copy command.";
    }
  });
})();
