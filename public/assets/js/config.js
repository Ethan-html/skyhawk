/*
 * Single config file for static hosting (no env vars).
 * Edit this file for asset version, Firebase project, and analytics.
 */

// --- Asset version (cache-busting) ---
// Bump on deploy. Format: MAJOR.MINOR.PATCH
// MAJOR = breaking; MINOR = new features; PATCH = fixes only
window.ASSET_VERSION = "2.2.0";

// --- Firebase & site ---
// Change when switching projects or when credentials rotate.
window.SITE_CONFIG = {
  firebase: {
    apiKey: "AIzaSyBk_ikYB1PzkgHx4zJY73pe3EfzQRpZvqw",
    authDomain: "skyhawk-web.firebaseapp.com",
    projectId: "skyhawk-web",
    storageBucket: "skyhawk-web.firebasestorage.app",
    messagingSenderId: "340655139001",
    appId: "1:340655139001:web:7923a1fe83ac4a4c689368",
    measurementId: "G-M2RSE2BRK2"
  },
  /** Google Analytics / gtag ID (optional; leave empty to disable) */
  measurementId: "G-M2RSE2BRK2",

  /** GitHub repo for photos page and homepage slideshow (https://github.com/Ethan-html/skyhawk-photos) */
  github: {
    owner: "Ethan-html",
    repo: "skyhawk-photos",
    branch: "main",
    /** Folder inside the repo that contains slideshow.json and slide images */
    slideshowFolder: "slideshow photos"
  }
};
