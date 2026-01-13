fetch("/data/site.json")
  .then(res => res.json())
  .then(site => {
    // ============================
    // Set page title and header
    // ============================
    if (site.unit && site.unit.name) {
      document.title = site.unit.name;
      document.getElementById("unit-name").textContent =
        `${site.unit.name} (${site.unit.designation})`;
    }
    
    // ============================
    // Build main menu
    // ============================
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
    // Dropdown hover (jQuery)
    // ============================
    if (window.jQuery) {
      jQuery(document).ready(function () {
        jQuery('.main-li.has-dropdown').each(function () {
          const $item = jQuery(this);
          $item.off('mouseenter mouseleave');
          $item.on('mouseenter', function () { $item.addClass('open'); });
          $item.on('mouseleave', function () { $item.removeClass('open'); });
        });
      });
    }
    
    // ============================
    // Set footer contact info
    // ============================
    if (site.contact) {
      // Address
      const addrEl = document.getElementById("address");
      if (addrEl) addrEl.innerHTML = site.contact.address.replace(/\n/g, "<br>");

      // Phone
      const phoneEl = document.getElementById("phone");
      if (phoneEl) {
        phoneEl.href = `tel:${site.contact.phone}`;
        phoneEl.textContent = site.contact.phone;
      }

      // Email
      const emailEl = document.getElementById("email");;
      if (emailEl) {
        emailEl.innerHTML = `<a href="mailto:${site.contact.email}">${site.contact.email}</a>`;
      }
    }
  })
  .catch(err => console.error("Site load failed:", err));
