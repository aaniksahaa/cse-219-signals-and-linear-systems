/* ====================================================================
   Shared site chrome — ONE source of truth for the sidebar.
   Edit this file to change the brand, nav links, or footer on EVERY page.
   Each page just needs:  <aside class="sidebar" id="siteSidebar"></aside>
   and  <script src="assets/site.js" defer></script>
   ==================================================================== */
(function () {
  "use strict";

  // ---- edit me -------------------------------------------------------
  const SITE = {
    brand: {
      href: "index.html",
      code: "CSE 219",
      lines: ["Signals & Linear Systems", "CSE, BUET"],
    },
    // nav items: {href, icon, label} · {group:"Heading"} · {icon,label,soon:true}
    nav: [
      { href: "index.html", icon: "🏠", label: "Home" },
      { group: "Interactive Demos" },
      { href: "computing-convolution.html", icon: "📐", label: "Computing Convolutions" },
      { href: "listening-to-convolution.html", icon: "🎧", label: "Listening to Convolutions" },
      { icon: "🌀", label: "Fourier Series", soon: true },
    ],
    footer: "Anik Saha<br>aaniksahaa.2001@gmail.com",
  };
  // --------------------------------------------------------------------

  function currentPage() {
    let p = location.pathname.split("/").pop();
    return p ? p : "index.html";
  }

  function render() {
    const host = document.getElementById("siteSidebar");
    if (!host) return;
    const here = currentPage();

    const brand =
      `<a class="brand" href="${SITE.brand.href}">` +
      `<div class="code">${SITE.brand.code}</div>` +
      SITE.brand.lines.map((l) => `<div class="name">${l}</div>`).join("") +
      `</a>`;

    const items = SITE.nav
      .map((it) => {
        if (it.group) return `<div class="group">${it.group}</div>`;
        const ic = `<span class="ic">${it.icon || ""}</span>`;
        if (it.soon)
          return `<a class="disabled">${ic} ${it.label} <small>soon</small></a>`;
        const active = it.href === here ? " class=\"active\"" : "";
        return `<a href="${it.href}"${active}>${ic} ${it.label}</a>`;
      })
      .join("");

    host.innerHTML =
      brand +
      `<nav class="nav">${items}</nav>` +
      `<div class="side-foot">${SITE.footer}</div>`;
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", render);
  else render();
})();
