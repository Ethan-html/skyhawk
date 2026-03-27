// header-footer.js
const UNIT = {
  name: "Skyhawk Squadron",
  designation: "040"
};

export function initHeaderFooter() {

  // Render header
  const header = document.getElementById("header");
  if (header) {
    header.innerHTML = `
<!-- HEADER - Mobile -->
<header class="bg-white dark:bg-gray-900 shadow-sm w-full md:hidden">
  <div class="max-w-7xl mx-auto py-2 flex items-center justify-between">

    <!-- Left Logo & Title -->
    <div class="flex flex-col items-start">
      <img src="https://skyhawk-cap.org/assets/images/CAP-2017-logo-horizontal-optimized.webp"
           class="w-[350px] dark:filter dark:brightness-200 dark:contrast-150 dark:saturate-200 dark:hue-rotate-200"
           alt="Civil Air Patrol">

      <div class="ml-8 text-lg font-semibold text-primary dark:text-blue-400/80 tracking-wide">
        ${UNIT.name.toUpperCase()} (${UNIT.designation})
      </div>
    </div>

    <!-- Right Squadron Logo -->
    <img src="https://skyhawk-cap.org/media/website/skyhawks_logo_CAP_transparent.webp"
         class="w-[120px] object-contain"
         alt="Skyhawk Squadron">
  </div>

  <!-- Divider -->
  <div class="h-1 bg-primary dark:bg-blue-700/60"></div>
</header>


<!-- HEADER - Desktop -->
<header class="bg-white dark:bg-gray-900 shadow-sm w-full hidden md:block">
  <div class="max-w-7xl mx-auto py-2 flex items-center justify-between">

    <!-- Left Logo -->
    <a href="/member">
      <img src="/assets/images/CAP-2017-logo-horizontal-optimized.webp"
           class="w-[350px] dark:filter dark:brightness-200 dark:contrast-150 dark:saturate-200 dark:hue-rotate-200"
           alt="Civil Air Patrol">
    </a>
    <!-- Right Squadron Logo -->
    <img src="/media/website/skyhawk-optimized.webp"
         class="w-[300px] object-contain"
         alt="Skyhawk Squadron">
  </div>
</header>
`;
  }

  // Render footer
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.innerHTML = `
      <footer class="w-full border-t border-gray-300 dark:border-gray-700 bg-gray-200/70 dark:bg-gray-900/70 backdrop-blur text-gray-700 dark:text-gray-300">
  <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
    <div class="flex flex-col md:flex-row md:items-center gap-3">
      <span>© 2026 Civil Air Patrol. All rights reserved.</span>
      <div class="flex gap-4">
        <a href="https://mnwg.cap.gov/locations/delano" target="_blank" class="hover:text-primary transition">About Us</a>
        <a href="https://www.mncap.org/public/contact.cfm?unit=040" target="_blank" class="hover:text-primary transition">Contact Us</a>
        <a href="https://www.gocivilairpatrol.com/legal-privacy-statement" target="_blank" class="hover:text-primary transition">Legal & Privacy</a>
      </div>
    </div>
    <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      Website Developed by
      <a href="https://techduck.com/codered" target="_blank" class="underline hover:text-primary ml-1 normal-case">C/TSgt Larson</a>

      <!-- Minimal Dark Mode Toggle -->
<div id="footerThemeSwitcher"
     class="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full p-[3px] flex items-center cursor-pointer transition">

  <!-- Sliding Circle -->
  <div id="toggleCircle"
       class="absolute left-[3px] top-[3px] w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow transition-all duration-300">
  </div>

  <!-- Light (Sun) -->
  <span class="absolute left-1.5 flex items-center justify-center text-yellow-500 pointer-events-none">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"/>
    </svg>
  </span>

  <!-- Dark (Moon) -->
  <span class="absolute right-1.5 flex items-center justify-center text-gray-700 dark:text-gray-200 pointer-events-none">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>
    </svg>
  </span>

</div>
    </div>
  </div>
</footer>
  `;
  initThemeToggle()
}

export function initThemeToggle() {

  const toggle = document.getElementById('footerThemeSwitcher');
  const toggleCircle = document.getElementById('toggleCircle');

  let theme = localStorage.getItem('theme') || 'light';
  applyTheme(theme);

  toggle?.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  });

  function applyTheme(theme) {

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (toggleCircle) toggleCircle.style.transform = 'translateX(29px)';
    } else {
      document.documentElement.classList.remove('dark');
      if (toggleCircle) toggleCircle.style.transform = 'translateX(0)';
    }

  }

}