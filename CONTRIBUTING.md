# Contributing to Skyhawk Squadron Website

Thanks for your interest in contributing. This project is a static site on Firebase Hosting with Firestore and Auth.

## Local setup

### Prerequisites

- A modern browser
- **Node.js** (optional but recommended for running a local server and Firebase tooling)
- **Firebase CLI** (optional, for emulators and deploy):
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

### 1. Clone and open the repo

```bash
git clone https://github.com/<org>/skyhawk.git
cd skyhawk
```

### 2. Configuration (single file for static hosting)

There are no real environment variables at runtime. Edit **`public/assets/js/config.js`** for:

- **`window.ASSET_VERSION`** — Bump on deploy for cache-busting.
- **`window.SITE_CONFIG.firebase`** — Firebase project (apiKey, projectId, etc.). Change when switching projects or when credentials rotate.
- **`window.SITE_CONFIG.measurementId`** — Optional Google Analytics ID.

### 3. Run locally (no Firebase emulator)

Serve the `public` folder with any static server:

```bash
# From repo root
npx serve public
```

Then open `http://localhost:3000` (or the port shown). The site will use the Firebase project defined in `config.js` (live Firestore and Auth).

### 4. Run with Firebase emulators (optional)

To use Firestore and Auth emulators instead of production:

1. Start the emulators:
   ```bash
   firebase emulators:start --only firestore,auth
   ```
2. In `public/assets/js/config.js` (or your init code), point to the emulator if needed (see [Firebase emulator docs](https://firebase.google.com/docs/emulator-suite)).

Or use the Hosting emulator to serve the site and hit emulated backend:

```bash
firebase emulators:start --only hosting,firestore,auth
```

### 5. Build / deploy

- No build step is required; the site is static HTML/JS/CSS.
- Deploy to Firebase Hosting:
  ```bash
  firebase deploy
  ```
- After deploy, bump `ASSET_VERSION` in `public/assets/js/config.js` if you want to bust caches.

## Project layout

- **`public/`** — All static assets (HTML, JS, CSS, images). This is the Hosting root.
- **`public/assets/js/`** — Scripts: `init.js` (entry), `config.js` (version + Firebase + analytics), and feature modules (menu, load-page, etc.).
- **`public/edit.html`** — Template for content injected into `/page` and `/memberpage`; keep structure in sync when changing layout.
- **`firebase.json`** — Hosting and rewrites (e.g. `/page` → `/page.html`, `/health` → `/health.json`).

## Health check

The site exposes a simple health endpoint for monitoring:

- **URL:** `/health` (rewrites to `health.json`)
- **Response:** HTTP 200 with `{"status":"ok"}`.

Use it for uptime checks or deployment verification.

## Before submitting

- Test the changed pages in a browser (and on a real device if you changed layout).
- If you changed Firebase config or shared JS, ensure login, menus, and `/page`/`/memberpage` still work.
- Bump `ASSET_VERSION` in `config.js` only when you intend to force cache refresh after deploy.

## Questions

Open an issue or contact the maintainers listed in the main [README](README.md).
