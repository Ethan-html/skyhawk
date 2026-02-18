// /assets/js/mobile-menu-a11y.js
// Focus trap and Escape-to-close for mobile menu (keyboard/screen reader a11y)

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusables(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute("disabled")
  );
}

export function initMobileMenuA11y() {
  const menu = document.querySelector(".mobile-navigation-menu");
  const menuButton = document.querySelector(".mobile-menu-button");

  if (!menu || !menuButton) return;

  let keydownHandler = null;

  function closeMenu() {
    const jq = typeof window.jQuery !== "undefined" ? window.jQuery : null;
    const mmenu = jq ? jq(menu).data("mmenu") : null;
    if (mmenu && typeof mmenu.close === "function") {
      mmenu.close();
    } else {
      menuButton.click();
    }
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }

  function setupTrap() {
    menu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");

    const focusables = getFocusables(menu);
    if (focusables.length) focusables[0].focus();

    keydownHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        teardownTrap();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusables(menu);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        if (current === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", keydownHandler);
  }

  function teardownTrap() {
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
    menu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
  }

  const observer = new MutationObserver(() => {
    const isOpen = menu.classList.contains("mm-opened");
    if (isOpen) setupTrap();
    else teardownTrap();
  });

  observer.observe(menu, { attributes: true, attributeFilter: ["class"] });

  // Initial state
  if (menu.classList.contains("mm-opened")) setupTrap();
  else menu.setAttribute("aria-hidden", "true");
}
