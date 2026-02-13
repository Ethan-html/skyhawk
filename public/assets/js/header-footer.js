// header-footer.js
import { doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export function initHeaderFooter(db) {

  // --------------------
  // Generic cache-first loader
  // --------------------
  async function loadAndRevalidate(key, fetcher, onUpdate) {
    let cached = localStorage.getItem(key);
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch { cached = null; }
    }

    try {
      const fresh = await fetcher();
      const freshRaw = JSON.stringify(fresh);
      if (freshRaw !== cached) {
        localStorage.setItem(key, freshRaw);
        onUpdate(fresh);
      }
    } catch (err) {
      console.warn(`Failed to load ${key}`, err);
    }
  }

  // --------------------
  // Fetchers
  // --------------------
  const fetchDocData = async (path) => {
    const snap = await getDoc(doc(db, ...path));
    return snap.exists() ? snap.data() : null;
  };

  const fetchCollectionData = async (path) => {
    const snap = await getDocs(collection(db, ...path));
    return snap.docs.map(d => d.data());
  };

  // --------------------
  // Render functions
  // --------------------
  const renderUnit = (unit) => {
    if (!unit) return;
    //document.title = unit.name;
    const el = document.getElementById("unit-name");
    if (el) el.textContent = `${unit.name} (${unit.designation})`;
  };
  const renderDonate = (donate) => {
    const donateBtn = document.getElementById("donations-button");
    if (!donateBtn) return;
    if (!donate || !donate.url) {
      donateBtn.style.display = "none";
      return;
    }
    donateBtn.style.display = "flex";
    donateBtn.href = donate.url;
  };


  const escapeHtml = (s) => {
    if (!s) return "";
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  };

  const renderFooter = (contact, quickLinks) => {
    const footer = document.getElementById("footer");
    if (!footer) return;

    const address = (contact?.address || "").split("\n").map(escapeHtml).join("<br>");
    const phone = escapeHtml(contact?.phone || "");
    const email = escapeHtml(contact?.email || "");
    const linksHTML = (quickLinks || [])
      .map((l) => `<li><a href="${escapeHtml(l.url || "#")}" class="footer-link"${l.external === "true" ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(l.title || "")}</a></li>`)
      .join("");

    footer.innerHTML = `
      <div class="footer-section">
        <div class="middle-footer-div">
          <div class="footer-container">
            <div class="footer-row row">
              <div class="_1 footer-column-wrap">
                <h4 class="footer-column-title" role="heading" aria-level="3">Address</h4>
                <p class="footer-paragraph">${address}</p>
                <p class="footer-paragraph" x-ms-format-detection="none">${phone}</p>
                <p class="footer-paragraph">${email}</p>
              </div>
              <div class="_3 footer-column-wrap">
                <h4 class="footer-column-title" role="heading" aria-level="3">Mission Statement</h4>
                <div class="footer-paragraph">
                  Volunteers serving America's communities, saving lives, and shaping futures.
                </div>
              </div>
              <div class="_2 footer-column-wrap">
                <h4 class="footer-column-title" role="heading" aria-level="3">Quick Links</h4>
                <ul class="footer-links-list w-list-unstyled">
                  ${linksHTML}
                </ul>
              </div>
            </div>
          </div>
          <div class="footer-signoff-section">
            <div class="bottom-footer-container">
              <div class="footer-signoff-row row w-row">
                <div class="column w-col w-col-9 w-col-stack">
                  <div id="copyright-text" class="copyright-text">© ${new Date().getFullYear()} Civil Air Patrol. All rights reserved.</div>
                  <ul class="footer-signoff-list w-list-unstyled">
                    <li class="footer-signoff-list-item"><a href="https://get.adobe.com/reader/" target="_blank" rel="noopener" class="footer-link">Get Adobe Acrobat Reader</a></li>
                    <li class="footer-signoff-list-item"><a href="https://www.gocivilairpatrol.com/legal-privacy-statement" target="_blank" rel="noopener" class="footer-link">Legal &amp; Privacy Statement</a></li>
                  </ul>
                </div>
                <div class="column w-clearfix w-col w-col-3 w-col-stack">
                  <div class="footer-signoff-grip w-inline-block">
                    <div id="GRIPFooterLogo" style="padding-top: 10px;">
                      <span id="GRIPFooterLogoText" style="color: #919293; font-size: 10px; font-family: Arial, sans-serif; text-transform: uppercase; display: block; text-align: left; font-weight: 700; letter-spacing: 0.02rem;">
                        WEB DEVELOPMENT BY <a href="" target="_blank" rel="noopener noreferrer" style="color: #919293; text-decoration: underline;">ETHAN LARSON</a>
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
  // Init loads
  // --------------------
  loadAndRevalidate("site_unit", () => fetchDocData(["main", "unit"]), renderUnit);
  loadAndRevalidate("site_donate", () => fetchDocData(["main", "donate"]), renderDonate);

  loadAndRevalidate("site_footer", async () => {
    const [contact, quickLinks] = await Promise.all([
      fetchDocData(["main", "contact"]),
      fetchCollectionData(["main", "quickLinks", "children"])
    ]);
    return { contact, quickLinks };
  }, data => renderFooter(data.contact, data.quickLinks));
}
