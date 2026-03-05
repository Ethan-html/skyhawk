// header-footer.js
const UNIT = {
  name: "Skyhawk Squadron",
  designation: "040"
};

export function initHeaderFooter() {

  // Set unit name
  const el = document.getElementById("unit-name");
  if (el) el.textContent = `${UNIT.name} (${UNIT.designation})`;

  // Render footer
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-section">
      <div class="middle-footer-div">
        <div class="footer-signoff-section">
          <div class="bottom-footer-container">
            <div class="footer-signoff-row row w-row">

              <div class="column w-col w-col-9 w-col-stack">
                <div class="copyright-text">
                  © ${new Date().getFullYear()} Civil Air Patrol. All rights reserved.
                </div>

                <ul class="footer-signoff-list w-list-unstyled">
                  <li class="footer-signoff-list-item">
                    <a href="https://mnwg.cap.gov/locations/delano" target="_blank" class="footer-link">About Us</a>
                  </li>
                  <li class="footer-signoff-list-item">
                    <a href="https://www.mncap.org/public/contact.cfm?unit=040" target="_blank" class="footer-link">Contact Us</a>
                  </li>
                  <li class="footer-signoff-list-item">
                    <a href="https://www.gocivilairpatrol.com/legal-privacy-statement" target="_blank" class="footer-link">Legal & Privacy Statement</a>
                  </li>
                </ul>
              </div>

              <div class="column w-col w-col-3 w-col-stack">
                <div style="padding-top:10px;">
                  <span style="color:#919293;font-size:10px;font-family:Arial,sans-serif;text-transform:uppercase;font-weight:700;">
                    WEB DEVELOPMENT BY
                    <a href="" target="_blank" style="color:#919293;text-decoration:underline;">
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
  `;
}
