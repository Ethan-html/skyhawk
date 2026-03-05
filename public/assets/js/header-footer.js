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
                  <div id="copyright-text" class="copyright-text">© ${new Date().getFullYear()} Civil Air Patrol. All rights reserved.</div>
                  <ul class="footer-signoff-list w-list-unstyled">
                    <li class="footer-signoff-list-item"><a href="https://mnwg.cap.gov/locations/delano" target="_blank" rel="noopener" class="footer-link">About Us</a></li>
                    <li class="footer-signoff-list-item"><a href="https://www.mncap.org/public/contact.cfm?unit=040" target="_blank" rel="noopener" class="footer-link">Contact Us</a></li>
                    <li class="footer-signoff-list-item"><a href="https://www.gocivilairpatrol.com/legal-privacy-statement" target="_blank" rel="noopener" class="footer-link">Legal &amp; Privacy Statement</a></li>
                  </ul>
                </div>
                <div class="column w-clearfix w-col w-col-3 w-col-stack">
                  <div class="footer-signoff-grip w-inline-block">
                    <div id="GRIPFooterLogo" style="padding-top: 10px;">
                      <span id="GRIPFooterLogoText" style="color: #919293; font-size: 10px; font-family: Arial, sans-serif; text-transform: uppercase; display: block; text-align: left; font-weight: 700; letter-spacing: 0.02rem;">
                        WEB DEVELOPMENT BY <a href="" target="_blank" rel="noopener noreferrer" style="color: #919293; text-decoration: underline;">C/TSgt Larson</a>
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
  
}
