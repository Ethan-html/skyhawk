import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CACHE_KEY = "menuPagesMember";

function sortByOptionalOrderId(items) {
  return items.sort((a, b) => (Number(a.orderid) || 9999) - (Number(b.orderid) || 9999));
}

function createChevron() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "currentColor");
  svg.classList.add("ml-2", "h-4", "w-4", "transition-transform");
  svg.innerHTML =
    '<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>';
  return svg;
}

async function fetchMenuFromFirebase(db) {
  try {
    const pagesCol = collection(db, "member", "menu", "pages");
    const pagesSnap = await getDocs(pagesCol);
    const pages = await Promise.all(
      pagesSnap.docs.map(async (doc) => {
        const childrenSnap = await getDocs(collection(doc.ref, "children"));
        return { page: doc.data(), children: childrenSnap.docs.map((d) => d.data()) };
      })
    );
    if (pages.length) localStorage.setItem(CACHE_KEY, JSON.stringify(pages));
    return pages;
  } catch (err) {
    console.warn("Menu fetch failed:", err);
    return [];
  }
}

function buildDesktopMenu(menuData) {
  const container = document.getElementById("desktopMenu");
  if (!container) return;
  container.replaceChildren();

  menuData.forEach((item) => {
    const li = document.createElement("li");
    li.className = "relative flex h-full items-stretch";

    const hasChildren = item.children?.length > 0;
    const trigger = document.createElement(hasChildren ? "button" : "a");
    trigger.className =
      "flex h-full items-center border-t-2 border-transparent px-6 text-lg font-semibold uppercase tracking-wide text-white/95 hover:border-accent hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/70 max-[1250px]:px-4 max-[1250px]:text-base max-[1165px]:px-3 max-[1165px]:text-sm max-[840px]:px-2 max-[840px]:text-xs";
    trigger.textContent = item.page.title || "Untitled";

    if (!hasChildren) {
      trigger.href = item.page.url || "#";
    } else {
      trigger.type = "button";
      trigger.setAttribute("aria-expanded", "false");
      trigger.appendChild(createChevron());
    }

    li.appendChild(trigger);

    if (hasChildren) {
      const submenu = document.createElement("div");
      submenu.className =
        "pointer-events-none absolute left-0 top-full min-w-full w-max translate-y-[5px] opacity-0 transition-all duration-150";

      const inner = document.createElement("div");
      inner.className =
        "overflow-hidden rounded-b-xl border border-white/10 bg-slate-900/95 text-sm backdrop-blur-sm";

      const ul = document.createElement("ul");
      sortByOptionalOrderId(item.children).forEach((child) => {
        const childLi = document.createElement("li");
        const a = document.createElement("a");
        a.href = child.url || "#";
        a.textContent = child.title || "—";
        a.className = "block px-6 py-3 text-white/90 transition-colors hover:bg-white/10 hover:text-white";
        childLi.appendChild(a);
        ul.appendChild(childLi);
      });

      inner.appendChild(ul);
      submenu.appendChild(inner);
      li.appendChild(submenu);

      let timeout;
      li.addEventListener("mouseenter", () => {
        clearTimeout(timeout);
        document.querySelectorAll("#desktopMenu [aria-expanded='true']").forEach((btn) => {
          if (btn === trigger) return;
          btn.setAttribute("aria-expanded", "false");
          const parent = btn.closest("li");
          const otherMenu = parent?.querySelector("div");
          if (otherMenu) {
            otherMenu.style.opacity = "0";
            otherMenu.style.pointerEvents = "none";
            otherMenu.style.transform = "translateY(5px)";
          }
        });

        submenu.style.opacity = "1";
        submenu.style.pointerEvents = "auto";
        submenu.style.transform = "translateY(0)";
        trigger.setAttribute("aria-expanded", "true");
      });

      li.addEventListener("mouseleave", () => {
        timeout = setTimeout(() => {
          submenu.style.opacity = "0";
          submenu.style.pointerEvents = "none";
          submenu.style.transform = "translateY(5px)";
          trigger.setAttribute("aria-expanded", "false");
        }, 150);
      });
    }

    container.appendChild(li);
  });
}

function buildMobileMenu(menuData) {
  const root = document.getElementById("mobilePanelRoot");
  if (!root) return;

  root.innerHTML = "";

  // MAIN CONTAINER (matches mm-menu structure)
  const nav = document.createElement("nav");
  nav.className = "w-full h-full overflow-hidden bg-[#1e3a8a]";

  const panelsContainer = document.createElement("div");
  panelsContainer.className = "relative w-full h-full";

  nav.appendChild(panelsContainer);
  root.appendChild(nav);

  const panelStack = [];

  function renderPanel(items, title = "Home", parent = null) {
    const panel = document.createElement("div");
    panel.className =
      "absolute inset-0 w-full h-full bg-[#0E3C9C] transition-transform duration-300 ease-out";

    // Position panels side-by-side
    panel.style.transform = `translateX(${panelStack.length * 100}%)`;

    // ===== NAVBAR (TOP BAR) =====
    const navbar = document.createElement("div");


    if (parent) {
  // Navbar styling - clickable entire area
  navbar.className =
    "flex items-center h-14 px-4 bg-[#0C3385] border-b border-white/10 cursor-pointer relative";

  // Back arrow (thin gray) using borders
  const backArrow = document.createElement("div");
  backArrow.className =
    "w-3 h-3 border-l-2 border-b-2 border-white/50 rotate-45 mr-3"; 
  // w-3,h-3 = 12px square, thin borders, rotated 45deg, margin-right for spacing

  // Title text
  const titleEl = document.createElement("div");
  titleEl.className = "text-white font-semibold text-lg uppercase"; // slightly bigger text
  titleEl.textContent = title;

  navbar.appendChild(backArrow);
  navbar.appendChild(titleEl);

  // Make the entire navbar clickable
  navbar.onclick = () => {
    const lastPanel = panelStack.pop();
    if (lastPanel) lastPanel.remove();
    updatePanels();
  };
} else {
      // Root panel (no parent)
      const homeBtn = document.createElement("div");
      homeBtn.className = "flex items-center justify-between w-full bg-[#0A2D75] h-14 border-b-2 border-white/20";

      // Left side (accent + text)
      const leftSide = document.createElement("div");
      leftSide.className = "flex items-center h-full cursor-pointer";

      // Red accent bar
      const accent = document.createElement("span");
      accent.className = "w-2 h-full bg-[#BA0C2F]";

      // HOME text
      const homeText = document.createElement("span");
      homeText.className =
        "pl-4 text-lg font-normal leading-[1.375rem] uppercase text-white";
      homeText.textContent = "HOME";

      leftSide.appendChild(accent);
      leftSide.appendChild(homeText);

      leftSide.onclick = () => {
        window.location.href = "/member";
      };

      // X close button (right side)
      const closeBtn = document.createElement("button");
      closeBtn.className =
        "text-white text-xl font-bold px-4 h-full flex items-center";
      closeBtn.textContent = "×";
      closeBtn.onclick = () => {
        window.closeMobile();
      };

      homeBtn.appendChild(leftSide);
      homeBtn.appendChild(closeBtn);

      navbar.appendChild(homeBtn);
    }

    panel.appendChild(navbar);

    // ===== LIST =====
    const ul = document.createElement("ul");
    ul.className = "flex flex-col";

    items.forEach(({ page, children }) => {
  const li = document.createElement("li");

  const btn = document.createElement("button");
  btn.className =
    "flex items-center justify-between w-full border-b-2 border-white/20 hover:bg-[#0E3A9C] uppercase";

  // Text wrapper with padding
  const textWrapper = document.createElement("span");
  textWrapper.className = "px-5 py-3 text-white text-lg font-semibold";
  textWrapper.textContent = page.title || "—";
  btn.appendChild(textWrapper);

  if (children?.length) {
    const arrow = document.createElement("div");
    arrow.className = `
      flex items-center justify-center 
      border-l-2 border-r-2 border-white/20 bg-[#0C3385] 
      w-14 h-14
    `; 
    // Only left/right borders, matches menu item border color
    arrow.innerHTML = `<div class="w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div>`;

    btn.appendChild(arrow);

        btn.onclick = () => {
          const newPanel = renderPanel(
            children.map((c) => ({ page: c })),
            page.title,
            panel
          );

          panelStack.push(newPanel);
          panelsContainer.appendChild(newPanel);

          // Force reflow so the transition works
          newPanel.getBoundingClientRect();

          // Trigger slide-in
          newPanel.style.transform = `translateX(${(panelStack.length - 1) * 100}%)`;

          updatePanels();
        };
      } else {
        btn.onclick = () => {
          window.location.href = page.url || "#";
        };
      }

      li.appendChild(btn);
      ul.appendChild(li);
    });

    panel.appendChild(ul);
    return panel;
  }

  function updatePanels() {
    panelStack.forEach((panel, index) => {
      panel.style.transform = `translateX(${(index - (panelStack.length - 1)) * 100}%)`;
    });
  }

  // INIT ROOT PANEL
  const rootPanel = renderPanel(menuData);
  panelStack.push(rootPanel);
  panelsContainer.appendChild(rootPanel);
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("mobileBackdrop");
  if (!toggleBtn || !drawer || !backdrop) return;

  window.openMobile = () => {
    drawer.classList.remove("-translate-x-full");
    backdrop.classList.remove("hidden");
    document.body.classList.add("mobile-menu-open");
    document.body.style.overflow = "hidden";
  };

  window.closeMobile = () => {
    document.body.style.overflow = "";
    drawer.classList.add("-translate-x-full");
    backdrop.classList.add("hidden");
    document.body.classList.remove("mobile-menu-open");
  };

  toggleBtn.addEventListener("click", () => {
    if (drawer.classList.contains("-translate-x-full")) openMobile();
    else closeMobile();
  });
  backdrop.addEventListener("click", closeMobile);
}

export async function initMemberPageMenu(db) {
  if (!document.getElementById("desktopMenu") && !document.getElementById("mobilePanelRoot")) return;

  const cachedRaw = localStorage.getItem(CACHE_KEY);
  let cachedData = null;
  if (cachedRaw) {
    try {
      cachedData = JSON.parse(cachedRaw);
    } catch (err) {
      console.warn("Failed to parse member menu cache:", err);
    }
  }
  const menuData = cachedData?.length ? cachedData : await fetchMenuFromFirebase(db);
  if (!menuData?.length) return;

  buildDesktopMenu(menuData);
  buildMobileMenu(menuData);
  initMobileDrawer();
}
