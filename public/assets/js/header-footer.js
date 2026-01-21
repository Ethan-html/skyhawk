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
    let cachedRaw = localStorage.getItem(cacheKey);

    if (cachedRaw) {
      try {
        const cachedData = JSON.parse(cachedRaw);
        if (cachedData) onUpdate(cachedData); // 🔥 instant render
      } catch (err) {
        console.warn(`Failed to parse cached ${cacheKey}`, err);
        cachedRaw = null; // force refetch
      }
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

  const renderFooter = (contact, quickLinks) => {
    const footerEl = document.getElementById("footer");
    if (!footerEl) return;

    footerEl.innerHTML = `
      <div class="footer-section">
        <div class="middle-footer-div">
          <div class="footer-container">
            <div class="footer-row row">
              <div class="_1 footer-column-wrap">
                <h4 class="footer-column-title">Address</h4>
                <p class="footer-paragraph">${contact?.address || ""}</p>
                <p class="footer-paragraph" x-ms-format-detection="none">${contact?.phone || ""}</p>
                <p class="footer-paragraph">${contact?.email || ""}</p>
              </div>
              <div class="_3 footer-column-wrap">
                <h4 class="footer-column-title">Mission Statement</h4>
                <div class="footer-paragraph">
                  Volunteers serving America's communities, saving lives, and shaping futures.
                </div>
              </div>
              <div class="_2 footer-column-wrap">
                <h4 class="footer-column-title">Quick Links</h4>
                <ul class="footer-links-list w-list-unstyled">
                  ${quickLinks?.map(link =>
                    `<li><a href="${link.url || "#"}" class="footer-link">${link.title || ""}</a></li>`
                  ).join("")}
                </ul>
              </div>
            </div>
          </div>
          <div class="container footer w-container"></div>
          <div class="footer-signoff-section">
            <div class="bottom-footer-container">
              <div class="footer-signoff-row row w-row">
                <div class="column w-col w-col-9 w-col-stack">
                  <div class="copyright-text">© ${new Date().getFullYear()} Civil Air Patrol. All rights reserved.</div>
                  <ul class="footer-signoff-list w-list-unstyled">
                    <li class="footer-signoff-list-item">
                      <a href="https://get.adobe.com/reader/" target="_blank" rel="noopener" class="footer-link">
                        Get Adobe Acrobat Reader
                      </a>
                    </li>
                    <li class="footer-signoff-list-item">
                      <a href="https://www.gocivilairpatrol.com/legal-privacy-statement" target="_blank" rel="noopener" class="footer-link">
                        Legal &amp; Privacy Statement
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="column w-clearfix w-col w-col-3 w-col-stack">
                  <div class="footer-signoff-grip w-inline-block">
                    <div id="GRIPFooterLogo" style="padding-top: 10px;">
                      <span id="GRIPFooterLogoText" style="color: #919293; font-size: 10px; font-family: Arial, sans-serif; text-transform: uppercase; display: block; text-align: left; font-weight: 700; letter-spacing: 0.02rem;">
                        WEB DEVELOPMENT BY <a href="" target="_blank" rel="noopener noreferrer" style="color: #919293; text-decoration: underline;">
                          ETHAN LARSON
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

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
    const snap = await getDocs(collection(db, "main", "quickLinks", "children"));
    return snap.docs.map(d => d.data());
  };

  // --------------------
  // Init loads
  // --------------------
  loadAndRevalidate("site_unit", fetchUnit, renderUnit);
  
  // Footer combined loader
  loadAndRevalidate("site_footer", async () => {
    const [contact, quickLinks] = await Promise.all([fetchContact(), fetchQuickLinks()]);
    return { contact, quickLinks };
  }, data => {
    renderFooter(data.contact, data.quickLinks);
    //renderContact(data.contact);       // optional if you also want the separate contact section
    //renderQuickLinks(data.quickLinks); // optional if you also want the separate quick links
  });
}
