function renderPageFromQuery(data) {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "";

  const [sectionId, childSlug] = page.split("/");

  const section = data.find(s => s.id === sectionId);
  if (!section) {
    document.getElementById("pageTitle").textContent = "Page not found";
    return;
  }

  const activePage =
    section.children.find(c => c.slug === childSlug) ||
    section.children[0];

  /* ---------- SIDE NAV ---------- */

  const sideTitle = document.getElementById("sideNavTitleLink");
  const sideList = document.getElementById("sideNavList");

  sideTitle.textContent = section.title;
  sideTitle.href = `/page?page=${section.id}`;
  sideList.innerHTML = "";

  section.children.forEach(child => {
    const li = document.createElement("li");
    li.className = "left-nav-list-item";

    const a = document.createElement("a");
    a.className = "left-nav-list-link";
    a.href = `/page?page=${section.id}/${child.slug}`;
    a.textContent = child.title;

    if (child.slug === activePage.slug) {
      a.classList.add("selected");
    }

    const divider = document.createElement("div");
    divider.className = "left-nav-divider";

    li.appendChild(a);
    li.appendChild(divider);
    sideList.appendChild(li);
  });

  /* ---------- BREADCRUMBS ---------- */

  const crumbs = document.getElementById("breadcrumbList");
  crumbs.innerHTML = "";

  [
    { title: "Home", url: "/" },
    { title: section.title, url: `/page?page=${section.id}` },
    {
      title: activePage.title,
      url: `/page?page=${section.id}/${activePage.slug}`
    }
  ].forEach(c => {
    const li = document.createElement("li");
    li.className = "breadcrumb-list-item";

    const a = document.createElement("a");
    a.className = "breadcrumb-link link";
    a.href = c.url;
    a.textContent = c.title;

    const div = document.createElement("div");
    div.className = "breadcrumb-divider";
    div.textContent = "/";

    li.appendChild(a);
    li.appendChild(div);
    crumbs.appendChild(li);
  });

  /* ---------- TITLE & CONTENT ---------- */

  document.getElementById("pageTitle").textContent = activePage.title;

  if (activePage.externalUrl) {
    // Option 1: redirect immediately
    window.location.href = activePage.externalUrl;

    // Option 2: show a message and a link instead of redirect
    // document.getElementById("pageContent").innerHTML = `
    //   <p>This page redirects to: 
    //     <a href="${activePage.externalUrl}" target="_blank">${activePage.title}</a>
    //   </p>
    // `;
  } else {
    // Normal content page
    document.getElementById("pageContent").innerHTML = activePage.content;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  renderPageFromQuery(siteData);
});
