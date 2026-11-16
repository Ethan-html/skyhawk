# Skyhawk Site: Improvement Plan

This document has two parts, both based on reading the code in this repo (version `6.0.26`) and the [Portal](https://portal.skyhawk-cap.org/) described in the README.

| Part | What it is |
| --- | --- |
| [Part 1: Top 25 feature improvements](#part-1-top-25-feature-improvements) | New things to build, ranked by value for effort |
| [Part 2: Fixes, security and cleanup](#part-2-fixes-security-and-cleanup) | Problems found in the current code, in priority order |

Nothing here has been changed in the repo. These are recommendations.

---

# Part 1: Top 25 feature improvements

Ranked roughly by **value for effort**. Effort: **S** = under a day, **M** = a few days, **L** = a week or more.

Many of these are really **site + Portal** projects. The Portal already has calendar management, content management, stats and inspection scoring, so the biggest wins come from **surfacing that data on the member site**. "Portal work" below means changes in the Portal project, not this repo.

| # | Feature | What it does | Builds on | Effort |
| --- | --- | --- | --- | --- |
| 1 | **Calendar on the member site** | Month and agenda views, filters by type (meeting, activity, deadline), and a subscribable `.ics` feed for Google, Apple and Outlook. | Portal calendar management | M |
| 2 | **Audience roles** | Tag members as cadet, senior member, parent or staff (Firebase custom claims). Content boxes, pages and banners can then be shown to the right audience only. | Portal admin, `member/**` content | M |
| 3 | **"This week" meeting view** | One page for meeting night: next meeting, uniform of the day, schedule, calldown link and any notices. Becomes the default landing view. | #1, calldown, banner | S |
| 4 | **Notifications** | Email and/or push for new events, calldown opening, schedule changes and urgent notices. Users choose what they get. | Firebase Cloud Messaging, Portal | M to L |
| 5 | **Site-wide search** | One search box across member pages, menu items, tiles and tools. Can run in the browser from the cached Firestore data, with no new back end. | `load-member-page.js`, `menu.js` caches | M |
| 6 | **Calldown schedule from Firestore** | Move open/close times, deadline text and skip weeks (holidays, cancelled meetings) out of `form.html` so they can be changed in the Portal without a redeploy. | `FORM_SETTINGS`, Portal | S to M |
| 7 | **Calldown confirmation and live roster** | Cadets get a confirmation, can edit until the deadline, and staff see who has responded in real time. Name and CAPID can prefill from the signed-in account. | Calldown form, Auth, Portal stats | M |
| 8 | **Inspection results on the site** | Read-only scores and trends for members who should see them: per-area results, year-over-year charts, open deficiencies. | Portal inspection scoring | M |
| 9 | **Scheduled and targeted announcements** | Replace the single banner with a list: start/end dates, severity colours (info, warning, cancelled), audience targeting and a history page. | `admin/settings`, `public-settings.js`, #2 | M |
| 10 | **Content drafts, history and media library** | Draft, preview and schedule publishing for pages; version history with rollback and an audit log of who changed what; image upload with automatic resize and WebP. | Portal content management | M to L |
| 11 | **Account page** | Change password, update email, set notification and display preferences, and see sign-in history. Today the only self-service is "forgot password". | `login.js`, Auth | S to M |
| 12 | **Installable app with offline basics** | Proper manifest icons plus a small service worker that caches the shell, `styles.css` and key pages (contacts, uniform guide) for poor reception at events. | `manifest.json`, Fix #7 below | M |
| 13 | **Personal dashboard** | Pin favourite tiles, show recently viewed pages, and order tiles by role or usage. | `content-boxes.js`, stats | S to M |
| 14 | **Feedback button** | A "Report a problem or suggest content" button on every page that sends the page URL and a note to a Portal inbox. | Portal | S |
| 15 | **Short-link manager with QR codes** | Create, edit and expire short links in the Portal, auto-generate QR codes for flyers, and track clicks per link. | `404.html` link lookup, Portal | M |
| 16 | **Public landing page** | A "Join us" page with meeting time and place, how to join, an interest form and social/link preview tags, so the public site isn't just a login redirect. Members stay one click away. | `/` redirect, `form.html` pattern | M |
| 17 | **Staff shortcut to the Portal** | Show an "Open Portal" button in the header for signed-in staff only (based on a role claim), replacing the hidden keyboard and long-press shortcuts. | `admin.js`, #2 | S |
| 18 | **Stats feedback loop** | Feed more useful signals to the Portal's stats page: searches with no result, short-link slugs that 404, most-used tiles, and calldown participation by week. | `stats.js`, #5, #15 | M |
| 19 | **Reusable forms** | Generalise the calldown engine (`form.json` + schedule) into a forms hub: sign-ups, volunteer shifts, permission slips, with forms defined in the Portal. | `form.html`, `form.json` | L |
| 20 | **CyberPatriot live display** | Sync the `/cpt` timer across devices in real time so the team screen and the coach's laptop agree, with a practice-round log and image checklist. | `cpt.html`, Firestore realtime | M |
| 21 | **Native ribbon rack builder** | Stop depending on mcchord.org for images and posting. Host the ribbon images, let people save and share a rack via link, and export PNG or PDF. | `ribbon.html` | M to L |
| 22 | **Signature profiles** | Save a signature to the account, templates by role, install instructions for Outlook and Gmail, and a dark-mode preview. | `signature.html`, #11 | S to M |
| 23 | **Cadet progress tracker** | A read-only checklist of next steps toward each achievement and promotion, driven by data entered in the Portal. | Portal, #2 | L |
| 24 | **Photos on the dashboard** | Show the latest album strip from the photo site and link event albums from calendar entries. | `photos.skyhawk-cap.org`, #1 | S to M |
| 25 | **Printable handouts** | One-click, squadron-branded PDFs of the calendar, contacts and uniform guide for people who want paper. | #1, print CSS | S to M |

### What I'd build first

1. **#1 Calendar and #3 "This week" view.** Your Portal already manages the calendar, but members can't see it on the site. This is the biggest gap.
2. **#2 Audience roles.** It unlocks #9, #13, #17 and #23, and fixes the "everyone sees everything" model.
3. **#6 Calldown schedule from Firestore.** It removes the config-in-code mistakes described in Fix #8 below, and makes holiday weeks painless.
4. **#8 Inspection results.** The data is already being entered; showing it closes the loop.
5. **#14 Feedback button.** Tiny to build, and it tells you what to build next.

---

# Part 2: Fixes, security and cleanup

A prioritised review of problems in the current code.

**How to read this part**

- Items are grouped by priority. The table gives **impact** and **effort** (S = under an hour, M = a few hours, L = a day or more).
- Everything marked *verified in code* was confirmed by reading the files named. Items marked *test first* depend on behaviour I could not run (Firebase rules, Firebase Hosting config), so check them before relying on them.
- Item numbers below are referred to as "Fix #N" from Part 1.

---

## Summary

| # | Item | Impact | Effort |
| --- | --- | --- | --- |
| 1 | DOMPurify is never loaded, so member page HTML is not really sanitised | High | S |
| 2 | Announcement banner injects raw HTML | Medium | S |
| 3 | No security headers or CSP | High | S to M |
| 4 | Firestore rules aren't in the repo; stats writes are unconstrained | High | M |
| 5 | A deployed dead file contains a hard-coded password | High | S |
| 6 | `init.js` blocks every page on a member-menu fetch it doesn't need | Medium | S |
| 7 | Stale/broken references (manifest, sitemap, robots, vestigial routes) | Medium | S |
| 8 | Calldown schedule config is confusing and partly stale | Medium | S |
| 9 | Small input-validation gaps (`404.html`, `googleform.html`) | Low to Medium | S |
| 10 | About 340 KB of legacy JavaScript loads on every page | Medium | M |
| 11 | Tailwind build isn't scripted; CDN Tailwind on `/signature` | Medium | S to M |
| 12 | Large media files | Low to Medium | M |
| 13 | CI only deploys previews; no lint in CI; Windows-only deploy | Medium | M |
| 14 | Stale docs and repo hygiene | Low | S |
| 15 | Accessibility gaps | Medium | M |
| 16 | Privacy: analytics without consent on a youth site | Medium | S to M |
| 17 | Data model: unbounded `date` string in `userDailyVisits` | Low | M |

### Suggested order of attack

**First afternoon (all small):** #5, #1, #2, #6, #7, #8, #9.
**Next:** #3, #4, #11, #13.
**Then:** #10, #12, #15, #16, #17, #14.

---

## High priority: security and correctness

### 1. DOMPurify is never loaded, so the sanitiser doesn't work *(verified in code)*

`public/assets/js/load-member-page.js` sanitises page HTML with `window.DOMPurify`, but nothing in the repo ever loads that library (it is only referenced in this one file). So the **fallback** always runs:

```js
const div = document.createElement("div");
div.innerHTML = html;
div.querySelectorAll("script").forEach((s) => s.remove());
```

That is not safe. Assigning HTML to `innerHTML` creates the elements immediately, and handlers such as `<img src=x onerror=...>` fire even on a detached element. Removing `<script>` tags does nothing about that, or about `javascript:` links. Member content is written by admins, but this is stored content rendered to every member, so a compromised or careless admin account becomes an attack on every cadet and parent.

**Fix**

1. Download `purify.min.js` from a DOMPurify release and commit it as `public/assets/js/vendor/purify.min.js` (self-hosting avoids a new third-party dependency and works with a CSP).
2. Load it before page modules run, in `init.js`:
   ```js
   await loadAssets([withVersion("/assets/js/vendor/purify.min.js")]);
   ```
3. Remove the unsafe fallback, or make it return an empty string if DOMPurify is missing.
4. The current config allows `iframe`, `style` and `data:` URIs. Keep `iframe` only for hosts you actually embed:
   ```js
   const IFRAME_HOSTS = ["docs.google.com", "calendar.google.com"]; // adjust to your content
   DOMPurify.addHook("afterSanitizeAttributes", (node) => {
     if (node.tagName !== "IFRAME") return;
     try {
       const host = new URL(node.getAttribute("src"), location.href).hostname;
       if (!IFRAME_HOSTS.includes(host)) node.remove();
     } catch {
       node.remove();
     }
   });
   ```
5. Add `rel="noopener noreferrer"` to `target="_blank"` links through the same hook.

### 2. Announcement banner injects raw HTML *(verified in code)*

`public-settings.js` does `messageEl.innerHTML = trimmed;` with the `announcementBanner` string from Firestore. It is public (read before login) and unsanitised. Either use `textContent`, or run it through the same DOMPurify call with a tiny allowlist (`a`, `b`, `strong`, `em`, `br`).

### 3. No security headers or CSP *(verified in code; test headers after deploy)*

`firebase.json` sets only cache headers. Add a catch-all headers block:

```json
{
  "source": "**",
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ]
}
```

Then introduce a **Content-Security-Policy**, starting in `Content-Security-Policy-Report-Only` mode so nothing breaks. Based on what the pages load today, a CSP will need to allow: scripts from `gstatic.com` (Firebase), `googletagmanager.com`, `cdn.jsdelivr.net` and `cdn.tailwindcss.com` (signature page); styles from `cdnjs.cloudflare.com` and Google Fonts; connections to Firestore, Identity Toolkit, `securetoken.googleapis.com`, `www.googleapis.com`, Google Analytics, `*.supabase.co`, `admin.skyhawk-cap.org` and `docs.google.com`; frames from `docs.google.com`. The pages also use **inline scripts**, so you need hashes or nonces (or a temporary `'unsafe-inline'`) at first.

For clickjacking protection, prefer `frame-ancestors` in the CSP over `X-Frame-Options: DENY`. `boot.js` has an "inside an iframe" check, which suggests these pages may be embedded somewhere (for example the Portal), and a blanket deny would break that.

### 4. Firestore rules aren't versioned, and stats writes are open *(test first)*

- The rules live only in the Firebase console, so changes are never reviewed. Add `firestore.rules` to the repo, reference it from `firebase.json` (`"firestore": { "rules": "firestore.rules" }`), and deploy it with the site.
- The code needs: `admin/settings` readable **without login**, `member/**` readable when signed in, `userDailyVisits/{uid}` writable by that user, `pageMonthlyStats/**` writable when signed in. The README has a reference sketch.
- `pageMonthlyStats` is written straight from the browser with `setDoc(..., { viewCount: increment(1) })`. With rules that only check `request.auth != null`, any signed-in user can write **any** `viewCount`. Constrain writes so a document can only be created with `1` or updated by `+1`, and test it in the emulator (`firebase emulators:start --only firestore`). If the counters matter, a small Cloud Function is more trustworthy than client writes.

### 5. A deployed dead file contains a hard-coded password *(verified in code)*

`public/assets/easter/dev.js` contains a hard-coded password in plain text. The file is **not loaded** by `boot.js`, but everything in `public/` is deployed, so it is readable at `/assets/easter/dev.js` by anyone. `web.js` in the same folder is also not referenced anywhere.

- Delete both files from `public/` (keep them elsewhere if you want them).
- If that password is used for anything real, change it.
- Client-side JavaScript can never keep a secret; treat anything in `public/` as published.

### 6. `init.js` blocks every page on a fetch it doesn't need *(verified in code)*

The bottom of `init.js` runs this at module level:

```js
const MEMBER_MENU_CACHE_KEY = "menuPagesMember";
const memberMenuFresh = await fetchMemberMenu(db);
```

Two problems:

1. It is a **top-level `await`**, so every page that imports `init.js` waits for that Firestore round trip before `initPage()` can even start.
2. It runs on `/login` and for logged-out visitors, where it is guaranteed to be denied (`member/**` needs auth) and logs a warning.

`menu.js` already fetches `member/menu/pages` and writes the same `menuPagesMember` cache key. **Delete the `fetchMemberMenu` block from `init.js`.** This is the fastest performance win in the project.

---

## Medium priority: broken or stale

### 7. Stale references *(verified in code)*

- **`assets/manifest.json`**: the "Squadron Calendar" shortcut points to `/page?page=events/Squadron-calendar/`. There is no `/page` route any more, so it lands on the 404 page. Point it at a real `/memberpage?page=...` URL or remove it.
- **Installable app**: the manifest's only icon is `favicon.ico` at 64 px. Browsers want 192 px and 512 px PNGs (plus a maskable one) before they offer "Install app". Add them, and consider an `id`.
- **`sitemap.xml`** lists `/member` (login-gated) and `/photos` (a 301 to another domain). Keep only public, indexable URLs (for example `/login`, `/calldown`, `/signature`, `/ribbon`) and update `lastmod`.
- **`robots.txt`** blocks `/edit`, which isn't a route (the file is `edit.html`). Block `/edit.html` if you want it hidden.
- **`member.html` and `memberpage.html`** carry `<meta name="robots" content="index, follow">`. Search engines only ever see a redirect to `/login`. Use `noindex` on member pages. `memberpage.html` also has `canonical` pointing at `/member`.
- **Vestigial config in `init.js`**: the `path === "/"` page config can't run (the 301 sends `/` to `/member`), and the `/404` config requires auth but `404.html` doesn't load `init.js`. Remove both to reduce confusion.
- **Old hostname and `/admin` in `firebase.json`**: `/admin` still targets the old `admin.skyhawk-cap.org` host, and `404.html` uses the same host for its short-link lookup. Point both at `portal.skyhawk-cap.org` once its API lives there. Also, `/admin` is a **rewrite** to an external URL, but Firebase documents rewrites for internal destinations and **redirects** for external ones. *Test this in production*, and if it doesn't work, move it to `redirects`.

### 8. Calldown schedule config is confusing and partly stale *(verified in code)*

In `form.html`:

- `close: { day: 8, time: 0 }` is commented "Sunday", but days run 0 to 6. Day 8 simply produces a number larger than any real time, so the **actual** behaviour is "open Tuesday 2:00 AM until the end of Saturday". That matches `deadlineText: "Saturday at 24:00"`, but not the comment, and the changelog (6.0.22) says "Sunday night".
- A clearer value with **identical behaviour**: `close: { day: 6, time: 2400 }`.
- `closeDate: "2026-07-11T00:00:00"` is in the past and only used by the `"date"` and `"close-only"` modes. Update or remove it.
- `deadlineText` and `closedMessage` are hand-typed copies of the schedule. If someone changes the schedule and not the text, cadets see the wrong deadline. Generate the text from the schedule values.
- `TEST_MODE` ships in production code. It is `false` now, but a one-character mistake would pin the form to a fixed Saturday. Consider enabling it only with a URL flag such as `?test=1` on non-production hosts.
- The confirmation messages in `form.json` hard-code "See you Monday!". Fine today, but worth knowing when the meeting day changes.
- Bigger step: move the schedule into `form.json` or `admin/settings` so it can be changed without a redeploy.

### 9. Small input-validation gaps *(verified in code)*

- `404.html` redirects to whatever `data.url` the short-link API returns. Only follow `http:` and `https:`:
  ```js
  const target = new URL(data.url, location.origin);
  if (target.protocol === "https:" || target.protocol === "http:") redirect(target.href);
  ```
- `googleform.html` builds an iframe URL from `?id=`. Validate the ID before using it, for example `/^[A-Za-z0-9_-]{20,}$/`. The host is fixed to `docs.google.com`, so the risk is low, but the check is one line.
- `login.js` shows "No account found with that email." for `auth/user-not-found`. If Firebase's email-enumeration protection is on (the default for newer projects) that branch never fires; if it's off, the message reveals which emails have accounts. Use one generic message either way.
- The login lockout (`sessionStorage`) is reset by a new tab. Keep it for UX, but don't rely on it. Consider Firebase App Check, and require multi-factor sign-in for admin accounts in the Portal.

---

## Performance

### 10. About 340 KB of legacy JavaScript on every page *(verified in code; check usage before deleting)*

`init.js` loads these on every page:

| File | Size |
| --- | --- |
| `main-3e47b52a....min.js` | 232 KB |
| `jquery.min.js` | 87 KB |
| `jquery.cycle2-....min.js` | 23 KB |

The Cycle2 slideshow is gone, and `main-*.min.js` appears to be old template code (it begins with a `clearDefaults()` helper for an address form). The only live reference to jQuery is an *optional* check in `mobile-menu-a11y.js` (`window.jQuery` or `null`). Search the shipped pages for anything that needs them, remove what's unused, and delete the "Tier 1/2" loading block in `init.js`. That also removes the `eslint`/`prettier` ignore entries for these files.

### 11. Tailwind: build isn't scripted, and `/signature` uses the CDN *(verified in code)*

- `package.json` has no CSS build script, and the command isn't documented anywhere in the original repo docs. Add:
  ```json
  "build:css": "tailwindcss -i ./src/input.css -o ./public/styles.css --minify",
  "watch:css": "tailwindcss -i ./src/input.css -o ./public/styles.css --watch"
  ```
  Run `build:css` in CI so `styles.css` can't go stale. The committed file is also **not minified** (about 75 KB).
- `signature.html` loads `https://cdn.tailwindcss.com`, the Play CDN, which Tailwind says is for development only. It compiles CSS in the browser on every load and adds a third-party script. Compile what the page needs into `styles.css` or a separate small file.
- `tailwind.config.js` has a safelist of roughly 250 entries. Since `content` already scans every HTML and JS file, most of them are probably redundant. Try removing the safelist, rebuild, and compare the output.

### 12. Large media files *(verified in code)*

- `assets/easter/`: about 15 MB (`open.mp4` 8 MB, `WheelsontheBus.mp3` 5 MB). They only download when triggered, which is good, but they inflate the repo and deploys. Compress them, or host them in Cloud Storage.
- `media/pages/flightsimulatordemo.JPG` is about 2.5 MB. Convert to WebP or resize.
- Several PDFs are 2 to 4 MB. Fine to keep, but worth compressing.
- `header-footer.js` loads the mobile header images from absolute `https://skyhawk-cap.org/...` URLs. Use root-relative paths (`/assets/images/...`) so previews and local runs use their own copies. The same applies to the background image in `member.html` and the `CHANGELOG.txt` fetch in `changelog/index.html`.

---

## Developer experience and repo hygiene

### 13. CI and deploy

- The only workflow deploys **PR previews**. Add a lint job that runs on every PR:
  ```yaml
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: 20, cache: npm }
  - run: npm ci
  - run: npm run lint
  - run: npm run format:check
  ```
- Optionally add a workflow that deploys to the live channel on a version tag, so deploys don't depend on one Windows machine.
- `!Deploy.cmd` is Windows-only and about 400 lines of batch and PowerShell for output styling. A small Node script (`scripts/deploy.mjs`) would do the same checks on any OS.
- The changelog check only looks for the text `Version: X.Y.Z`. Version `6.0.26` is in the changelog with **no entries under it**. Have the script fail when a version has no content lines.
- `.last-deployed-version` is per-machine state but is tracked in git, which invites merge conflicts. Add it to `.gitignore`, or derive "last deployed" from git tags.

### 14. Stale docs and housekeeping

- **`CONTRIBUTING.md`** still describes the old site: a `/page` rewrite, `load-page`, a `<org>` placeholder clone URL, and a build step that doesn't mention Tailwind. It should be refreshed to match the new README (the clone URL is `https://github.com/Ethan-html/skyhawk.git`).
- **`LICENSE.txt`** names a placeholder source URL (`EthanLarson/YourTemplateRepo`) as the official place to get the template. Replace it with the real repo. The licence also says the credit line must read "Web developed by Ethan Larson", while the footer in `header-footer.js` currently says "Website Developed by C/CMSgt Larson". Make the two match.
- **`package.json`** lacks `description` and an `engines` field (suggest `"node": ">=20"`).
- **`functions/`** contains only a `node_modules` folder (no source and no `firebase.json` entry). It is ignored by git, but it makes the project folder much larger. Delete it.
- **Footer year** is hard-coded as "© 2026". Use `new Date().getFullYear()`.
- **Unit data** (`UNIT` in `header-footer.js`) and footer links are hard-coded. Fine for one squadron; move to Firestore only if the site becomes a reusable template.

---

## 15. Accessibility *(verified in code)*

- **Dark-mode toggle** (`#footerThemeSwitcher`) is a `<div>` with a click handler: no keyboard access, no label, no state. Make it a `<button role="switch" aria-checked="...">` with an accessible name.
- **Logout** is a clickable `<svg>` in `member.html`. Replace with a `<button aria-label="Log out">` wrapping the icon.
- **Skip link**: none of `member.html`, `memberpage.html` or `login.html` has one, but `init.js` looks for `a[href="#main-page-content"]` after login. Add a skip link that becomes visible on focus, and give `<main id="main-page-content">` `tabindex="-1"` so the fallback `main.focus()` actually works.
- **Decorative images**: the background image in `member.html` has `alt="Background"`. Use `alt=""` for decoration.
- **Theme default** ignores the visitor's system setting (`localStorage.theme || "light"`). Fall back to `prefers-color-scheme`, as `changelog/index.html` already does.
- **Staff diagram lightbox** (`load-member-page.js`) has no Escape-to-close, no focus management and no dialog role.
- **Redundant ARIA**: `<main role="main">` can drop the role.
- **Next step**: a quick pass with a screen reader (VoiceOver or NVDA) and keyboard-only navigation will catch anything not listed here.

---

## 16. Privacy

*(For consideration. I'm not a lawyer. Check with whoever owns the squadron's policies.)*

- **Google Analytics loads for everyone** (when `measurementId` is set) with no consent prompt, while `/signature` has its own consent check for Supabase analytics. Pick one consistent approach.
- **Per-user tracking**: `stats.js` records which dates each signed-in user visited. The site's users include cadets who are minors. That is reasonable to decide on purpose, but it should be disclosed.
- **`privacy-policy.html` covers only the "Automation Script" app.** It does not mention the website's analytics, Firestore visit tracking or the signature-page analytics. Consider a policy that covers the site itself, linked from the footer.

---

## 17. Data model: `userDailyVisits.date` grows forever *(verified in code)*

`stats.js` stores visit dates as one comma-joined string and rewrites it on each new day (read, append, write). The document grows without bound, the read-modify-write can lose updates if two tabs race, and it can't be queried by date. Better options:

- One document per day: `userDailyVisits/{uid}/days/{YYYY-MM-DD}` (a single write, naturally idempotent), or
- An array field updated with `arrayUnion(today)`, which is atomic and avoids duplicates.

If you do change the shape, plan a one-time migration, and update the rules and the Portal's stats reports at the same time.

---

## Nice-to-haves

- **Tests.** Even a handful of unit tests for the pure logic (`isFormInOpenWindow` schedule maths, changelog parsing, `isMaintenanceMode`) would catch the kind of config mistakes described in #8.
- **Error reporting.** Many modules `console.warn` and move on, which is good for resilience but means failures are invisible. Consider a lightweight browser error reporter (Sentry's browser SDK, for example) or a rate-limited `window.onerror` logger.
- **Offline.** If members use the site on phones at events, a simple service worker caching the shell and `styles.css` would make the dashboard load instantly with poor reception.
- **Content previews.** The Portal's content editor could render pages with `edit.html` for live previews, so edits match what members see.
