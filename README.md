# Skyhawk Composite Squadron Website

This repository contains the source code for the **Skyhawk Composite Squadron** website (`skyhawk-cap.org`). The site highlights Civil Air Patrol programs, supports prospective and current members, and provides a authenticated member portal powered by Firebase.

The project is a **static site hosted on Firebase Hosting** with dynamic content loaded from **Firebase Firestore** and authentication handled by **Firebase Auth**.

---

## Table of Contents

- [Overview](#overview)
- [Live Site and Environments](#live-site-and-environments)
- [Key Features](#key-features)
- [High-Level Architecture](#high-level-architecture)
- [Tech Stack](#tech-stack)
- [Frontend Behavior](#frontend-behavior)
  - [Initialization and Routing (`init.js`)](#initialization-and-routing-initjs)
  - [Header, Footer, and Global Layout](#header-footer-and-global-layout)
  - [Navigation Menu](#navigation-menu)
  - [Homepage Content Boxes](#homepage-content-boxes)
  - [Slideshow / Hero Images](#slideshow--hero-images)
  - [Dynamic Public Pages (`/page`)](#dynamic-public-pages-page)
  - [Member Area (`/member` and `/memberpage`)](#member-area-member-and-memberpage)
  - [Login Flow (`/login`)](#login-flow-login)
  - [Photos and Forms](#photos-and-forms)
  - [Admin Access Shortcuts](#admin-access-shortcuts)
- [Content Model (Firestore Collections)](#content-model-firestore-collections)
- [Caching and Performance](#caching-and-performance)
- [Accessibility](#accessibility)
- [Development Setup](#development-setup)
- [Security Considerations](#security-considerations)
- [Known Tradeoffs / Limitations](#known-tradeoffs--limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This website:

- Supports **joining the squadron**, with clear “Join” calls-to-action.
- Offers a **password-protected member area** for current members.
- Hosts **photos, forms, and event information**.
- Integrates with a separate **admin interface** used to manage content stored in Firestore.

---

## Live Site and Environments

- **Production**: `https://skyhawk-cap.org/`
- **Admin interface**:  `https://admin.skyhawk-cap.org/`

---

## Key Features

- **Public Content**
  - Homepage with slideshow and content boxes.
  - Dynamically-driven informational pages under `/page`.
  - Join information and general CAP/Unit information.
- **Member-Only Content**
  - `/member` dashboard-like landing page for logged-in members.
  - `/memberpage` section for more detailed member-only pages.
- **Authentication**
  - Firebase email/password login.
  - First-time login flow that forces a password reset via email.
  - Password reset UI for existing users.
- **Data-Driven UI**
  - Menus, content boxes, footer content, slideshow images, and many pages are driven from Firestore.
  - LocalStorage caching with background revalidation for much faster repeat visits.
- **Forms & Workflows**
  - `/form` and `/calldown` entry points for our weekly calldown form which syncs back to Google forms.
- **Photos**
  - `photos.html` provides a structured view of images (year/cadet/event filters).
- **Deployment**
  - Static assets served by Firebase Hosting with custom caching headers.

---

## High-Level Architecture

At a high level, the site works as follows:

- **Routing**:
  - Dynamic content routes: `/page` and `/memberpage` use query parameters (e.g. `/page?page=about/ae`) and load from Firestore.
  - A catch-all rewrite sends unrecognized URLs to `/404`.
- **Data Source**: Firestore provides the data model for:
  - Main menu
  - Homepage content boxes
  - Footer contact and quick links
  - Slideshow URLs
  - Public pages (`pages` collection)
  - Member pages (`member`-scoped collections)
- **Authentication**: Firebase Auth (client-only) controls access to certain routes and initializes login UI.
- **Client-Side Modules**: Page behavior is split across small modules under `public/assets/js/` and coordinated by `init.js`.

---

## Tech Stack

- **Hosting**
  - Firebase Hosting (`firebase.json` defines hosting config)
- **Frontend**
  - HTML5
  - CSS (primarily `public/assets/stylesheets/main.css`)
  - Vanilla JavaScript modules (`type="module"`)
- **JavaScript Libraries**
  - Firebase SDK v12 (via ES modules from `https://www.gstatic.com/firebasejs/12.7.0/`):
    - `firebase-app`
    - `firebase-firestore`
    - `firebase-auth`
  - Glide.js for the homepage slideshow (`@glidejs/glide`)
  - jQuery and jQuery Cycle2 for legacy slideshow/behavior
- **Backend / Data**
  - Firebase Firestore (NoSQL database)

---

## Frontend Behavior

### Initialization and Routing (`init.js`)

`init.js` is the main entry point for client-side behavior:

- Initializes Firebase:
  - `initializeApp` with project-specific config
  - `getFirestore` and `getAuth`
- Defines **page configurations** describing:
  - Which modules should run for each route (e.g. homepage, member pages, photos, login).
  - Whether a route is **protected** (requires authentication).
- Implements an **auth gate**:
  - For protected routes (`/member`, `/memberpage`, `/photos`), hides the `<body>` until `onAuthStateChanged` resolves.
  - If user is not logged in, redirects to `/`.
- Handles **asset loading tiers**:
  - Tier 0: Immediately loads critical CSS (`/assets/stylesheets/main.css`) to avoid FOUC.
  - Tier 1: Asynchronously loads jQuery and jQuery Cycle.
  - Tier 2/3: Non-critical assets, including `main-*.js`, `admin.js`, and an easter-egg boot script.
- Lazily initializes **Google Analytics** using `gtag`, only when the browser is idle.
- After auth gate, runs the appropriate **page modules** in parallel for the current route:
  - Homepage: `initHeaderFooter`, `initMenu`, `initSlideshow`, `initContentBoxes`
  - Public pages: `initHeaderFooter`, `initMenu`, `loadPage`/`renderPage`
  - Member pages: `initHeaderFooter`, `initMenu`, `initMemberMenu`, `loadMemberPage`/`renderMemberPage`, logout wiring
  - Login: `initLogin`

### Header, Footer, and Global Layout

`header-footer.js`:

- Loads data from Firestore (with cache + revalidate):
  - `main/unit` → unit name and designation.
  - `main/donate` → donation URL for the “Donate Today”/“Ways to Give” button.
  - `main/contact` → address, phone, email.
  - `main/quickLinks/children` → external/internal quick links.
- Renders:
  - Unit name into `#unit-name` in the header.
  - Donation button `href` via `#donations-button`.
  - Full footer with:
    - Address, phone, email.
    - Fixed mission statement.
    - Quick links.
    - Legal links and Adobe Reader link.
    - Developer credit: `WEB DEVELOPMENT BY ETHAN LARSON`.

The footer content is **cached in `localStorage`** and re-rendered when updated in Firestore.

### Navigation Menu

`menu.js`:

- Loads the main navigation from Firestore:
  - `main/menu/pages` collection plus each page’s `children` subcollection.
- Produces:
  - **Desktop menu** (`#main-menu`):
    - Top-level items with optional dropdown.
  - **Mobile menu** (`#mobile-menu-root`):
    - Nested list structure suitable for mobile nav.
- Uses **localStorage caching** with background revalidation, similar to header/footer.
- Handles mouseenter/mouseleave on desktop menus to open/close dropdowns.

`member-menu.js` performs a similar role for the member-side navigation inside `/member` and `/memberpage`.

### Homepage Content Boxes

`content-boxes.js`:

- Loads content boxes from Firestore:
  - `main/contentBoxes/children`.
- Renders a grid of content tiles with:
  - `title`
  - `img` (thumbnail)
  - `url`
  - `position` (layout hint, e.g. left/right)
  - `target` (`_self`, `_blank`, etc.)
- Uses `localStorage` (`contentBoxesChildren`) to:
  - Render cached boxes immediately.
  - Fetch fresh data in the background, updating only when it changes.

### Slideshow / Hero Images

`slideshow.js`:

- Loads slideshow configuration from Firestore:
  - Document `main/slideshow` with a `urls` field (comma-separated list of image URLs).
- Parses URLs, filters out empties, and renders `<li>` slides inside `#glide-slides`.
- Initializes Glide.js for carousel behavior:
  - Single slide in view.
  - Auto-play with hover pause.
- Uses the same cache-first pattern as menus/content boxes.

### Dynamic Public Pages (`/page`)

`page.html` combined with `load-page.js` and `renderPage` provide dynamic content pages:

- URL structure: `/page?page=<section>/<child>`:
  - `section` maps to the Firestore document ID in the `pages` collection.
  - `child` is a slug for child pages within that section.
- `load-page.js`:
  - Reads from Firestore:
    - Document `pages/<sectionId>` for main page data:
      - `title`
      - `content` (may be empty if content is only on children).
    - Subcollection `pages/<sectionId>/children` for child pages:
      - `title`, `slug`, `content`, `externalUrl`.
  - Stores combined result in `localStorage` as `pageData_<sectionId>`.
  - Uses cache-first, revalidate-later behavior.
- `renderPage`:
  - Determines the active child based on the URL (`page` query param).
  - Renders:
    - Side navigation (`#sideNavList`) for child links.
    - Page title (`#pageTitle`).
    - Content into `#pageContent` (either main or child content).
  - If `externalUrl` is set, redirects to that external URL instead of rendering content.

### Member Area (`/member` and `/memberpage`)

- `/member`:
  - Requires authentication (checked in `init.js`).
  - Renders a member-landing view with:
    - Standard header/menu.
    - **Logout button** (`#logoutBtn`, plus mobile logout icon).
    - Member-only content boxes (`initContentBoxes` with member-specific configuration).
- `/memberpage`:
  - Similar to `/page`, but scoped to member content:
    - Uses `load-member-page.js`.
    - Reads data from `member` namespaced collections (see Content Model section).
  - Side navigation and active page rendering parallel the public pages behavior.
- `initLogout` in `init.js`:
  - Hooks up click handlers for both desktop and mobile logout controls.
  - Calls `signOut(auth)` and redirects back to `/`.

### Login Flow (`/login`)

`login.html` + `login.js` implement a modern login + reset flow:

- **Standard login**:
  - Form `#loginForm` collects `email` and `password`.
  - On submit:
    - Calls `signInWithEmailAndPassword`.
    - Checks `user.metadata.creationTime` vs `lastSignInTime`:
      - If equal, treats as **first login** and triggers a forced password reset.
      - Otherwise, sets a cookie (`new`) and redirects to `/member`.
- **First-time login flow**:
  - If URL has `?new=<email>`:
    - The page switches to a first-time section UI.
    - User can trigger a password reset for the new account.
    - The email is prefilled from the query param.
    - A “Resend reset email” link is available with debounced UI updates.
- **Password reset (existing users)**:
  - “Forgot your password?” link reveals a reset section.
  - User enters email, clicks “Send Reset Email”.
  - Uses `sendPasswordResetEmail` with `actionCodeSettings`:
    - `url: "https://skyhawk-cap.org/login"` so the reset process returns to the login page.

All UI states are managed with simple DOM operations (show/hide sections, set text content for messages).

### Photos and Forms

- **Photos (`photos.html`)**:
  - Provides a structured photo gallery UI.
  - Uses dynamic `<select>` elements for:
    - Year
    - Cadet
    - Month
    - Event
  - JS populates these selects and the gallery using template strings and `.innerHTML`.
  - Data may be static or driven via JSON/Firestore (depending on configuration).

- **Forms (`form.html` and `calldown`)**:
  - `form.html` is used for various forms, including `calldown`.
  - Pulls form configuration from `/assets/json/form.json`.
  - Dynamically builds form sections and fields from JSON.
  - Handles multi-step/wizard-like or sectioned forms (depending on JSON).

### Admin Access Shortcuts

`admin.js` defines hidden shortcuts for quickly navigating to the admin UI:

- **Keyboard shortcut**:
  - Typing the sequence `a d m i n` (`"admin"`) anywhere in the document redirects to the admin host.
- Target URL (from `admin.js`):
  - `https://admin.skyhawk-cap.org/`.

---

## Content Model (Firestore Collections)

Based on the current code, the expected Firestore structure is roughly:

- **Main / Global**
  - `main/unit` (document)
    - `name`
    - `designation`
  - `main/donate` (document)
    - `url`
  - `main/contact` (document)
    - `address` (may contain newlines)
    - `phone`
    - `email`
  - `main/quickLinks/children` (collection)
    - Each child:
      - `title`
      - `url`
      - `external` (string `"true"` or `"false"`)
  - `main/contentBoxes/children` (collection)
    - Each doc:
      - `title`
      - `url`
      - `img`
      - `position` (e.g. `left`/`right`) Note: you should have 3 of each
      - `target` (`_self`, `_blank`, etc.)
  - `main/menu/pages` (collection)
    - Each page doc:
      - `id`, `title`, `url`, etc.
    - `main/menu/pages/<pageId>/children` (subcollection)
      - Each child: `title`, `url`
  - `main/slideshow` (document)
    - `urls` (comma-separated list of image URLs)

- **Public Pages**
  - `pages` (collection)
    - `<sectionId>` (document):
      - `title`
      - `content` (HTML string, optional if content is only on children)
    - `pages/<sectionId>/children` (subcollection)
      - Each child:
        - `title`
        - `slug`
        - `content` (HTML string)
        - `externalUrl` (optional)

- **Member Pages**
  - `member/pages/...` (nested collections)
    - A tree structure similar to `pages`, but scoped for member-only content.
    - See `load-member-page.js` for exact path usage.

The admin UI (hosted separately) is responsible for editing and maintaining this content.

---

## Caching and Performance

The site uses several simple but effective client-side performance techniques:

- **Asset Versioning**
  - `public/assets/js/config.js` defines `window.ASSET_VERSION`.
  - `init.js` appends `v=<ASSET_VERSION>` query param to JS and CSS URLs.
  - Makes it easy to bust caches on deploy by changing a single value.

- **Aggressive Static Caching**
  - `firebase.json` sets `Cache-Control` headers:
    - `/assets/**` and `/media/**`: `max-age=2592000` (30 days).
    - `main` JS/CSS bundles: also `max-age=2592000`.
    - `config.js`: shorter cache (`max-age=60`) for safer config updates.

- **LocalStorage Caching of Dynamic Data**
  - Menus, content boxes, slideshow, footer, and pages use:
    - **Cache-first immediate render** from `localStorage`.
    - **Background revalidation** via a fresh Firestore read.
    - **Update on change** (only re-render if JSON changed).

- **Lazy Script Loading**
  - jQuery / legacy libraries are loaded after main CSS.
  - Google Analytics is initialized only during browser idle time.

---

## Accessibility

The codebase includes several accessibility-conscious decisions:

- **Semantic Structure**
  - `h1` elements are present (often visually hidden) for each main page.
  - Breadcrumb list semantics where applicable.
- **Skip Links**
  - `member.html` includes a “Skip to main content” link (screen-reader-friendly).
- **Keyboard Navigation**
  - Menus and links are standard anchors (`<a>`) with proper `href`s for predictable keyboard behavior.
- **Alt Text**
  - Images, especially brand and decorative images, provide `alt` attributes.

There is still room to improve (e.g., focus management, ARIA roles/states, more descriptive alt texts), but the foundation is reasonable.

---

## Development Setup

Because this is a static site with client-only Firebase usage, setup is relatively simple.

### Prerequisites

- A recent web browser.
- Optionally:
  - **Node.js** (for installing the Firebase CLI).
  - **Firebase CLI** (`firebase-tools`) for local emulation and deployment.
  - A **Firebase project** configured with:
    - Hosting
    - Firestore
    - Authentication (Email/Password)
    - Optional: Storage

### Running Locally (Simple)

For basic HTML/CSS/JS work without Firebase emulation:

1. Open the `public` folder in your editor.
2. Use a simple static server (or your editor’s built-in live server) to serve `public`:
   - For example, with Node and `npx serve` (from the repo root):
     ```bash
     npx serve public
     ```
3. Visit `http://localhost:<port>/` in your browser.

Note: Login and Firestore-backed sections will interact with **your configured Firebase project**, as configerd in `init.js`.

---

## Configuration

### Asset Versioning

- `public/assets/js/config.js`:
  - `window.ASSET_VERSION = "2.1.1";` (example).
- `init.js` reads `window.ASSET_VERSION` and appends `?v=<version>` to:
  - Core CSS.
  - Main JS modules.
- To bust caches:
  - Increment **MAJOR.MINOR.PATCH** in `config.js` and redeploy.

### Firebase Config

In `init.js`, the Firebase config block includes:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

These values must match your Firebase project.

---

## Security Considerations

Important security-related notes:

- **Firestore Rules**  
  Firestore security is NOT defined in this repo. Ensure:
  - Proper security rules are set up in the Firebase console or in external rules files.
  - Only authorized users can write or read sensitive data.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --------------------
    // PUBLIC CONTENT
    // --------------------

    match /main/{docId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.admin == true;

      // allow ALL subcollections under /main
      match /{subCollection=**} {
        allow read: if true;
        allow write: if request.auth != null
                     && request.auth.token.admin == true;
      }

      // Example of this rule:
      // Anyone can read a /main document,
      // but only authenticated admins can write.
      // e.g., /main/exampleDoc
    }

    match /pages/{docId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.admin == true;

      match /{subCollection=**} {
        allow read: if true;
        allow write: if request.auth != null
                     && request.auth.token.admin == true;
      }

      // Example of this rule:
      // Reading a page like /pages/home works for everyone,
      // writing requires admin privileges.
    }

    // --------------------
    // MEMBER-ONLY CONTENT
    // --------------------

    match /member/{docId} {
      allow read: if request.auth != null;
      allow write: if false;

      match /{subCollection=**} {
        allow read: if request.auth != null;
        allow write: if false;
      }

      // Example of this rule:
      // Only logged-in users can read /member profiles,
      // no one can write to them.
    }

    // --------------------
    // DENY EVERYTHING ELSE
    // --------------------

    match /{document=**} {
      allow read, write: if false;

      // Example of this rule:
      // Any document outside /main, /pages, or /member
      // is completely inaccessible.
    }
  }
}


- **Authentication Handling**
  - Auth is client-side only.
  - Protected routes rely on `onAuthStateChanged` and conditional redirects.

- **Cookies**
  - A simple cookie (`new`) is used client-side to track first-time login behavior.
  - It is not used for security; do not rely on this cookie for access control.

---

## Known Tradeoffs / Limitations

- **No backend rendering**: All dynamic content is rendered in the browser. Users with aggressive JS blockers may see limited content.
- **Tightly-coupled content model**: Firestore document/collection structure is tied directly to JS codepaths; changing the schema requires code changes.
- **Admin interface is external**: This repo does not include the admin UI; it’s hosted separately as it requres a backend.

---

## Contributing

Contributions are welcome, especially for:

- Performance optimizations (CSS splitting, code-splitting).
- Better developer documentation and tooling.

General guidelines:

- **Before Submitting**
  - Test locally (at least `index.html`, `login.html`, `page.html`, `member.html`, `photos.html`).
  - Check that navigation, login, and core pages still function.

---

## License

- See `LICENSE.txt` for full license details.
