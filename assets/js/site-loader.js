fetch("/data/site.json")
  .then(res => res.json())
  .then(site => {
    // ============================
    // Set page title dynamically
    // ============================
    if (site.unit && site.unit.name) {
      document.title = site.unit.name; // sets <title>Skyhawk Composite Squadron</title>
    }

    // Set unit name in header
    document.getElementById("unit-name").textContent =
      `${site.unit.name} (${site.unit.designation})`;

    const menuRoot = document.getElementById("main-menu");

    site.menu.forEach(item => {
      const li = document.createElement("li");
      li.className = "main-li";

      if (item.children && item.children.length) {
        li.classList.add("has-dropdown");
        li.id = `menu-item-${item.id || item.title.toLowerCase().replace(/\s+/g, "-")}`;

        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_self";
        a.className = "main-nav-link has-submenu";
        a.style.cursor = "default";
        a.textContent = item.title;

        const dropdown = document.createElement("div");
        dropdown.className = "dropdown-container";

        const ul = document.createElement("ul");
        ul.className = "dropdown-list";

        item.children.forEach(child => {
          const cli = document.createElement("li");
          const ca = document.createElement("a");

          ca.href = child.url;
          ca.target = child.external ? "_blank" : "_self";
          ca.textContent = child.title;

          cli.appendChild(ca);
          ul.appendChild(cli);
        });

        dropdown.appendChild(ul);
        li.appendChild(a);
        li.appendChild(dropdown);
      } else {
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_self";
        a.className = "main-nav-link";
        a.textContent = item.title;
        li.appendChild(a);
      }

      menuRoot.appendChild(li);
    });

    // ============================
    // Attach hover events to dropdowns
    // ============================
    if (window.jQuery) {
      jQuery(document).ready(function () {
        jQuery('.main-li.has-dropdown').each(function () {
          const $item = jQuery(this);
          $item.off('mouseenter mouseleave');
          $item.on('mouseenter', function () {
            $item.addClass('open');
          });
          $item.on('mouseleave', function () {
            $item.removeClass('open');
          });
        });
      });
    }
  })
  .catch(err => console.error("Menu load failed:", err));
