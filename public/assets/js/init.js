// ==============================
// Page configuration
// ==============================
const pageConfigs = [
  {
    match: path => path === "/" || path === "/index.html",
    modules: [initMenu, initHeaderFooter, initSlideshow, initContentBoxes],
    requiresAuth: false
  },
  {
    match: path => path.startsWith("/page"),
    modules: [initMenu, initHeaderFooter, loadSection(loadPage, renderPage)],
    requiresAuth: false
  },
  {
    match: path => path === "/member",
    modules: [initMenu, initMemberMenu, initContentBoxes, initHeaderFooter],
    requiresAuth: true,
    logout: true
  },
  {
    match: path => path.startsWith("/memberpage"),
    modules: [initMenu, initMemberMenu, initHeaderFooter, loadSection(loadMemberPage, renderMemberPage)],
    requiresAuth: true,
    logout: true
  },
  {
    match: path => path.startsWith("/photos"),
    modules: [initHeaderFooter],
    requiresAuth: true,
    logout: true
  },
  {
    match: () => true, // fallback 404 or unknown pages
    modules: [initMenu, initHeaderFooter],
    requiresAuth: false
  }
];
// ==============================
// CSS & JS FIles
// ==============================
const assets = [
  "/assets/js/copywrite.js",
  "/assets/js/admin.js",
  "/assets/easter/boot.js",
  "/assets/js/main-3e47b52a9c95aa9cd957b34befd0acf5.min.js",
  "/assets/stylesheets/main.css"
];








// ==============================
// Firebase (singleton)
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ==============================
// Site modules
// ==============================
import { initMenu } from "/assets/js/menu.js";
import { initMemberMenu } from "/assets/js/member-menu.js";
import { initContentBoxes } from "/assets/js/content-boxes.js";
import { initSlideshow } from "/assets/js/slideshow.js";
import { initHeaderFooter } from "/assets/js/header-footer.js";
import { loadPage, renderPage } from "/assets/js/load-page.js";
import { loadMemberPage, renderMemberPage } from "/assets/js/load-member-page.js";

// ==============================
// Firebase config
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyBk_ikYB1PzkgHx4zJY73pe3EfzQRpZvqw",
  authDomain: "skyhawk-web.firebaseapp.com",
  projectId: "skyhawk-web",
  storageBucket: "skyhawk-web.firebasestorage.app",
  messagingSenderId: "340655139001",
  appId: "1:340655139001:web:7923a1fe83ac4a4c689368",
  measurementId: "G-M2RSE2BRK2"
};

// ==============================
// Init Firebase
// ==============================
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
function initGA() {
  if (window.gtag) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-M2RSE2BRK2";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-M2RSE2BRK2');
}
// ==============================
// Universal asset loader (JS & CSS)
// ==============================
function loadAssets(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      if (url.endsWith(".js")) {
        const s = document.createElement("script");
        s.src = url;
        s.defer = true;           // execute after DOM parses
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      } else if (url.endsWith(".css")) {
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
    });
  });

  return Promise.allSettled(promises).then(results => {
    results.forEach(r => {
      if (r.status === "rejected") console.warn("Asset failed to load:", r.reason);
    });
  });
}

// ==============================
// Logout button helper
// ==============================
function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await signOut(auth); window.location.replace("/"); }
      catch (err) { console.error("Logout failed:", err); }
    });
  }
}

// ==============================
// Helper for loading sections
// ==============================
const loadSection = (loader, renderer) => async db => {
  const sectionId = (new URLSearchParams(location.search).get("page") || "").split("/")[0];
  return sectionId && loader(db, sectionId, renderer);
};

// ==============================
// Auth Gate
// ==============================
async function authGate(callback) {
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
    // Wait for all assets to load
    await loadAssets(assets);

    // Initialize Google Analytics
    initGA();

    // Run auth gate and page modules
    await authGate(async () => {
      const path = location.pathname;
      const config = pageConfigs.find(c => c.match(path));

      if (!config) return;

      // Run all modules in parallel
      await runParallel(config.modules.map(fn => fn(db)));

      // Init logout if needed
      if (config.requiresAuth && config.logout) initLogout();
    });
  });
}

