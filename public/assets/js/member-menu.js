// /assets/js/member-menu.js

const CACHE_KEY = "menuPagesMember";

// --------------------
// Render menu (desktop & mobile)
// --------------------
function buildMenu(pagesWithChildren, menuRoot) {
  menuRoot.replaceChildren();
  const fragment = document.createDocumentFragment();

  pagesWithChildren.forEach(({ page, children }) => {
    const li = document.createElement("li");
    li.className = "main-li";
    li.id = `menu-item-${page.id || page.title}`;

    const a = document.createElement("a");
    a.href = page.url || "#";
    a.textContent = page.title;
    a.target = "_self";
    a.className = "main-nav-link";
    li.appendChild(a);

    if (children?.length) {
      li.classList.add("has-dropdown");
      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-container";

      const ul = document.createElement("ul");
      ul.className = "dropdown-list";
      const orderedChildren = sortByOptionalOrderId([...children]);
      orderedChildren.forEach((child) => {
        const cli = document.createElement("li");
        const ca = document.createElement("a");
        ca.href = child.url || "#";
        ca.textContent = child.title;
        ca.target = "_self";
        cli.appendChild(ca);
        ul.appendChild(cli);
      });

      dropdown.appendChild(ul);
      li.appendChild(dropdown);
    }

    fragment.appendChild(li);
  });

  menuRoot.appendChild(fragment);
}

function ensureDesktopHoverHandlers(menuRoot) {
  if (menuRoot.dataset.memberMenuHoverHandlers === "1") return;
  menuRoot.dataset.memberMenuHoverHandlers = "1";
  menuRoot.addEventListener(
    "mouseenter",
    (e) => {
      const li = e.target.closest(".main-li.has-dropdown");
      if (li) li.classList.add("open");
    },
    true
  );
  menuRoot.addEventListener(
    "mouseleave",
    (e) => {
      const li = e.target.closest(".main-li.has-dropdown");
      if (li && !li.contains(e.relatedTarget)) li.classList.remove("open");
    },
    true
  );
}

function buildMobileMenu(pagesWithChildren, root) {
  root.innerHTML = ""; // always clear first

  const fragment = document.createDocumentFragment();

  const homeLi = document.createElement("li");
  homeLi.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
  homeLi.className = "active mm-listitem mm-listitem_selected";

  const homeA = document.createElement("a");
  homeA.className = "nav-link w-nav-link w--current";
  homeA.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
  homeA.href = "/member";
  homeA.textContent = "Home";

  homeLi.appendChild(homeA);
  fragment.appendChild(homeLi);

  pagesWithChildren.forEach(({ page, children }) => {
    const li = document.createElement("li");
    li.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");

    const a = document.createElement("a");
    a.className = "nav-link w-nav-link";
    a.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
    a.href = page.url || "#";
    a.textContent = page.title;
    li.appendChild(a);

    if (children?.length) {
      const ul = document.createElement("ul");
      const orderedChildren = sortByOptionalOrderId([...children]);
      orderedChildren.forEach((child) => {
        const cli = document.createElement("li");
        cli.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");

        const ca = document.createElement("a");
        ca.className = "nav-link w-nav-link";
        ca.setAttribute("data-breakpoints", "xs,sm,md,lg,xl");
        ca.href = child.url || "#";
        ca.textContent = child.title;

        cli.appendChild(ca);
        ul.appendChild(cli);
      });
      li.appendChild(ul);
    }

    fragment.appendChild(li);
  });

  root.appendChild(fragment);
}

function sortByOptionalOrderId(items) {
  return items.sort((a, b) => {
    const aHas = a.orderid !== undefined && a.orderid !== "";
    const bHas = b.orderid !== undefined && b.orderid !== "";

    if (aHas && bHas) {
      const aNum = Number(a.orderid);
      const bNum = Number(b.orderid);

      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
      }
      return 0; // same number → keep Firestore order
    }

    if (aHas && !bHas) return -1; // a first
    if (!aHas && bHas) return 1; // b first

    return 0; // neither has orderid → keep Firestore order
  });
}

export async function initMemberMenu(_db) {
  const desktopRoot = document.getElementById("member-menu");
  const mobileRoot = document.getElementById("mobile-menu-root");
  if (!desktopRoot && !mobileRoot) return;

  // Render from cache (populated by init.js)
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (!cachedRaw) return;

  try {
    const menuData = JSON.parse(cachedRaw);
    if (desktopRoot) {
      buildMenu(menuData, desktopRoot);
      ensureDesktopHoverHandlers(desktopRoot);
    }
    if (mobileRoot) buildMobileMenu(menuData, mobileRoot);
  } catch (err) {
    console.warn("Failed to parse member menu cache:", err);
  }
}
