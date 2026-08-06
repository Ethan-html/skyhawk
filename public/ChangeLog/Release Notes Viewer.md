# Release Notes Viewer

A lightweight, dependency-free release notes viewer that reads a simple text file and automatically generates a modern, searchable web page. The goal is to make updating release notes as fast as possible—no HTML editing, no JSON, and no Markdown required.

---

# Design Goals

This project was built around three principles:

- **Simple to update** – Adding a release should take less than one minute.
- **No coding required** – Only edit a single text file.
- **Modern appearance** – The website handles all formatting automatically.

The release notes page is generated entirely from a plain text file.

---

# Project Structure

```
ReleaseNotes/
│
├── index.html
├── CHANGELOG.txt
├── README.md
│
└── assets/
    ├── style.css (optional)
    └── script.js (optional)
```

The project may also be distributed as a single HTML file with the CSS and JavaScript embedded.

---

# How It Works

When the page loads it:

1. Downloads `CHANGELOG.txt`
2. Reads it line-by-line.
3. Detects every release by looking for

```
Version:
```

4. Reads the corresponding

```
Date:
```

5. Everything after the blank line becomes release notes until another

```
Version:
```

is found.

Each release is then converted into a formatted card on the webpage.

---

# CHANGELOG Format

Every release **must** begin with a Version and Date.

Example:

```
Version: 6.0.16
Date: Aug 6 2026

Added NEW Release Page
Updated Signature Builder
Fixed Login Bug
Removed Legacy Installer
```

Blank lines are ignored.

The parser automatically starts a new release whenever another

```
Version:
```

appears.

Example:

```
Version: 6.0.16
Date: Aug 6 2026

Added Release Page

Version: 6.0.15
Date: Aug 4 2026

Fixed Login
```

---

# Supported Keywords

The parser looks at the **first word** on each line.

These determine the icon and color shown on the webpage.

| Keyword | Category |
|---------|----------|
| Added | New Features |
| Updated | Updates |
| Fixed | Bug Fixes |
| Changed | Changes |
| Removed | Removed Features |
| Security | Security |
| Improved | Improvements |
| Deprecated | Deprecated |
| Known | Known Issues |

If a line does not begin with one of these keywords it will simply appear as a normal list item.

---

# Links

Anything inside curly braces becomes a clickable hyperlink.

Example

```
Updated Signature Builder {https://example.com}
```

becomes

```
Updated Signature Builder
https://example.com
```

The braces are removed automatically.

---

# Images (Future)

Future versions may support:

```
Image {images/example.png}
```

which could automatically display screenshots.

---

# Search

The page includes a live search box.

Searching will match:

- Version numbers
- Dates
- Titles
- Release note text

Results update instantly as the user types.

---

# Latest Release

The newest release is automatically detected.

It will display:

- Latest badge
- Highlighted card
- Version
- Release date
- Quick summary

No additional configuration is required.

---

# Collapsible Releases

Only the newest release is expanded by default.

Older releases can be expanded or collapsed with a click.

This keeps the page clean even after dozens of releases.

---

# Dark Mode

The page supports:

- Light Mode
- Dark Mode

The user's preferred theme is remembered using Local Storage.

---

# Mobile Support

The layout is fully responsive.

Supported devices include:

- Desktop
- Tablet
- Mobile

Cards automatically resize for smaller screens.

---

# Adding a New Release

Open

```
CHANGELOG.txt
```

Copy the newest release block.

Edit the Version.

Edit the Date.

Replace the notes.

Example:

```
Version: 6.0.17
Date: Aug 10 2026

Added Update Checker
Updated Login Screen
Fixed PDF Export
Removed Old API
```

Save the file.

Refresh the webpage.

That's it.

---

# Parser Rules

The parser should:

Ignore empty lines.

Ignore extra spaces.

Accept Windows or Unix line endings.

Treat Version and Date as case-insensitive.

Example:

```
version:
VERSION:
Version:
```

should all work.

---

# Error Handling

If a release is missing a date:

Display

```
Unknown Date
```

If a release is missing a version:

Skip the release and log an error.

If the changelog cannot be loaded:

Display a friendly message such as:

```
Unable to load release notes.
```

instead of showing a blank page.

---

# Planned Features

- Release statistics
- Download release notes
- Copy version number
- Print-friendly mode
- Version comparison
- Release filtering
- Category filtering
- RSS feed support
- Automatic GitHub release import
- Keyboard shortcuts
- Animations
- Screenshot support
- Attachments
- Embedded videos

---

# Development Notes

The project intentionally avoids frameworks.

Preferred technologies:

- HTML5
- CSS3
- Vanilla JavaScript

No:

- Bootstrap
- React
- Vue
- Angular
- jQuery

The project should remain lightweight and easy to host on any web server.

---

# Goals for Future Development

Whenever new features are added, they should continue following these principles:

- Updating release notes should never require editing HTML.
- The changelog format should remain human-readable.
- The parser should be forgiving of minor formatting mistakes.
- The interface should prioritize readability over flashy effects.
- The entire project should remain portable and dependency-free.

The long-term vision is to provide a professional release notes page that anyone can maintain by editing a single plain text file.