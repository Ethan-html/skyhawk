// ==============================
// Versioned assets (cache-busting)
// ==============================
const ASSET_VERSION = typeof window !== "undefined" && window.ASSET_VERSION ? window.ASSET_VERSION : "";
const withVersion = (url) =>
  ASSET_VERSION ? url + (url.includes("?") ? "&" : "?") + "v=" + ASSET_VERSION : url;

// ==============================
// Firebase (singleton) — config from config.js (window.SITE_CONFIG)
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = typeof window !== "undefined" && window.SITE_CONFIG?.firebase
  ? window.SITE_CONFIG.firebase
  : {};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

// ==============================
// DOM ready helper
// ==============================
function onReady(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

// ==============================
// Safe parallel loader
// ==============================
async function runParallel(tasks) {
  const results = await Promise.allSettled(tasks);
  results.forEach(r => {
    if (r.status === "rejected") console.warn("Init failed:", r.reason);
  });
}

// ==============================
// Google Analytics
// ==============================
// initGA.js
function initGA() {
  if (window.gtag) return;

  // Always create a safe no-op gtag first
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  const id = typeof window !== "undefined" && window.SITE_CONFIG?.measurementId;
  if (!id) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;

  script.onload = () => {
    gtag("js", new Date());
    gtag("config", id);
  };

  // If blocked or fails, do absolutely nothing
  script.onerror = () => {};

  document.head.appendChild(script);
}

// ==============================
// Universal asset loader (JS & CSS)
// ==============================
function loadAssets(urls) {
  const promises = urls.map((url) =>
    new Promise((resolve, reject) => {
      const path = url.split("?")[0];
      if (path.endsWith(".js")) {
        const s = document.createElement("script");
        s.src = url;
        s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      } else if (path.endsWith(".css")) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = url;
        l.onload = resolve;
        l.onerror = reject;
        document.head.appendChild(l);
      } else {
        console.warn("Unknown asset type:", url);
        resolve();
      }
    })
  );
  return Promise.allSettled(promises).then((results) => {
    results.forEach((r) => {
      if (r.status === "rejected") console.warn("Asset failed to load:", r.reason);
    });
  });
}

// ==============================
// Logout button helper
// ==============================
function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  const mobileLogoutIcon = document.querySelector(".mobile-logout-btn");

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (mobileLogoutIcon) {
    mobileLogoutIcon.addEventListener("click", handleLogout);
  }
}

// ==============================
// Share dropdown — delegated click (no inline onclick)
// ==============================
function initShareLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest?.(".nav-drop-list-link[data-share]");
    if (!link) return;
    e.preventDefault();
    const share = link.getAttribute("data-share");
    const url = encodeURIComponent(typeof location !== "undefined" ? location.origin : "");
    const title = encodeURIComponent(typeof window !== "undefined" && window.currentUnit?.name ? window.currentUnit.name : "Website");
    if (share === "email") {
      location.href = "mailto:?subject=" + title + "&body=" + url;
    } else if (share === "facebook") {
      window.open("https://www.facebook.com/sharer/sharer.php?u=" + url + "&t=" + title);
    } else if (share === "twitter") {
      window.open("https://twitter.com/intent/tweet?text=" + title + " " + (typeof location !== "undefined" ? location.origin : ""));
    } else if (share === "linkedin") {
      window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url + "&title=" + title);
    }
  });
}

// ==============================
// Canonical URL for /page and /memberpage
// ==============================
function setCanonicalIfNeeded() {
  const path = typeof location !== "undefined" ? location.pathname : "";
  if (path !== "/page" && path !== "/memberpage") return;
  const link = document.getElementById("canonical-link");
  if (link && location.href) link.setAttribute("href", location.href);
}

// ==============================
// Helper for loading sections
// ==============================
const loadSection = (loader, renderer) => async db => {
  const sectionId = (new URLSearchParams(location.search).get("page") || "").split("/")[0];
  return sectionId && loader(db, sectionId, renderer);
};

// ==============================
// Page configuration (built after loading versioned modules)
// ==============================
function buildPageConfigs(mods) {
  return [
    {
      match: path => path === "/" || path === "/index.html",
      modules: [mods.initHeaderFooter, mods.initMenu, mods.initSlideshow, mods.initContentBoxes],
      requiresAuth: false
    },
    {
      match: path => path.startsWith("/page"),
      modules: [mods.initHeaderFooter, mods.initMenu, loadSection(mods.loadPage, mods.renderPage)],
      requiresAuth: false
    },
    {
      match: path => path === "/member",
      modules: [mods.initHeaderFooter, mods.initMenu, mods.initMemberMenu, mods.initContentBoxes],
      requiresAuth: true,
      logout: true
    },
    {
      match: path => path.startsWith("/memberpage"),
      modules: [mods.initHeaderFooter, mods.initMenu, mods.initMemberMenu, loadSection(mods.loadMemberPage, mods.renderMemberPage)],
      requiresAuth: true,
      logout: true
    },
    {
      match: path => path.startsWith("/photos"),
      modules: [mods.initHeaderFooter],
      requiresAuth: true,
      logout: true
    },
    {
      match: path => path.startsWith("/login"),
      modules: [mods.initLogin],
      requiresAuth: false
    },
    {
      match: () => true,
      modules: [mods.initHeaderFooter, mods.initMenu],
      requiresAuth: false
    }
  ];
}

// ==============================
// Auth Gate
// ==============================
async function authGate(pageConfigs, callback) {
  const protectedPaths = pageConfigs.filter(p => p.requiresAuth).map(p => p.match);

  const isProtected = protectedPaths.some(fn => fn(location.pathname));
  if (isProtected) document.body.style.display = "none";

  return new Promise(resolve => {
    onAuthStateChanged(auth, async user => {
      if (isProtected && !user) {
        window.location.replace("/");
      } else {
        document.body.style.display = "block";
        if (callback) await callback();
        resolve();
      }
    });
  });
}

// ==============================
// Auto detect page and init
// ==============================
export async function initPage() {
  onReady(async () => {

    // ==============================
    // Load site modules with version (cache-busted)
    // ==============================
    const [
      menuMod,
      memberMenuMod,
      contentBoxesMod,
      slideshowMod,
      headerFooterMod,
      loadPageMod,
      loadMemberPageMod,
      loginMod,
      mobileMenuA11yMod
    ] = await Promise.all([
      import(/* @v */ withVersion("/assets/js/menu.js")),
      import(/* @v */ withVersion("/assets/js/member-menu.js")),
      import(/* @v */ withVersion("/assets/js/content-boxes.js")),
      import(/* @v */ withVersion("/assets/js/slideshow.js")),
      import(/* @v */ withVersion("/assets/js/header-footer.js")),
      import(/* @v */ withVersion("/assets/js/load-page.js")),
      import(/* @v */ withVersion("/assets/js/load-member-page.js")),
      import(/* @v */ withVersion("/assets/js/login.js")),
      import(/* @v */ withVersion("/assets/js/mobile-menu-a11y.js"))
    ]);

    const mods = {
      initMenu: menuMod.initMenu,
      initMemberMenu: memberMenuMod.initMemberMenu,
      initContentBoxes: contentBoxesMod.initContentBoxes,
      initSlideshow: slideshowMod.initSlideshow,
      initHeaderFooter: headerFooterMod.initHeaderFooter,
      loadPage: loadPageMod.loadPage,
      renderPage: loadPageMod.renderPage,
      loadMemberPage: loadMemberPageMod.loadMemberPage,
      renderMemberPage: loadMemberPageMod.renderMemberPage,
      initLogin: loginMod.initLogin,
      initMobileMenuA11y: mobileMenuA11yMod.initMobileMenuA11y
    };

    const pageConfigs = buildPageConfigs(mods);

    // ==============================
    // TIER 0 — Critical CSS (versioned for cache-busting)
    // ==============================
    await loadAssets([
      withVersion("/assets/stylesheets/main.css")
    ]);

    // Show page immediately
    document.body.style.display = "block";

    initShareLinks();
    setCanonicalIfNeeded();

    // ==============================
    // TIER 1 — jQuery dependency chain (non-blocking)
    // ==============================
    (async () => {
      await loadAssets([withVersion("/assets/js/jquery.min.js")]);
      await loadAssets([withVersion("/assets/js/jquery.cycle2-fef2f3645726cce4154911d6140d7d52.min.js")]);
    })();

    // ==============================
    // TIER 2 & 3 — Everything else (parallel)
    // ==============================
    loadAssets([
      withVersion("/assets/js/main-3e47b52a9c95aa9cd957b34befd0acf5.min.js"),
      withVersion("/assets/js/admin.js"),
      withVersion("/assets/easter/boot.js")
    ]);

    // ==============================
    // Analytics — idle only
    // ==============================
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initGA);
    } else {
      setTimeout(initGA, 3000);
    }

    // ==============================
    // Auth + page modules
    // ==============================
    authGate(pageConfigs, async () => {
      const path = location.pathname;
      const config = pageConfigs.find(c => c.match(path));
      if (!config) return;

      // Run page modules in parallel
      await runParallel(config.modules.map(fn => fn(db)));

      mods.initMobileMenuA11y();

      // Focus main content after login redirect (a11y)
      if (path === "/member" && sessionStorage.getItem("focusMainAfterRedirect") === "1") {
        sessionStorage.removeItem("focusMainAfterRedirect");
        requestAnimationFrame(() => {
          const main = document.getElementById("main-page-content");
          const skipLink = document.querySelector('a[href="#main-page-content"]');
          if (skipLink) skipLink.focus();
          else if (main) main.focus();
        });
      }

      // Logout button
      if (config.requiresAuth && config.logout) {
        initLogout();
      }
    });

  });
}


