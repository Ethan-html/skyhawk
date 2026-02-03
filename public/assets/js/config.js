/*
Single place to bump on each deploy. Used for cache-busting asset URLs.

Versioning Rules (Semantic Style)

Format: MAJOR.MINOR.PATCH  →  Example: 6.3.2

MAJOR (6)
- Big or breaking changes
- Something may stop working without updates
- Major feature overhauls or structural rewrites

MINOR (3)
- New features or noticeable improvements
- No breaking changes
- Existing functionality continues to work

PATCH (2)
- Small fixes and minor improvements
- Bug fixes, performance tweaks, tiny adjustments
- No new features, no breaking changes
*/
window.ASSET_VERSION = "2.0.0";
