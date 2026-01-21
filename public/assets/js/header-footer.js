// header-footer.js
import {
  doc,
  getDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export function initHeaderFooter(db) {

  // --------------------
  // Generic cache-first loader
  // --------------------
  async function loadAndRevalidate(cacheKey, fetcher, onUpdate) {
    const cachedRaw = localStorage.getItem(cacheKey);

    if (cachedRaw) {
      try {
        onUpdate(JSON.parse(cachedRaw)); // 🔥 instant render
      } catch {}
    }

    try {
      const fresh = await fetcher();
      const freshRaw = JSON.stringify(fresh);

      if (freshRaw !== cachedRaw) {
        localStorage.setItem(cacheKey, freshRaw);
        onUpdate(fresh);
      }
    } catch (err) {
      console.warn(`Failed to load ${cacheKey}`, err);
    }
  }

  // --------------------
  // Render functions
  // --------------------
  function renderUnit(unit) {
    if (!unit) return;
    document.title = unit.name;

    const el = document.getElementById("unit-name");
    if (el) el.textContent = `${unit.name} (${unit.designation})`;
  }

  function renderContact(contact) {
    if (!contact) return;

    const addr = document.getElementById("address");
    if (addr) addr.innerHTML = contact.address.replace(/\n/g, "<br>");

    const phone = document.getElementById("phone");
    if (phone) {
      phone.href = `tel:${contact.phone}`;
      phone.textContent = contact.phone;
    }

    const email = document.getElementById("email");
    if (email) {
      email.innerHTML = `<a href="mailto:${contact.email}">${contact.email}</a>`;
    }
  }

  function renderQuickLinks(links) {
    if (!links?.length) return;

    const root = document.getElementById("footer-quick-links");
    if (!root) return;
    root.innerHTML = "";

    links.forEach(link => {
      const li = document.createElement("li");
      li.className = "footer-links-list-item";

      const a = document.createElement("a");
      a.className = "footer-link footer-list-item-link";
      a.href = link.url;
      a.textContent = link.title;
      a.target = link.external === "true" ? "_blank" : "_self";
      if (link.external === "true") a.rel = "noopener noreferrer";

      li.appendChild(a);
      root.appendChild(li);
    });
  }

  // --------------------
  // Fetchers
  // --------------------
  const fetchUnit = async () => {
    const snap = await getDoc(doc(db, "main", "unit"));
    return snap.exists() ? snap.data() : null;
  };

  const fetchContact = async () => {
    const snap = await getDoc(doc(db, "main", "contact"));
    return snap.exists() ? snap.data() : null;
  };

  const fetchQuickLinks = async () => {
    const snap = await getDocs(
      collection(db, "main", "quickLinks", "children")
    );
    return snap.docs.map(d => d.data());
  };

  // --------------------
  // Init loads
  // --------------------
  loadAndRevalidate("site_unit", fetchUnit, renderUnit);
  loadAndRevalidate("site_contact", fetchContact, renderContact);
  loadAndRevalidate("site_quickLinks", fetchQuickLinks, renderQuickLinks);

  // --------------------
  // Copyright (no Firebase)
  // --------------------
  const el = document.getElementById("copyright-text");
  if (el) {
    el.innerHTML = `© ${new Date().getFullYear()} Civil Air Patrol. All rights reserved.`;
  }
}
