/**
 * components.js — Native Web Components for Den of Fao
 * 100% Native, Zero-framework, Light-DOM Web Components.
 * Fully compatible with XAMPP Apache and GitHub Pages.
 */

// ========================================================
// Vault 7-Theme Color System & Persistence Manager
// Available Themes: Blue (default), Purple, Orange, Red, Obsidian, Pink, Yellow
// ========================================================
const VAULT_THEMES = [
  { id: 'blue', name: 'Blue', color: '#38bdf8', gradient: 'linear-gradient(135deg, #38bdf8, #1d4ed8)' },
  { id: 'purple', name: 'Purple', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc, #7e22ce)' },
  { id: 'orange', name: 'Orange', color: '#fb923c', gradient: 'linear-gradient(135deg, #fb923c, #c2410c)' },
  { id: 'red', name: 'Red', color: '#f87171', gradient: 'linear-gradient(135deg, #f87171, #b91c1c)' },
  { id: 'obsidian', name: 'Obsidian', color: '#94a3b8', gradient: 'linear-gradient(135deg, #cbd5e1, #334155)' },
  { id: 'pink', name: 'Pink', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { id: 'yellow', name: 'Yellow', color: '#facc15', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)' }
];

function getStoredVaultTheme() {
  try {
    const saved = localStorage.getItem('denoffao_theme');
    if (saved && VAULT_THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch (e) {}
  return 'blue';
}

function applyVaultTheme(themeId) {
  const theme = VAULT_THEMES.find(t => t.id === themeId) || VAULT_THEMES[0];
  document.documentElement.setAttribute('data-theme', theme.id);
  try {
    localStorage.setItem('denoffao_theme', theme.id);
  } catch (e) {}

  // Update theme pickers across DOM
  document.querySelectorAll('.vault-theme-picker').forEach(picker => {
    const label = picker.querySelector('#themeActiveLabel');
    const swatch = picker.querySelector('#themeActiveSwatch');
    const btn = picker.querySelector('#vaultThemeBtn');
    if (label) label.textContent = theme.name;
    if (swatch) swatch.style.background = theme.gradient;
    if (btn) btn.setAttribute('title', `Switch Vault Theme (${theme.name})`);
    picker.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-theme-id') === theme.id);
    });
  });
}
window.applyVaultTheme = applyVaultTheme;

// Immediate application upon script evaluation
(function initVaultTheme() {
  if (typeof document !== 'undefined') {
    const current = getStoredVaultTheme();
    document.documentElement.setAttribute('data-theme', current);

    // Ensure favicon, manifest & PWA theme-color exist in <head> across all pages
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      if (!head.querySelector('link[rel="icon"]')) {
        const icons = [
          { rel: 'icon', type: 'image/png', href: 'favicon-96x96.png', sizes: '96x96' },
          { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' },
          { rel: 'shortcut icon', href: 'favicon.ico' },
          { rel: 'apple-touch-icon', sizes: '180x180', href: 'apple-touch-icon.png' }
        ];
        icons.forEach(attrs => {
          const link = document.createElement('link');
          Object.keys(attrs).forEach(k => link.setAttribute(k, attrs[k]));
          head.appendChild(link);
        });
      }
      if (!head.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.setAttribute('rel', 'manifest');
        manifestLink.setAttribute('href', 'site.webmanifest');
        head.appendChild(manifestLink);
      }
      if (!head.querySelector('meta[name="theme-color"]')) {
        const themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        themeMeta.setAttribute('content', '#081120');
        head.appendChild(themeMeta);
      }
    }
  }
})();

// Register Progressive Web App Service Worker (sw.js)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });
}

// Listen for storage changes across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'denoffao_theme' && e.newValue) {
      applyVaultTheme(e.newValue);
    }
  });
}

// ========================================================
// Vault Multi-Language Translation System (Google Translate Powered)
// Supported: English, Japanese, Thai, Portuguese, Indonesian, Cebuano, Spanish, French
// ========================================================
const VAULT_LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English (Original)', shortName: 'EN' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', shortName: 'JA' },
  { id: 'th', name: 'Thai', nativeName: 'ไทย', shortName: 'TH' },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português', shortName: 'PT' },
  { id: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', shortName: 'ID' },
  { id: 'ceb', name: 'Cebuano', nativeName: 'Binisiya (Cebuano)', shortName: 'CEB' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', shortName: 'ES' },
  { id: 'fr', name: 'French', nativeName: 'Français', shortName: 'FR' }
];

function getStoredVaultLanguage() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z\-]+)/);
    if (match && match[1]) {
      const code = match[1].toLowerCase();
      if (VAULT_LANGUAGES.some(l => l.id === code)) {
        return code;
      }
    }
    const saved = localStorage.getItem('denoffao_lang');
    if (saved && VAULT_LANGUAGES.some(l => l.id === saved)) {
      return saved;
    }
  } catch (e) {}
  return 'en';
}

function setGoogleTransCookie(val) {
  try {
    const host = window.location.hostname;
    if (val) {
      document.cookie = `googtrans=${val}; path=/;`;
      if (host && host !== 'localhost') {
        document.cookie = `googtrans=${val}; domain=.${host}; path=/;`;
      }
    } else {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (host && host !== 'localhost') {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
      }
    }
  } catch (e) {}
}

function applyVaultLanguage(langId) {
  const target = VAULT_LANGUAGES.find(l => l.id === langId) || VAULT_LANGUAGES[0];
  const current = getStoredVaultLanguage();
  if (target.id === current) return;

  if (target.id === 'en') {
    setGoogleTransCookie('');
    try {
      localStorage.removeItem('denoffao_lang');
    } catch (e) {}
    window.location.reload();
    return;
  }

  setGoogleTransCookie(`/en/${target.id}`);
  try {
    localStorage.setItem('denoffao_lang', target.id);
  } catch (e) {}

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = target.id;
    select.dispatchEvent(new Event('change'));
    updateVaultLangUI(target.id);
  } else {
    window.location.reload();
  }
}
window.applyVaultLanguage = applyVaultLanguage;

function updateVaultLangUI(langId) {
  const lang = VAULT_LANGUAGES.find(l => l.id === langId) || VAULT_LANGUAGES[0];
  document.querySelectorAll('.vault-lang-picker').forEach(picker => {
    const label = picker.querySelector('#langActiveLabel');
    const btn = picker.querySelector('#vaultLangBtn');
    if (label) label.textContent = lang.shortName;
    if (btn) btn.setAttribute('title', `Translate Website (${lang.nativeName})`);
    picker.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-lang-id') === lang.id);
    });
  });
}

// Immediate cookie check & sync
(function initVaultLanguage() {
  if (typeof document !== 'undefined') {
    try {
      const saved = localStorage.getItem('denoffao_lang');
      const hasCookie = /(?:^|;\s*)googtrans=/.test(document.cookie);
      if (saved && saved !== 'en' && !hasCookie && VAULT_LANGUAGES.some(l => l.id === saved)) {
        setGoogleTransCookie(`/en/${saved}`);
      }
    } catch (e) {}
  }
})();

function loadGoogleTranslateScript() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('google-translate-script')) return;

  // Add hidden container for Google Translate element if not present
  if (!document.getElementById('google_translate_element')) {
    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.className = 'notranslate';
    div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    (document.body || document.documentElement).appendChild(div);
  }

  window.googleTranslateElementInit = function() {
    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,ja,th,pt,id,ceb,es,fr',
        autoDisplay: false
      }, 'google_translate_element');
    } catch (e) {}
  };

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  (document.body || document.head || document.documentElement).appendChild(script);
}

// SVG Icon Definitions (Clean, crisp, lightweight vectors)
const ICONS = {
  star: `<svg width="12" height="12" viewBox="0 0 576 512" fill="currentColor" style="vertical-align: -1px; margin-right: 3px; display: inline-block; color: var(--accent-amber, #f59e0b);"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/></svg>`,
  heart: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -1px; margin-left: 4px; display: inline-block; color: var(--accent-rose, #f43f5e);"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  vault: `<svg class="js-home-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible; display: block;">
    <g class="home-svg-smoke" stroke="none">
      <circle class="smoke-puff" cx="17.5" cy="3.5" r="1.2" fill="var(--accent-cyan, #38bdf8)" opacity="0.65"></circle>
      <circle class="smoke-puff" cx="18.2" cy="1.5" r="1.5" fill="var(--accent-cyan, #38bdf8)" opacity="0.4"></circle>
      <circle class="smoke-puff" cx="17.0" cy="-0.5" r="1.8" fill="var(--accent-amber, #fbbf24)" opacity="0.2"></circle>
    </g>
    <g class="home-svg-house">
      <path class="home-svg-body" d="M5 10.2V20a1.8 1.8 0 0 0 1.8 1.8h10.4A1.8 1.8 0 0 0 19 20v-9.8" fill="rgba(15, 23, 42, 0.55)"></path>
      <rect class="home-svg-door" x="9.5" y="13.5" width="5" height="8.3" rx="1" fill="var(--accent-amber, #fbbf24)" fill-opacity="0.28"></rect>
      <circle class="home-svg-window" cx="12" cy="9.2" r="1.4" fill="var(--accent-cyan, #38bdf8)" stroke="none"></circle>
    </g>
    <g class="home-svg-roof-group" style="transform-origin: 12px 7px;">
      <path class="home-svg-chimney" d="M15.8 5.2V3.2h2.8v4.3" fill="rgba(15, 23, 42, 0.7)"></path>
      <path class="home-svg-roof" d="M2.2 11.2L12 2.8l9.8 8.4"></path>
    </g>
  </svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  footerVault: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 18 6 6 6 6 2"></polygon><rect x="3" y="6" width="18" height="16" rx="2"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`,
  calendar: `<svg width="11" height="11" viewBox="0 0 448 512" fill="currentColor" style="vertical-align: -1px; margin-right: 4px;"><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"/></svg>`,
  search: `<svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor" style="vertical-align: -1px; margin-right: 3px;"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>`,
  download: `<svg width="11" height="11" viewBox="0 0 512 512" fill="currentColor" style="vertical-align: -1px; margin-right: 3px; margin-left: 4px;"><path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"/></svg>`,
  bolt: `<svg width="11" height="11" viewBox="0 0 320 512" fill="currentColor" style="vertical-align: -1px; margin-right: 4px;"><path d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.3 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"/></svg>`,
  paypal: `<svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4.7-69.5-7-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.7-6.3 17.4-14.9.7-5.4-1.1 6.1 14.4-91.3 4.6-22 14.3-19.7 29.3-19.7 71 0 126.4-28.8 142.9-112.3 6.5-34.8 4.6-71.4-23.8-92.6z"/></svg>`,
  youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  globe: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; color: var(--accent-cyan);"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`
};

class VaultNavbar extends HTMLElement {
  connectedCallback() {
    const active = (this.getAttribute('active') || '').toLowerCase();

    const isHome = active === 'home' || active === 'workshop';
    const isProjects = active === 'projects' || active === 'special-projects';
    const isMods = active === 'mods' || active === 'catalog';
    const isBlog = active === 'blog' || active === 'archives';
    const isGuestbook = active === 'guestbook';
    const isDonate = active === 'donate';

    const currentThemeId = getStoredVaultTheme();
    const currentTheme = VAULT_THEMES.find(t => t.id === currentThemeId) || VAULT_THEMES[0];

    const currentLangId = getStoredVaultLanguage();
    const currentLang = VAULT_LANGUAGES.find(l => l.id === currentLangId) || VAULT_LANGUAGES[0];

    loadGoogleTranslateScript();

    this.innerHTML = `
      <header class="obsidian-topbar">
        <div class="container topbar-content">
          <div class="vault-brand-group">
            <a href="index.html" class="vault-brand" title="Home" aria-label="Home" style="text-decoration: none;">
              <span class="vault-icon">
                ${ICONS.vault}
              </span>
            </a>
            <a href="index.html" class="nav-link vault-home-link">Home</a>
          </div>

          <ul class="nav-links" id="vaultNavLinks">
            <li class="mobile-only-nav"><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="projects.html" class="nav-link ${isProjects ? 'active' : ''}">Projects</a></li>
            <li><a href="mods.html" class="nav-link ${isMods ? 'active' : ''}">All Mods</a></li>
            <li><a href="blog.html" class="nav-link ${isBlog ? 'active' : ''}">Blog</a></li>
            <li><a href="guestbook.html" class="nav-link ${isGuestbook ? 'active' : ''}">Guestbook</a></li>
            <li class="mobile-only-nav"><a href="index.html#donate" class="nav-link ${isDonate ? 'active' : ''}">Donate</a></li>
          </ul>

          <div class="topbar-actions notranslate">
            <a href="index.html#donate" class="nav-update-btn notranslate ${isDonate ? 'active' : ''}" title="Donate">
              <svg class="nav-update-heart" width="13" height="13" viewBox="0 0 24 24" fill="#dc2626">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>Donate</span>
            </a>

            <!-- Language Selector Dropdown -->
            <div class="vault-lang-picker notranslate" id="vaultLangPicker">
              <button type="button" class="lang-picker-btn notranslate" id="vaultLangBtn" aria-haspopup="true" aria-expanded="false" title="Translate Website (${currentLang.nativeName})">
                <span class="lang-active-icon notranslate">${ICONS.globe}</span>
                <span class="lang-active-label notranslate" id="langActiveLabel">${currentLang.shortName}</span>
                <svg class="lang-chevron notranslate" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="lang-dropdown-menu notranslate" id="langDropdownMenu" role="menu" aria-label="Language options">
                <div class="lang-dropdown-title notranslate">Translate Language</div>
                ${VAULT_LANGUAGES.map(l => `
                  <button type="button" class="lang-option notranslate ${l.id === currentLang.id ? 'active' : ''}" data-lang-id="${l.id}" role="menuitem">
                    <span class="lang-badge notranslate">${l.shortName}</span>
                    <div class="lang-labels notranslate">
                      <span class="lang-name notranslate">${l.nativeName}</span>
                      ${l.id !== 'en' ? `<span class="lang-subname notranslate">${l.name}</span>` : ''}
                    </div>
                    <span class="lang-check notranslate">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Theme Selector Dropdown -->
            <div class="vault-theme-picker notranslate" id="vaultThemePicker">
              <button type="button" class="theme-picker-btn notranslate" id="vaultThemeBtn" aria-haspopup="true" aria-expanded="false" title="Switch Vault Theme (${currentTheme.name})">
                <span class="theme-active-swatch notranslate" id="themeActiveSwatch" style="background: ${currentTheme.gradient};"></span>
                <span class="theme-active-label notranslate" id="themeActiveLabel">${currentTheme.name}</span>
                <svg class="theme-chevron notranslate" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="theme-dropdown-menu notranslate" id="themeDropdownMenu" role="menu" aria-label="Theme options">
                <div class="theme-dropdown-title notranslate">Vault Theme</div>
                ${VAULT_THEMES.map(t => `
                  <button type="button" class="theme-option notranslate ${t.id === currentTheme.id ? 'active' : ''}" data-theme-id="${t.id}" role="menuitem">
                    <span class="theme-swatch notranslate" style="background: ${t.gradient};"></span>
                    <span class="theme-name notranslate">${t.name}</span>
                    <span class="theme-check notranslate">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  </button>
                `).join('')}
              </div>
            </div>

            <button class="mobile-nav-toggle notranslate" id="vaultMobileNavToggle" aria-label="Toggle navigation">
              ${ICONS.menu}
            </button>
          </div>
        </div>
      </header>
    `;

    // JavaScript-Powered Animated RPG Home SVG Engine (Unboxed)
    const brandLink = this.querySelector('.vault-brand');
    const homeSvg = this.querySelector('.js-home-svg');
    const homeLink = this.querySelector('.vault-home-link');
    if (brandLink && homeSvg) {
      const puffs = Array.from(homeSvg.querySelectorAll('.smoke-puff'));
      const roofGroup = homeSvg.querySelector('.home-svg-roof-group');
      const door = homeSvg.querySelector('.home-svg-door');
      const atticWin = homeSvg.querySelector('.home-svg-window');

      let isHovered = false;
      let targetTilt = 0;
      let currentTilt = 0;
      let roofY = 0;
      let roofVy = 0;

      const onEnter = () => {
        isHovered = true;
        roofVy = -2.2;
      };
      const onLeave = () => {
        isHovered = false;
        targetTilt = 0;
      };

      brandLink.addEventListener('mouseenter', onEnter);
      brandLink.addEventListener('mouseleave', onLeave);
      if (homeLink) {
        homeLink.addEventListener('mouseenter', onEnter);
        homeLink.addEventListener('mouseleave', onLeave);
      }

      const animateHomeIcon = (now) => {
        const t = now * 0.001;
        const speed = isHovered ? 2.4 : 1.0;

        // 1. Rising Chimney Smoke / Rune Puffs
        puffs.forEach((puff, i) => {
          const cycle = (t * 0.65 * speed + i * 0.33) % 1;
          const cy = 3.8 - cycle * 6.8;
          const cx = 17.2 + Math.sin(t * 2.5 + i * 1.7) * (0.6 + cycle * 1.1);
          const r = 0.8 + cycle * 1.35;
          const alpha = Math.sin(cycle * Math.PI) * (isHovered ? 0.95 : 0.65);

          puff.setAttribute('cx', cx.toFixed(2));
          puff.setAttribute('cy', cy.toFixed(2));
          puff.setAttribute('r', r.toFixed(2));
          puff.setAttribute('opacity', Math.max(0, alpha).toFixed(2));
        });

        // 2. Spring Physics for Roof Hop & Cursor Tilt
        const stiffness = 0.18;
        const damping = 0.78;
        const targetRoofY = isHovered ? -1.4 : 0;
        roofVy = (roofVy + (targetRoofY - roofY) * stiffness) * damping;
        roofY += roofVy;
        currentTilt += (targetTilt - currentTilt) * 0.2;

        if (roofGroup) {
          roofGroup.style.transform = `translateY(${roofY.toFixed(2)}px) rotate(${(currentTilt * 0.45).toFixed(2)}deg)`;
        }
        homeSvg.style.transform = `rotate(${currentTilt.toFixed(2)}deg) scale(${isHovered ? 1.12 : 1})`;

        // 3. Cozy Pulsing Hearth Door & Attic Window Glow
        const hearthPulse = isHovered
          ? 0.65 + 0.25 * Math.sin(t * 8)
          : 0.24 + 0.12 * Math.sin(t * 2.5);
        if (door) {
          door.setAttribute('fill-opacity', hearthPulse.toFixed(2));
        }
        if (atticWin) {
          const winScale = isHovered ? 1.25 + 0.15 * Math.sin(t * 7) : 1 + 0.08 * Math.sin(t * 2);
          atticWin.setAttribute('r', (1.3 * winScale).toFixed(2));
        }

        requestAnimationFrame(animateHomeIcon);
      };
      requestAnimationFrame(animateHomeIcon);
    }

    // Built-in Mobile Nav toggle handler
    const toggle = this.querySelector('#vaultMobileNavToggle');
    const links = this.querySelector('#vaultNavLinks');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('mobile-open');
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('mobile-open');
        });
      });
    }

    // Built-in Theme Picker toggle and option selection
    const picker = this.querySelector('#vaultThemePicker');
    const themeBtn = this.querySelector('#vaultThemeBtn');
    if (picker && themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (langPicker) {
          langPicker.classList.remove('open');
          langBtn?.setAttribute('aria-expanded', 'false');
        }
        const isOpen = picker.classList.toggle('open');
        themeBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      picker.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetTheme = opt.getAttribute('data-theme-id');
          if (targetTheme) {
            applyVaultTheme(targetTheme);
          }
          picker.classList.remove('open');
          themeBtn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!picker.contains(e.target)) {
          picker.classList.remove('open');
          themeBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && picker.classList.contains('open')) {
          picker.classList.remove('open');
          themeBtn.setAttribute('aria-expanded', 'false');
          themeBtn.focus();
        }
      });
    }

    // Built-in Language Picker toggle and option selection
    const langPicker = this.querySelector('#vaultLangPicker');
    const langBtn = this.querySelector('#vaultLangBtn');
    if (langPicker && langBtn) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (picker) {
          picker.classList.remove('open');
          themeBtn?.setAttribute('aria-expanded', 'false');
        }
        const isOpen = langPicker.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      langPicker.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetLang = opt.getAttribute('data-lang-id');
          if (targetLang) {
            applyVaultLanguage(targetLang);
          }
          langPicker.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!langPicker.contains(e.target)) {
          langPicker.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && langPicker.classList.contains('open')) {
          langPicker.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
          langBtn.focus();
        }
      });
    }
  }
}
if (!customElements.get('vault-navbar')) {
  customElements.define('vault-navbar', VaultNavbar);
}

class CommunityBox extends HTMLElement {
  connectedCallback() {
    if (this.style) this.style.display = 'block';
    this.innerHTML = `
      <div class="community-box">
        <img src="assets/kyaro/moogles-and-mods.gif" alt="Moogles and Mods Discord" class="community-gif" loading="lazy">
        <div style="flex-grow: 1; min-width: 240px;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="tag tag-cyan">Community Hub</span>
            <span class="tag">Discord Hangout</span>
          </div>
          <h3 style="color: var(--text-pure-white, #fff); font-size: 1.2rem; margin: 0 0 0.35rem;">Moogles and Mods</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; margin: 0 0 0.75rem;">
            My hangout and testing server for classic RPG modding, texture overhauls, and troubleshooting. Drop in to say hello or report texture issues!
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="https://discord.gg/bSnpVBV" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>Join Moogles and Mods Discord &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
if (!customElements.get('community-box')) {
  customElements.define('community-box', CommunityBox);
}

class VaultFooter extends HTMLElement {
  connectedCallback() {
    if (this.style) this.style.display = 'block';
    const disclaimer = this.getAttribute('disclaimer') || this.getAttribute('note') ||
      'All games are copyright their respective creators (Square Enix, Konami, etc.). All modifications are unofficial, non-commercial fan creations.';

    this.innerHTML = `
      <footer class="obsidian-footer">
        <div class="container">
          <div class="footer-content">
            <community-box></community-box>

            <div class="footer-socials">
              <a href="https://www.nexusmods.com/profile/faospark" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="NexusMods Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </a>
              <a href="https://github.com/faospark/denoffao" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="GitHub Repository">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a href="https://bsky.app/profile/faospark.bsky.social" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="Bluesky Profile (@faospark.bsky.social)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.002 2.213-3.66 6.84 3.746 5.185 8.16-.38 8.653-3.08.494 2.7 4.908 8.265 8.653 3.08 3.342-4.627.252-6.26-3.66-6.84a8.68 8.68 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.687-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@faosparkNeo" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="YouTube Channel (@faosparkNeo)">
                ${ICONS.youtube}
              </a>
              <a href="https://paypal.me/thefaospark?country.x=PH&locale.x=en_US" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="Donate via PayPal">
                ${ICONS.paypal}
              </a>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="retro-counter-badge" id="denRetroCounter" title="Retro hit counter (Seeded by counters.csv)">
              <div class="retro-counter-label">
                <span class="retro-blinker"></span>
                <span>VISITOR NO.</span>
              </div>
              <div class="retro-odometer" id="retroOdometerDigits">
                <span class="retro-digit">0</span>
                <span class="retro-digit">0</span>
                <span class="retro-digit">0</span>
                <span class="retro-digit">0</span>
                <span class="retro-digit">0</span>
                <span class="retro-digit">0</span>
              </div>
            </div>
            <span>${disclaimer}</span>
            <button type="button" class="cookie-settings-btn" id="openCookieSettingsBtn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Cookie Preferences
            </button>
          </div>
        </div>
      </footer>
    `;

    // Initialize retro hit counter from counters.csv
    initRetroCounter(this);

    const prefsBtn = this.querySelector('#openCookieSettingsBtn');
    if (prefsBtn) {
      prefsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.showCookieConsentBanner === 'function') {
          window.showCookieConsentBanner(true);
        }
      });
    }
  }
}

/**
 * Initializes the retro mechanical hit counter using counters.csv base seeds,
 * deterministic time-based auto-growth, and localStorage visits (resets every +10,000 visits).
 */
function initRetroCounter(container) {
  const digitsEl = container.querySelector('#retroOdometerDigits');
  if (!digitsEl) return;

  let rawPage = window.location.pathname.split('/').pop() || 'index.html';
  if (!rawPage || rawPage === '/') rawPage = 'index.html';

  const renderDigits = (num) => {
    const padded = String(Math.max(0, num)).padStart(6, '0').slice(-6);
    digitsEl.innerHTML = padded.split('').map(d => `<span class="retro-digit">${d}</span>`).join('');
  };

  // Epoch anchor: Oct 20, 2026 00:00:00 UTC
  const EPOCH_MS = Date.UTC(2026, 9, 20, 0, 0, 0);
  const elapsedHours = Math.max(0, (Date.now() - EPOCH_MS) / (1000 * 60 * 60));

  const computeTotal = (baseCount) => {
    // Steady organic-looking growth (~24 to ~36 hits/day depending on page base weight)
    const hourlyRate = Math.max(0.8, Math.min(2.2, baseCount / 12000));
    const timeHits = Math.floor(elapsedHours * hourlyRate);

    const storageKey = `den_hits_${rawPage}`;
    let userHits = 0;
    try {
      userHits = parseInt(localStorage.getItem(storageKey) || '0', 10);
      userHits = ((userHits + 1) % 10000);
      localStorage.setItem(storageKey, userHits);
    } catch (e) {}

    // Reset accumulated visits every 10,000 visits
    const addedVisits = (timeHits + userHits) % 10000;
    return baseCount + addedVisits;
  };

  fetch('counters.csv')
    .then(res => {
      if (!res.ok) throw new Error('CSV not reachable');
      return res.text();
    })
    .then(text => {
      let baseCount = 18420;
      const lines = text.trim().split(/\r?\n/);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts[0] && parts[0].trim().toLowerCase() === rawPage.toLowerCase()) {
          baseCount = parseInt(parts[1], 10) || baseCount;
          break;
        }
      }

      renderDigits(computeTotal(baseCount));
    })
    .catch(() => {
      renderDigits(computeTotal(24890));
    });
}
if (!customElements.get('vault-footer')) {
  customElements.define('vault-footer', VaultFooter);
}
if (!customElements.get('site-footer')) {
  customElements.define('site-footer', class extends VaultFooter {});
}

/**
 * FF9_MODS_DATA — Catalog of all 10 Final Fantasy IX Kupo Mods
 */
const FF9_MODS_DATA = [
  {
    id: 31,
    title: "Kupo UI Suite Formerly Mog Addons",
    url: "https://www.nexusmods.com/finalfantasy9/mods/31",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Oct 11, 2026",
    image: "assets/mods/31-1730825135-2097256402.png",
    desc: "An extensive UI overhaul for Final Fantasy IX: modular dialogue boxes (Classic, Darker, Flat, Pixel Remaster), custom menu backgrounds (Pure Black, Tantalus, Chocobo), and title screen recreations.",
    badge: "Nexus Mods (#31)"
  },
  {
    id: 78,
    title: "Kupo Heroes Pack",
    url: "https://www.nexusmods.com/finalfantasy9/mods/78",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Sep 21, 2026",
    image: "assets/mods/78-1730460284-1844633571.png",
    desc: "Party character specialization overhaul: adds Zombie/Virus resistances, replaces Auto-Potion with HP/MP+5%, 3x High Jump for Freya, Save the Queen for Steiner, and expanded spell tiers for Vivi.",
    badge: "Nexus Mods (#78)"
  },
  {
    id: 74,
    title: "Modern Labels Plus",
    url: "https://www.nexusmods.com/finalfantasy9/mods/74",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Aug 15, 2026",
    image: "assets/mods/74-1730462893-1442620178.png",
    desc: "Modernized high-legibility interface typography, refreshed menu text labels, and clean item, spell, and command nomenclature across all game menus.",
    badge: "Nexus Mods (#74)"
  },
  {
    id: 81,
    title: "Kupo Buttons Pack",
    url: "https://www.nexusmods.com/finalfantasy9/mods/81",
    game: "Final Fantasy IX",
    category: "User Interface",
    date: "May 07, 2026",
    image: "assets/mods/81-1730815997-1860871365.png",
    desc: "One of the first COMPLETE controller button mods for FF9 with 6 distinct presets: DualSense PS5, PS Gloss (DS4), Simple PS (PSX), Pixels (PSX), Default Xbox, and SNES.",
    badge: "Nexus Mods (#81)"
  },
  {
    id: 80,
    title: "Kupo Portraits Pack",
    url: "https://www.nexusmods.com/finalfantasy9/mods/80",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Apr 27, 2026",
    image: "assets/mods/80-1791255451-606293076.png",
    desc: "High-detail character portrait presets for all playable heroes: Default Extended Cast (adding Kuja, Fratley, and Lani), PSX Upscaled portraits, and Dissidia Opera Omnia style.",
    badge: "Nexus Mods (#80)"
  },
  {
    id: 79,
    title: "No Exp Plus",
    url: "https://www.nexusmods.com/finalfantasy9/mods/79",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Nov 07, 2025",
    image: "assets/mods/79-1730465189-884409757.png",
    desc: "Flexible challenge mode modifier: choose between No EXP/AP gain, No EXP but gain AP (classic Level 1 challenge run), doubled EXP, or 8x EXP curve for hardcore progression.",
    badge: "Nexus Mods (#79)"
  },
  {
    id: 96,
    title: "Memoria Launcher Themes",
    url: "https://www.nexusmods.com/finalfantasy9/mods/96",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Oct 13, 2026",
    image: "assets/mods/96-1747010569-245924055.png",
    desc: "A collection of custom visual launcher themes for the Memoria Engine, giving your game launch window a tailored aesthetic.",
    badge: "Nexus Mods (#96)"
  },
  {
    id: 88,
    title: "Support ability cost modifier by Kupo Mods",
    url: "https://www.nexusmods.com/finalfantasy9/mods/88",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Oct 11, 2026",
    image: "assets/mods/88-1736790461-1074394076.png",
    desc: "The original 1-gem and halved-cost support ability modifier. Easy to use and simple to install — compatible with all major mod setups with no overwrites.",
    badge: "Nexus Mods (#88)"
  },
  {
    id: 87,
    title: "Kupo Tweaks",
    url: "https://www.nexusmods.com/finalfantasy9/mods/87",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Jan 14, 2025",
    image: "assets/mods/87-1736789445-1316131728.png",
    desc: "Quality-of-life progression and reward tuning: configurable 2x/4x/99x AP gain, 2x/4x/8x EXP gain, 2x/4x/8x Gil, and double item drops after battle.",
    badge: "Nexus Mods (#87)"
  },
  {
    id: 75,
    title: "Cursor Mod",
    url: "https://www.nexusmods.com/finalfantasy9/mods/75",
    game: "Final Fantasy IX",
    category: "Miscellaneous",
    date: "Oct 12, 2026",
    image: "assets/mods/75-1730462988-281935920.png",
    desc: "A set of clean, scaled-down high-definition cursors for the PC version replacing the oversized default pointer with responsive retro variants.",
    badge: "Nexus Mods (#75)"
  }
];

/**
 * FF9Mods — Native Web Component (<ff9-mods>)
 * Renders the 10 Final Fantasy IX Kupo Mods catalog grid with thumbnails,
 * metadata badges, descriptions, and lightbox support.
 */
class FF9Mods extends HTMLElement {
  connectedCallback() {
    const hideHeader = this.hasAttribute('no-header');
    const title = this.getAttribute('title') || 'Final Fantasy IX Kupo Mods (10)';
    const eyebrow = this.getAttribute('eyebrow') || 'Catalog Modules';
    const desc = this.getAttribute('desc') || 'Browse and download all 10 modular Kupo enhancements for Final Fantasy IX on PC.';

    const headerHtml = hideHeader ? '' : `
      <div class="section-header" style="margin-bottom: 1.5rem; text-align: left;">
        <span class="section-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          ${eyebrow}
        </span>
        <h2 class="section-title" style="font-size: 1.75rem; margin-top: 0.25rem;">${title}</h2>
        <p class="section-desc">${desc}</p>
      </div>
    `;

    const cardsHtml = FF9_MODS_DATA.map(mod => {
      const escapedTitle = mod.title.replace(/'/g, "\\'");
      return `
      <article class="mod-tile-card" data-category="ffix">
        <div class="mod-tile-thumb" onclick="if(window.openLightbox){openLightbox('${mod.image}', '${escapedTitle}')}">
          <img src="${mod.image}" alt="${mod.title}" loading="lazy" onerror="this.src='assets/forup_291x.png'">
          <div class="mod-tile-overlay-tags">
            <span class="tag tag-emerald">${ICONS.calendar} ${mod.date}</span>
          </div>
          <span class="preview-zoom-hint">${ICONS.search} Zoom</span>
        </div>
        <div class="mod-tile-body">
          <div>
            <div class="mod-tile-game">${mod.game}</div>
            <h4 class="mod-tile-title"><a href="${mod.url}" target="_blank" rel="noopener noreferrer">${mod.title}</a></h4>
            <p class="mod-tile-desc">${mod.desc}</p>
          </div>
          <div class="mod-tile-footer">
            <a href="${mod.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>View &amp; Download</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      </article>`;
    }).join('\n');

    this.innerHTML = `
      <div class="ff9-mods-component" style="margin-top: 1.5rem;">
        ${headerHtml}
        <div class="mods-grid-catalog">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
}

customElements.define('ff9-mods', FF9Mods);

if (!customElements.get('kupo-mods')) {
  customElements.define('kupo-mods', class extends FF9Mods {});
}

/**
 * FF6_MODS_DATA — Catalog of all 10 Final Fantasy VI Old Ver. Apocalypse / Sane Library Mods
 */
const FF6_MODS_DATA = [
  {
    id: 35,
    title: "Better Airship Sky Deck",
    url: "https://www.nexusmods.com/finalfantasy6/mods/35",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Visuals",
    date: "Jun 05, 2026",
    image: "assets/mods/35-1780641967-1134773491.png",
    desc: "Improves the overall colors, textures, and shading of the Sky Deck on both the Blackjack and The Falcon airships, removing dull washed-out palettes.",
    badge: "Nexus Mods (#35)",
    endorsements: "1",
    downloads: "22/24"
  },
  {
    id: 32,
    title: "Celes Scene Restoration for FF VI old ver",
    url: "https://www.nexusmods.com/finalfantasy6/mods/32",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Gameplay",
    date: "Apr 19, 2026",
    image: "assets/mods/32-1736879178-221967451.png",
    desc: "Restores the dramatic, uncut, and uncensored interrogation sequence with Celes in South Figaro for Final Fantasy VI Old Version.",
    badge: "Nexus Mods (#32)",
    endorsements: "21",
    downloads: "355/413"
  },
  {
    id: 27,
    title: "Launcher Resolution Fix and Remove Black Borders",
    url: "https://www.nexusmods.com/finalfantasy6/mods/27",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Miscellaneous",
    date: "Apr 30, 2026",
    image: "assets/mods/27-1713028584-1662905657.png",
    desc: "Eliminates pillarbox black borders, unlocks proper aspect ratios, and configures launcher resolutions cleanly for modern widescreen PC monitors.",
    badge: "Nexus Mods (#27)",
    endorsements: "33",
    downloads: "1k/1.2k"
  },
  {
    id: 26,
    title: "Sane World and Battle Bgs",
    url: "https://www.nexusmods.com/finalfantasy6/mods/26",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Visuals",
    date: "Apr 19, 2024",
    image: "assets/mods/26-1712151337-2077179522.png",
    desc: "The 2nd full world map overhaul for FFVI Old Ver. Restores cohesive, authentic battle backgrounds and overworld tilesets, eliminating bilinear blur in favor of crisp pixel fidelity.",
    badge: "Nexus Mods (#26)",
    endorsements: "37",
    downloads: "992/2.3k"
  },
  {
    id: 24,
    title: "Brave Steel Sane Alts and Fixes",
    url: "https://www.nexusmods.com/finalfantasy6/mods/24",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Visuals",
    date: "Mar 02, 2026",
    image: "assets/mods/24-1780765830-1770695584.png",
    desc: "Curated extension of the Brave Steel sprite overhaul, restoring sane character alternate outfits, color balances, and sprite alignments for Sabin, Shadow, and Terra.",
    badge: "Nexus Mods (#24)",
    endorsements: "35",
    downloads: "760/2.7k"
  },
  {
    id: 21,
    title: "Alternate Title Screen",
    url: "https://www.nexusmods.com/finalfantasy6/mods/21",
    game: "Final Fantasy VI (Old Ver.)",
    category: "User Interface",
    date: "Feb 04, 2025",
    image: "assets/mods/21-1687160962-1921886212.png",
    desc: "Replaces the sterile default mobile port screen with Yoshitaka Amano's ethereal concept artwork, custom typography, and atmospheric title music cues.",
    badge: "Nexus Mods (#21)",
    endorsements: "22",
    downloads: "476/765"
  },
  {
    id: 19,
    title: "Sane Ui",
    url: "https://www.nexusmods.com/finalfantasy6/mods/19",
    game: "Final Fantasy VI (Old Ver.)",
    category: "User Interface",
    date: "Sep 23, 2026",
    image: "assets/mods/19-1701241722-2005955359.png",
    desc: "The foundational Sane UI mod. Follows the principle of mobile UI removal while preserving modern crisp touches by Square, banishing oversized mobile touchscreen elements.",
    badge: "Nexus Mods (#19)",
    endorsements: "54",
    downloads: "1.4k/1.9k"
  },
  {
    id: 18,
    title: "Scaled Down Fonts",
    url: "https://www.nexusmods.com/finalfantasy6/mods/18",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Miscellaneous",
    date: "May 21, 2023",
    image: "assets/mods/18-1684653834-439638615.png",
    desc: "Proportional, crisp scaled-down font choices replacing oversized mobile lettering, restoring proper dialogue density and clean menu aesthetics.",
    badge: "Nexus Mods (#18)",
    endorsements: "18",
    downloads: "426/509"
  },
  {
    id: 17,
    title: "Grass or Green FIx FFVI Old ver",
    url: "https://www.nexusmods.com/finalfantasy6/mods/17",
    game: "Final Fantasy VI (Old Ver.)",
    category: "Visuals",
    date: "May 06, 2023",
    image: "assets/mods/17-1710759560-1918595346.png",
    desc: "Corrects the infamous radioactive neon-green grass and oversaturated overworld field palettes, restoring natural earthen tones true to the SNES original.",
    badge: "Nexus Mods (#17)",
    endorsements: "22",
    downloads: "459/766"
  },
  {
    id: 14,
    title: "Opera Omnia Style Portraits",
    url: "https://www.nexusmods.com/finalfantasy6/mods/14",
    game: "Final Fantasy VI (Old Ver.)",
    category: "User Interface",
    date: "Oct 28, 2022",
    image: "assets/mods/14-1701435488-1857475830.png",
    desc: "Complete character portrait overhaul inspired by Dissidia Final Fantasy Opera Omnia (DFFOO). 2 presets (A World Reborn & Remastered) with custom-curated chibi portraits for characters lacking official art.",
    badge: "Nexus Mods (#14)",
    endorsements: "25",
    downloads: "541/887"
  }
];

/**
 * ApocalypseMods / FF6Mods — Native Web Component (<apocalypse-mods>, <ff6-mods>)
 */
class ApocalypseMods extends HTMLElement {
  connectedCallback() {
    const hideHeader = this.hasAttribute('no-header');
    const title = this.getAttribute('title') || 'Apocalypse Library — FFVI Old Ver. (10 Mods)';
    const eyebrow = this.getAttribute('eyebrow') || 'The Sane Library of Mods';
    const desc = this.getAttribute('desc') || 'Browse and download all 10 curated modules of the Apocalypse Library for Final Fantasy VI Old Version on PC.';

    const headerHtml = hideHeader ? '' : `
      <div class="section-header" style="margin-bottom: 1.5rem; text-align: left;">
        <span class="section-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          ${eyebrow}
        </span>
        <h2 class="section-title" style="font-size: 1.75rem; margin-top: 0.25rem;">${title}</h2>
        <p class="section-desc">${desc}</p>
      </div>
    `;

    const cardsHtml = FF6_MODS_DATA.map(mod => {
      const escapedTitle = mod.title.replace(/'/g, "\\'");
      return `
      <article class="mod-tile-card" data-category="ffvi" data-mod-id="${mod.id}">
        <div class="mod-tile-thumb" onclick="if(window.openLightbox){openLightbox('${mod.image}', '${escapedTitle}')}">
          <img src="${mod.image}" alt="${mod.title}" loading="lazy" onerror="this.src='assets/forup_291x.png'">
          <div class="mod-tile-overlay-tags">
            <span class="tag tag-purple">${mod.category}</span>
            <span class="tag tag-emerald">${ICONS.star} ${mod.endorsements} | ${ICONS.download} ${mod.downloads}</span>
          </div>
          <span class="preview-zoom-hint">${ICONS.search} Zoom</span>
        </div>
        <div class="mod-tile-body">
          <div>
            <div class="mod-tile-game">${mod.game}</div>
            <h4 class="mod-tile-title"><a href="${mod.url}" target="_blank" rel="noopener noreferrer">${mod.title}</a></h4>
            <p class="mod-tile-desc">${mod.desc}</p>
          </div>
          <div class="mod-tile-footer">
            <a href="${mod.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>View &amp; Download</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      </article>`;
    }).join('\n');

    this.innerHTML = `
      <div class="apocalypse-mods-component" style="margin-top: 1.5rem;">
        ${headerHtml}
        <div class="mods-grid-catalog">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
}

customElements.define('apocalypse-mods', ApocalypseMods);
if (!customElements.get('ff6-mods')) {
  customElements.define('ff6-mods', class extends ApocalypseMods {});
}

/**
/**
 * ALL_MODS_DATA — Complete Catalog of all 68 Released Mods
 * Chronologically ordered by last updated date (Newest First)
 */
const ALL_MODS_DATA = [
  {
    "id": "saga-button-prompts",
    "title": "SagaButtonPrompts",
    "url": "https://github.com/faospark/SagaButtonPrompts",
    "game": "SaGa Frontier Remastered",
    "category": "other",
    "date": "Oct 25, 2026",
    "image": "assets/mods/saga-prompts-ps-color.jpg",
    "desc": "Custom in-game controller button prompt replacements for SaGa Frontier Remastered on PC. Press F9 in-game to cycle styles on-the-fly (PS4, PS5, PS1, Switch, Xbox).",
    "badge": "GitHub"
  },
  {
    "id": 6,
    "title": "Project Kyaro Suite",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/6",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Oct 14, 2026",
    "image": "assets/mods/6-1770657087-1226613141.png",
    "desc": "A BepInEx Plugin that is a Modding Suite Compatible with SuikodenFix",
    "badge": "Nexus Mods"
  },
  {
    "id": 96,
    "title": "Memoria Launcher Themes",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/96",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 13, 2026",
    "image": "assets/mods/96-1747010569-245924055.png",
    "desc": "A collection of custom visual launcher themes for the Memoria Engine, giving your game launch window a tailored aesthetic.",
    "badge": "Nexus Mods (#96)"
  },
  {
    "id": 75,
    "title": "Cursor Mod",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/75",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 12, 2026",
    "image": "assets/mods/75-1730462988-281935920.png",
    "desc": "A set of clean, scaled-down high-definition cursors for the PC version replacing the oversized default pointer with responsive retro variants.",
    "badge": "Nexus Mods (#75)"
  },
  {
    "id": 88,
    "title": "Support ability cost modifier by Kupo Mods",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/88",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 11, 2026",
    "image": "assets/mods/88-1736790461-1074394076.png",
    "desc": "The original 1-gem and halved-cost support ability modifier. Easy to use and simple to install — compatible with all major mod setups with no overwrites.",
    "badge": "Nexus Mods (#88)"
  },
  {
    "id": 80,
    "title": "Kupo Portraits Pack",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/80",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 10, 2026",
    "image": "assets/mods/80-1791255451-606293076.png",
    "desc": "High-detail character portrait presets for all playable heroes: Default Extended Cast (adding Kuja, Fratley, and Lani), PSX Upscaled portraits, and Dissidia Opera Omnia style.",
    "badge": "Nexus Mods (#80)"
  },
  {
    "id": 81,
    "title": "Kupo Buttons Pack",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/81",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 09, 2026",
    "image": "assets/mods/81-1730815997-1860871365.png",
    "desc": "One of the first COMPLETE controller button mods for FF9 with 6 distinct presets: DualSense PS5, PS Gloss (DS4), Simple PS (PSX), Pixels (PSX), Default Xbox, and SNES.",
    "badge": "Nexus Mods (#81)"
  },
  {
    "id": 35,
    "title": "Opera Omnia Style Portraits",
    "url": "https://www.nexusmods.com/finalfantasy2pixelremaster/mods/35",
    "game": "Final Fantasy II Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 22, 2026",
    "image": "assets/mods/35-1790041964-2025918709.png",
    "desc": "Opera Omnia (Chibii) style Portraits",
    "badge": "Nexus Mods"
  },
  {
    "id": 41,
    "title": "Darker UI FF6 PR",
    "url": "https://www.nexusmods.com/finalfantasy6pixelremaster/mods/41",
    "game": "Final Fantasy VI Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 12, 2026",
    "image": "assets/mods/41-1649149778-273543089.png",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 27,
    "title": "Darker UI FF5 PR",
    "url": "https://www.nexusmods.com/finalfantasy5pixelremaster/mods/27",
    "game": "Final Fantasy V Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 12, 2026",
    "image": "assets/mods/27-1668660181-489357470.jpeg",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue  and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 64,
    "title": "Darker UI FF4 PR",
    "url": "https://www.nexusmods.com/finalfantasyivpixelremaster/mods/64",
    "game": "Final Fantasy IV Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 12, 2026",
    "image": "assets/mods/64-1682695809-1860655684.png",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue  and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 39,
    "title": "Darker UI FF3 PR",
    "url": "https://www.nexusmods.com/finalfantasy3pixelremaster/mods/39",
    "game": "Final Fantasy III Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 11, 2026",
    "image": "assets/mods/39-1674633747-50730834.jpeg",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue  and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 36,
    "title": "Darker UI FF2 PR",
    "url": "https://www.nexusmods.com/finalfantasy2pixelremaster/mods/36",
    "game": "Final Fantasy II Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 11, 2026",
    "image": "assets/mods/36-1648482223-374314907.png",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue  and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 48,
    "title": "Darker UI FF1 PR",
    "url": "https://www.nexusmods.com/finalfantasypixelremaster/mods/48",
    "game": "Final Fantasy Pixel Remaster",
    "category": "ffpr",
    "date": "Sep 11, 2026",
    "image": "assets/mods/48-1648210068-960489217.png",
    "desc": "A Darker Ui build with HDR/Curves/ Levels in mind . replaces the vibrant blue  and game ui borders.",
    "badge": "Nexus Mods"
  },
  {
    "id": 24,
    "title": "Brave Steel Sane Alts and Fixes",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/24",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "Jun 7, 2026",
    "image": "assets/mods/24-1780765830-1770695584.png",
    "desc": "An Extension of the Brave Steel Sprites",
    "badge": "Nexus Mods"
  },
  {
    "id": 35,
    "title": "Better Airship Sky Deck",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/35",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "Jun 5, 2026",
    "image": "assets/mods/35-1780641967-1134773491.png",
    "desc": "Improves the overall colors of the Skydeck of the Blackjack and The Falcon",
    "badge": "Nexus Mods"
  },
  {
    "id": 26,
    "title": "Sane World and Battle Bgs",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/26",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "May 22, 2026",
    "image": "assets/mods/26-1712151337-2077179522.png",
    "desc": "This is the 2nd Full world map mod for final fantasy vi old ver.Originally Published on Moogles and Mods Discord Sever on July 2021 now moved to Nexusmods",
    "badge": "Nexus Mods"
  },
  {
    "id": 12,
    "title": "Alternate Portraits",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/12",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Mar 23, 2026",
    "image": "assets/mods/12-1747190297-486654413.png",
    "desc": "Just set of alternate portraits for the Remasters.",
    "badge": "Nexus Mods"
  },
  {
    "id": 17,
    "title": "Force PlayStation Button prompts on X-Input controllers",
    "url": "https://www.nexusmods.com/tombraidertrilogyremastered/mods/17",
    "game": "Tomb Raider I-III Remastered",
    "category": "other",
    "date": "Mar 13, 2026",
    "image": "assets/mods/17-1711028139-1070677378.png",
    "desc": "Forces Button prompts to show PlayStation buttons when using and xbox controller / X-input device",
    "badge": "Nexus Mods"
  },
  {
    "id": 63,
    "title": "CC Blue Mage",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/63",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Mar 8, 2026",
    "image": "assets/mods/63-1708857886-166988730.png",
    "desc": "The blue mage from another world.",
    "badge": "Nexus Mods"
  },
  {
    "id": 31,
    "title": "Kupo UI Suite Formerly Mog Addons",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/31",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Oct 11, 2026",
    "image": "assets/mods/31-1730825135-2097256402.png",
    "desc": "An extensive UI overhaul for Final Fantasy IX: modular dialogue boxes (Classic, Darker, Flat, Pixel Remaster), custom menu backgrounds (Pure Black, Tantalus, Chocobo), and title screen recreations.",
    "badge": "Nexus Mods (#31)"
  },
  {
    "id": 78,
    "title": "Kupo Heroes Pack",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/78",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Sep 21, 2026",
    "image": "assets/mods/78-1730460284-1844633571.png",
    "desc": "Party character specialization overhaul: adds Zombie/Virus resistances, replaces Auto-Potion with HP/MP+5%, 3x High Jump for Freya, Save the Queen for Steiner, and expanded spell tiers for Vivi.",
    "badge": "Nexus Mods (#78)"
  },
  {
    "id": 74,
    "title": "Modern Labels Plus",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/74",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Aug 15, 2026",
    "image": "assets/mods/74-1730462893-1442620178.png",
    "desc": "Modernized high-legibility interface typography, refreshed menu text labels, and clean item, spell, and command nomenclature across all game menus.",
    "badge": "Nexus Mods (#74)"
  },
  {
    "id": 12,
    "title": "Darker UI Lumi",
    "url": "https://www.nexusmods.com/pokemonbdsp/mods/12",
    "game": "Pokemon Brilliant Diamond and Shining Pearl",
    "category": "other",
    "date": "Dec 14, 2025",
    "image": "assets/mods/12-1692553607-451120380.png",
    "desc": "An addon Ui mod that transforms sections of the game's UI to have a set much darker colors. Features: Darker user interface for Battle (full revamp), Pokedex, Pokemon and Box viewsSwapped Window frame 1 and window frame 18 style making it",
    "badge": "Nexus Mods (#12)"
  },
  {
    "id": 16,
    "title": "Early Recruitment Patch",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/16",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Nov 24, 2025",
    "image": "assets/mods/16-1764002467-236365111.png",
    "desc": "Allow to recruit Tessai, Gantetsu , Genshu , LC Chan and more.Compatible to v1.0.3",
    "badge": "Nexus Mods (#16)"
  },
  {
    "id": 5,
    "title": "Suikoden Reworded Plus",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/5",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Nov 20, 2025",
    "image": "assets/mods/5-1746111158-488394244.png",
    "desc": "A partial retranslation of the game text combining old and new terminologies plus personal choices for the English Text. The mod also has some bonus text hints that will help with certain things in game.",
    "badge": "Nexus Mods (#5)"
  },
  {
    "id": 79,
    "title": "No Exp Plus",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/79",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Nov 07, 2025",
    "image": "assets/mods/79-1730465189-884409757.png",
    "desc": "Flexible challenge mode modifier: choose between No EXP/AP gain, No EXP but gain AP (classic Level 1 challenge run), doubled EXP, or 8x EXP curve for hardcore progression.",
    "badge": "Nexus Mods (#79)"
  },
  {
    "id": 18,
    "title": "Kraken Patch",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/18",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "May 18, 2025",
    "image": "assets/mods/18-1746327126-166158825.png",
    "desc": "Allows you to recruit Chuchara and along side with him Abizboah , Rulodia without Listening Crystals required and can be done even if you have Feather and Siegfried recruited",
    "badge": "Nexus Mods (#18)"
  },
  {
    "id": 2,
    "title": "Genso Force PSX Buttons",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/2",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "May 03, 2025",
    "image": "assets/mods/2-1741528640-827324825.png",
    "desc": "Forces PSX prompts to show while using Xinput controllers",
    "badge": "Nexus Mods (#2)"
  },
  {
    "id": 17,
    "title": "Open Paths Mod",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/17",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Apr 24, 2025",
    "image": "assets/mods/17-1745535249-663424833.png",
    "desc": "Removes rocks that block path way in Tinto Mines creating short cuts ,Plus Solves Puzzle Boulders in Cave of the mind making you not need to push the bouldersCompatible with v1.0.3",
    "badge": "Nexus Mods (#17)"
  },
  {
    "id": 1267,
    "title": "Suikoden I and II HD Remaster Basic Vortex Support",
    "url": "https://www.nexusmods.com/site/mods/1267",
    "game": "Modding Tools",
    "category": "suikoden",
    "date": "Apr 18, 2025",
    "image": "assets/mods/1267-1744934907-675657779.png",
    "desc": "Adds Basic Vortex Mod Manager for Suikoden I&II HD Remaster",
    "badge": "Nexus Mods (#1267)"
  },
  {
    "id": 14,
    "title": "True Matilda Glitch Restoration",
    "url": "https://www.nexusmods.com/suikoden1and2hdremaster/mods/14",
    "game": "Suikoden I&II HD Remaster",
    "category": "suikoden",
    "date": "Apr 10, 2025",
    "image": "assets/mods/14-1744294086-625319889.png",
    "desc": "Compatible to v1.0.4 , Matilda glitch restoration.. promise These 2 method works. see videos on on the mod page",
    "badge": "Nexus Mods (#14)"
  },
  {
    "id": 20,
    "title": "Monument - Landmark Retextures via Special K",
    "url": "https://www.nexusmods.com/eiyudenchronicle/mods/20",
    "game": "Eiyuden Chronicle: Hundred Heroes",
    "category": "other",
    "date": "Feb 28, 2025",
    "image": "assets/mods/20-1740734062-811123298.png",
    "desc": "Retextures for the Monuments/ landmark you built on your castle , Available options: Colored/ Painted, Iron Cast , and Gold-ish",
    "badge": "Nexus Mods (#20)"
  },
  {
    "id": 3,
    "title": "Force PSX Buttons",
    "url": "https://www.nexusmods.com/tombraidertrilogy2remastered/mods/3",
    "game": "Tomb Raider IV-VI Remastered",
    "category": "other",
    "date": "Feb 14, 2025",
    "image": "assets/mods/3-1739554737-163432188.png",
    "desc": "Force PSX buttons when using X-input controllers",
    "badge": "Nexus Mods (#3)"
  },
  {
    "id": 87,
    "title": "Kupo Tweaks",
    "url": "https://www.nexusmods.com/finalfantasy9/mods/87",
    "game": "Final Fantasy IX",
    "category": "ffix",
    "date": "Jan 14, 2025",
    "image": "assets/mods/87-1736789445-1316131728.png",
    "desc": "Quality-of-life progression and reward tuning: configurable 2x/4x/99x AP gain, 2x/4x/8x EXP gain, 2x/4x/8x Gil, and double item drops after battle.",
    "badge": "Nexus Mods (#87)"
  },
  {
    "id": 32,
    "title": "Celes Scene Restoration for FF VI old ver",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/32",
    "game": "Final Fantasy VI",
    "category": "ffvi",
    "date": "Jan 14, 2025",
    "image": "assets/mods/32-1736879178-221967451.png",
    "desc": "what was thought to be just theoretically possible is now officially can be done for this version: Full restoration of the original recruitment scene of Celes",
    "badge": "Nexus Mods (#32)"
  },
  {
    "id": 1045,
    "title": "Eiyuden Chronicle Hundred Heroes Vortex Support",
    "url": "https://www.nexusmods.com/site/mods/1045",
    "game": "Modding Tools",
    "category": "other",
    "date": "Sep 21, 2024",
    "image": "assets/mods/1045-1726915126-1534042977.png",
    "desc": "Basic support for Eiyuden Chronicle: Hundred Heroes",
    "badge": "Nexus Mods (#1045)"
  },
  {
    "id": 19,
    "title": "Sane Ui",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/19",
    "game": "Final Fantasy VI",
    "category": "ffvi",
    "date": "Jun 01, 2024",
    "image": "assets/mods/19-1701241722-2005955359.png",
    "desc": "An alternative UI for ffvi Old version",
    "badge": "Nexus Mods (#19)"
  },
  {
    "id": 27,
    "title": "Launcher Resolution Fix and Remove Black Borders",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/27",
    "game": "Final Fantasy VI",
    "category": "ffvi",
    "date": "Apr 13, 2024",
    "image": "assets/mods/27-1713028584-1662905657.png",
    "desc": "This mod does the ff: - removes the graphics filtering/shimmering upon camera movement - removes black borders in windowed mode - forces correct Pixel rendering by using the game's native 3:2 aspect ratio resulting in improved Visuals",
    "badge": "Nexus Mods (#27)"
  },
  {
    "id": 17,
    "title": "Grass or Green Fix FFVI Old ver",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/17",
    "game": "Final Fantasy VI",
    "category": "ffvi",
    "date": "Mar 26, 2024",
    "image": "assets/mods/17-1710759560-1918595346.png",
    "desc": "fixes the highlighter green color of the grass in the game (all are in world of balance)",
    "badge": "Nexus Mods (#17)"
  },
  {
    "id": 21,
    "title": "Alternate Title Screen",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/21",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "Mar 15, 2024",
    "image": "assets/mods/21-1687160962-1921886212.png",
    "desc": "Alternate title screens featuring artwork of Yoshitaka Amano",
    "badge": "Nexus Mods"
  },
  {
    "id": 66,
    "title": "CC Quality of life Stuff",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/66",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Feb 29, 2024",
    "image": "assets/mods/66-1709209583-1241278808.png",
    "desc": "Quality of Life Changes in game:Unlocking of missable Level 7 tech skills, Unlock Bend of time door Open on first game run,Obtain Floral Rod and Ghetz Shirt",
    "badge": "Nexus Mods"
  },
  {
    "id": 42,
    "title": "Opera Omnia Style Portraits FFVI",
    "url": "https://www.nexusmods.com/finalfantasy6pixelremaster/mods/42",
    "game": "Final Fantasy VI Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 27, 2024",
    "image": "assets/mods/42-1666784390-1834622958.png",
    "desc": "Ver. 1.1.0  ReadyOpera Omnia (Chibi) Style Portraits",
    "badge": "Nexus Mods"
  },
  {
    "id": 19,
    "title": "PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasypixelremaster/mods/19",
    "game": "Final Fantasy Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 14, 2024",
    "image": "assets/mods/19-1629940369-1354264523.png",
    "desc": "This allows you to change the stock game controller buttons in the game.  mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset - Compatible to all FF PR games",
    "badge": "Nexus Mods"
  },
  {
    "id": 78,
    "title": "FF6 PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasy6pixelremaster/mods/78",
    "game": "Final Fantasy VI Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 13, 2024",
    "image": "assets/mods/78-1683299362-1538541031.png",
    "desc": "Ver. 1.1.0  ReadyThis allows you to change the stock game controller buttons in the game. mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset- packed specific for FF65",
    "badge": "Nexus Mods"
  },
  {
    "id": 65,
    "title": "FF4 PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasyivpixelremaster/mods/65",
    "game": "Final Fantasy IV Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 13, 2024",
    "image": "assets/mods/65-1683295401-617587350.png",
    "desc": "This allows you to change the stock game controller buttons in the game. mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset- packed specific for FF4",
    "badge": "Nexus Mods"
  },
  {
    "id": 42,
    "title": "FF3 PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasy3pixelremaster/mods/42",
    "game": "Final Fantasy III Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 13, 2024",
    "image": "assets/mods/42-1683294252-1381667985.png",
    "desc": "This allows you to change the stock game controller buttons in the game. mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset.- packed specific for FF3",
    "badge": "Nexus Mods"
  },
  {
    "id": 49,
    "title": "FF2 PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasy2pixelremaster/mods/49",
    "game": "Final Fantasy II Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 13, 2024",
    "image": "assets/mods/49-1683292520-150327945.png",
    "desc": "This allows you to change the stock game controller buttons in the game. mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset- packed specific for FF2",
    "badge": "Nexus Mods"
  },
  {
    "id": 42,
    "title": "FF5 PR Buttons Mod Pack",
    "url": "https://www.nexusmods.com/finalfantasy5pixelremaster/mods/42",
    "game": "Final Fantasy V Pixel Remaster",
    "category": "ffpr",
    "date": "Feb 13, 2024",
    "image": "assets/mods/42-1683297724-1746199538.png",
    "desc": "This allows you to change the stock game controller buttons in the game. mod supports xinput controllers and PS4/PS5/Dinput for Playstation controller preset- packed specific for FF5",
    "badge": "Nexus Mods"
  },
  {
    "id": 240,
    "title": "PlayStation Controller Prompts for X-box (X-input) controllers (Use SpecialK approach for now)",
    "url": "https://www.nexusmods.com/finalfantasyxv/mods/240",
    "game": "Final Fantasy XV",
    "category": "other",
    "date": "Dec 2, 2023",
    "image": "assets/mods/240-1673704284-913198869.png",
    "desc": "Replaces X-Box button prompts (X-input) with Classic PlayStation prompts. Classic in a sense that that uses Start and Select instead of Options and Touchpad, initially built for Special K and converted for flagrum. Designed to be as close",
    "badge": "Nexus Mods"
  },
  {
    "id": 14,
    "title": "Opera Omnia Style Portraits",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/14",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "Dec 1, 2023",
    "image": "assets/mods/14-1701435488-1857475830.png",
    "desc": "Dissidia Final Fantasy Opera Omnia Style Portraits  (DFFOO Style Portraits)now has 2 presets. Originally Published on Moogles and Mods Discord Sever on July 2021",
    "badge": "Nexus Mods"
  },
  {
    "id": 62,
    "title": "HD Boat plus  Better world map",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/62",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Nov 17, 2023",
    "image": "assets/mods/62-1700166838-372295758.png",
    "desc": "An HD retexture of the Another world boat plus the world map it has to traverse",
    "badge": "Nexus Mods"
  },
  {
    "id": 18,
    "title": "Scaled Down Fonts",
    "url": "https://www.nexusmods.com/finalfantasy6/mods/18",
    "game": "Final Fantasy VI (Old Ver.)",
    "category": "ffvi",
    "date": "May 21, 2023",
    "image": "assets/mods/18-1684653834-439638615.png",
    "desc": "other font choices for the game",
    "badge": "Nexus Mods"
  },
  {
    "id": 45,
    "title": "2d Deck of Cards FF8-R",
    "url": "https://www.nexusmods.com/finalfantasy8remastered/mods/45",
    "game": "Final Fantasy VIII Remastered",
    "category": "other",
    "date": "May 12, 2023",
    "image": "assets/mods/45-1683820970-220151841.png",
    "desc": "A different artist for the cards .",
    "badge": "Nexus Mods"
  },
  {
    "id": 44,
    "title": "Better Portraits FF8-R",
    "url": "https://www.nexusmods.com/finalfantasy8remastered/mods/44",
    "game": "Final Fantasy VIII Remastered",
    "category": "other",
    "date": "May 11, 2023",
    "image": "assets/mods/44-1683818994-87676135.png",
    "desc": "a much less zoomed portraits",
    "badge": "Nexus Mods"
  },
  {
    "id": 43,
    "title": "Darker UI FF8 R",
    "url": "https://www.nexusmods.com/finalfantasy8remastered/mods/43",
    "game": "Final Fantasy VIII Remastered",
    "category": "other",
    "date": "May 11, 2023",
    "image": "assets/mods/43-1683815014-411422135.png",
    "desc": "This simple mod introduces alternative color schemes for the UI and dialogue boxes in the game.",
    "badge": "Nexus Mods"
  },
  {
    "id": 60,
    "title": "Dark Themed Launcher",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/60",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Mar 18, 2023",
    "image": "assets/mods/60-1679151222-268744768.png",
    "desc": "A dark water themed launcher",
    "badge": "Nexus Mods"
  },
  {
    "id": 54,
    "title": "CC Radical Portraits Plus",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/54",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Mar 4, 2023",
    "image": "assets/mods/54-1677913287-17872933.png",
    "desc": "Color corrections and rescaled Portraits",
    "badge": "Nexus Mods"
  },
  {
    "id": 59,
    "title": "CC Another Menu Ui",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/59",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Feb 26, 2023",
    "image": "assets/mods/59-1677424679-2122859578.png",
    "desc": "An alternate game background texture and UI",
    "badge": "Nexus Mods"
  },
  {
    "id": 3,
    "title": "PlayStation Buttons Pack",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/3",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Feb 22, 2023",
    "image": "assets/mods/3-1652607535-1431987563.png",
    "desc": "Changes the Xbox button prompts to PlayStation or PS4 and Soon PS5",
    "badge": "Nexus Mods"
  },
  {
    "id": 47,
    "title": "Alt Teleporter or Relief Charm Menu",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/47",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 26, 2022",
    "image": "assets/mods/47-1650973514-363301951.png",
    "desc": "Replaces the UI of the teleporter and relief charm Menu",
    "badge": "Nexus Mods"
  },
  {
    "id": 4,
    "title": "Another Eden Background",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/4",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 25, 2022",
    "image": "assets/mods/4-1649763978-1725861653.png",
    "desc": "Changes the basic blue gradient background for to Another Eden Portraits of Kid and Harle",
    "badge": "Nexus Mods"
  },
  {
    "id": 36,
    "title": "Another Eden Main Menu",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/36",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 22, 2022",
    "image": "assets/mods/36-1650605684-1906957612.png",
    "desc": "Alternate game start window inspired by a still from Another Eden Trailer  as well as tweaked out save/load boxes",
    "badge": "Nexus Mods"
  },
  {
    "id": 21,
    "title": "Alternate HUD Icons and Subtle Auto Save",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/21",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 17, 2022",
    "image": "assets/mods/21-1650083443-929578792.png",
    "desc": "Alternate Colorized HUD iconography for developer added functions and a much more subtle Auto Save icon Available on all languages",
    "badge": "Nexus Mods"
  },
  {
    "id": 18,
    "title": "Cross Window Sets",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/18",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 14, 2022",
    "image": "assets/mods/18-1649934108-1957880615.png",
    "desc": "An alternate set of window designs inspired a series of games that are bit familiar. This mod ALTERS  SIMPLE LINE window fame",
    "badge": "Nexus Mods"
  },
  {
    "id": 8,
    "title": "Old Face on New Graphics Mode (Vice Versa)",
    "url": "https://www.nexusmods.com/chronocrosstheradicaldreamersedition/mods/8",
    "game": "Chrono Cross: The Radical Dreamers Edition",
    "category": "chrono",
    "date": "Apr 13, 2022",
    "image": "assets/mods/8-1649800212-822838136.png",
    "desc": "Basically Swaps the Old portraits to be used in NEW graphic style and the NEW portraits on the Old Graphics Style",
    "badge": "Nexus Mods"
  },
  {
    "id": 129,
    "title": "Alternate Save Window",
    "url": "https://www.nexusmods.com/finalfantasyxx2hdremaster/mods/129",
    "game": "Final Fantasy X/X-2 HD Remaster",
    "category": "other",
    "date": "Jan 5, 2022",
    "image": "assets/mods/129-1641368272-662006574.png",
    "desc": "Just an alternate save Window",
    "badge": "Nexus Mods"
  },
  {
    "id": 26,
    "title": "PlayStation Button Prompts Via Special K",
    "url": "https://www.nexusmods.com/crashbandicootnsanetrilogy/mods/26",
    "game": "Crash Bandicoot N. Sane Trilogy",
    "category": "other",
    "date": "Nov 13, 2021",
    "image": "assets/mods/26-1636803674-766612600.png",
    "desc": "forces xinput controllers to use PlayStation Button Prompt via texture replacement of Special K.  this mod does not only use in game texture used for dinput but rather replaces it with a more closer aesthetic with the PS4 release of the",
    "badge": "Nexus Mods"
  }
];

/**
 * ModsCatalog — Native Web Component (<mods-catalog>)
 * Renders the complete 68-mod catalog with live instant search, category tabs,
 * auto-calculated counts, and lightbox modal support.
 */
class ModsCatalog extends HTMLElement {
  connectedCallback() {
    const rawLimit = parseInt(this.getAttribute('limit'), 10);
    const limit = (!isNaN(rawLimit) && rawLimit > 0) ? rawLimit : 0;
    const hideHeader = this.hasAttribute('no-header');
    const targetCategory = (this.getAttribute('category') || this.getAttribute('filter') || '').toLowerCase().trim();

    const sourceData = targetCategory ? ALL_MODS_DATA.filter(m => (m.category || '').toLowerCase() === targetCategory) : ALL_MODS_DATA;
    const displayedMods = limit > 0 ? sourceData.slice(0, limit) : sourceData;

    // Dynamically calculate category counts
    const counts = { all: sourceData.length };
    sourceData.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });

    let headerHtml = '';
    if (!hideHeader) {
      if (limit > 0) {
        headerHtml = `
          <div class="section-header">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="section-eyebrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  </svg>
                  Latest Mod Releases (Showing ${limit} of ${sourceData.length})
                </span>
                <h2 class="section-title">Recent Mod Updates</h2>
              </div>
              <a href="mods.html" class="btn btn-primary btn-lg" style="display: inline-flex; align-items: center; gap: 0.65rem; padding: 0.9rem 1.85rem; font-size: 1.1rem; font-weight: 700;">
                <span>Explore all</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
            <p class="section-desc">The newest mod releases and updates arranged chronologically. Looking for our complete collection? Visit the dedicated full library with instant search and category filters.</p>
          </div>
        `;
      } else {
        headerHtml = `
          <div class="section-header">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="section-eyebrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  </svg>
                  Complete Catalog (${sourceData.length} Mods)
                </span>
                <h2 class="section-title">All Released Modifications</h2>
              </div>
              <span class="tag tag-emerald font-mono">${ICONS.bolt} Sorted: Last Updated (Newest First)</span>
            </div>
            <p class="section-desc">Arranged chronologically by last update date. Search by name, game, category, or release year.</p>
          </div>
        `;
      }
    }

    const cardsHtml = displayedMods.map(mod => {
      const escapedTitle = (mod.title || '').replace(/'/g, "\\\'").replace(/"/g, '&quot;');
      const searchable = `${mod.title} ${mod.game} ${mod.category} ${mod.desc} ${mod.date}`.toLowerCase();
      return `
      <article class="mod-tile-card" data-category="${mod.category}" data-search="${searchable}">
        <div class="mod-tile-thumb" onclick="if(window.openLightbox){openLightbox('${mod.image}', '${escapedTitle}')}">
          <img src="${mod.image}" alt="${mod.title}" loading="lazy" onerror="this.src='assets/forup_291x.png'">
          <div class="mod-tile-overlay-tags">
            <span class="tag tag-emerald">${ICONS.calendar} ${mod.date}</span>
          </div>
          <span class="preview-zoom-hint">${ICONS.search} Zoom</span>
        </div>
        <div class="mod-tile-body">
          <div>
            <div class="mod-tile-game">${mod.game}</div>
            <h4 class="mod-tile-title"><a href="${mod.url}" target="_blank" rel="noopener noreferrer">${mod.title}</a></h4>
            <p class="mod-tile-desc">${mod.desc}</p>
          </div>
          <div class="mod-tile-footer">
            <a href="${mod.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>View &amp; Download</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      </article>`;
    }).join('\n');

    if (limit > 0) {
      this.innerHTML = `
        <div class="mods-catalog-wrapper">
          ${headerHtml}
          <div class="mods-grid-catalog" id="catalogGrid">
            ${cardsHtml}
          </div>
        </div>
      `;
      return;
    }

    const filterTabsHtml = targetCategory ? '' : `
      <div class="filter-tabs">
        <button class="filter-btn active" data-filter="all">All (${counts.all})</button>
        <button class="filter-btn" data-filter="chrono">Chrono Cross (${counts.chrono || 0})</button>
        <button class="filter-btn" data-filter="ffpr">Pixel Remasters (${counts.ffpr || 0})</button>
        <button class="filter-btn" data-filter="ffix">FFIX (${counts.ffix || 0})</button>
        <button class="filter-btn" data-filter="other">Other Remasters (${counts.other || 0})</button>
        <button class="filter-btn" data-filter="ffvi">FFVI Classic (${counts.ffvi || 0})</button>
        <button class="filter-btn" data-filter="suikoden">Suikoden (${counts.suikoden || 0})</button>
      </div>
    `;

    const searchPlaceholder = targetCategory === 'ffvi'
      ? 'Search FFVI Old Ver mods (e.g. Sane UI, Celes, Portraits, Backgrounds)...'
      : targetCategory === 'chrono'
      ? 'Search Chrono Cross mods (e.g. Portraits, Buttons, Another Eden, UI, QoL)...'
      : 'Search by mod name, game, category, or year (e.g. Kyaro, Kupo, Chrono, 2026)...';

    this.innerHTML = `
      <div class="mods-catalog-wrapper">
        ${headerHtml}

        <div class="search-bar-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="catalogSearchInput" class="search-input" placeholder="${searchPlaceholder}" autocomplete="off">
        </div>

        ${filterTabsHtml}

        <div class="mods-grid-catalog" id="catalogGrid">
          ${cardsHtml}
        </div>

        <div id="catalogNoResults" style="display: none; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.15rem;">No mods match your search query.</p>
          <button id="catalogResetBtn" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Clear Search</button>
        </div>
      </div>
    `;

    const searchInput = this.querySelector('#catalogSearchInput');
    const filterBtns = this.querySelectorAll('.filter-btn');
    const cards = this.querySelectorAll('.mod-tile-card');
    const noResults = this.querySelector('#catalogNoResults');
    const resetBtn = this.querySelector('#catalogResetBtn');

    let currentFilter = targetCategory || 'all';
    let currentQuery = '';

    const applyFilter = () => {
      let visible = 0;
      const q = currentQuery.toLowerCase().trim();

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const text = card.getAttribute('data-search') || '';

        const matchCat = targetCategory ? (cat === targetCategory) : (currentFilter === 'all' || cat === currentFilter);
        const matchQuery = (!q || text.includes(q));

        if (matchCat && matchQuery) {
          card.style.display = 'flex';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value;
        applyFilter();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentQuery = '';
        currentFilter = targetCategory || 'all';
        filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
        applyFilter();
      });
    }
  }
}

customElements.define('mods-catalog', ModsCatalog);
if (!customElements.get('all-mods')) {
  customElements.define('all-mods', class extends ModsCatalog {});
}

/**
 * BackToTop Component (<back-to-top>)
 * Clean circular floating button that appears on scroll and smoothly returns to the top
 */
class BackToTop extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button class="back-to-top-btn" id="backToTopBtn" type="button" aria-label="Back to top" title="Back to top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    `;

    const btn = this.querySelector('#backToTopBtn');

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollY > 280) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

if (!customElements.get('back-to-top')) {
  customElements.define('back-to-top', BackToTop);
}

// Automatically mount back-to-top on pages that import components.js if not explicitly present
if (typeof document !== 'undefined') {
  const mountBackToTop = () => {
    if (!document.querySelector('back-to-top') && document.body) {
      const el = document.createElement('back-to-top');
      document.body.appendChild(el);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountBackToTop);
  } else {
    mountBackToTop();
  }
}

// ========================================================
// Google Analytics 4 (gtag.js) & EU Cookie Consent Manager
// Measurement ID: G-BMED35LCVS
// Fully compliant with EU GDPR / ePrivacy & Google Consent Mode v2
// ========================================================
(function() {
  if (typeof window === 'undefined' || window.__gaInitialized) return;
  window.__gaInitialized = true;

  const GA_MEASUREMENT_ID = 'G-BMED35LCVS';
  const CONSENT_STORAGE_KEY = 'den_cookie_consent';

  // 1. Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };

  // 2. Read existing user consent preference (null if first visit)
  let savedConsent = null;
  try {
    savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch (e) {}

  const isGranted = savedConsent === 'granted';

  // 3. Google Consent Mode v2 — Set default consent state BEFORE gtag('config')
  // Under EU GDPR, non-essential cookies must be 'denied' until the user affirmatively accepts.
  window.gtag('consent', 'default', {
    'analytics_storage': isGranted ? 'granted' : 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  // 4. Check for local development (XAMPP / file protocol)
  const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) ||
                  window.location.protocol === 'file:';

  if (isLocal) {
    console.info(`[Analytics] Running locally (${window.location.hostname || 'file'}). Tracking paused to protect live metrics.`);
  } else {
    // Inject official Google gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true
    });
  }

  // 5. Update user consent preference (called on Accept / Decline)
  window.updateCookieConsent = function(grant) {
    const status = grant ? 'granted' : 'denied';
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch (e) {}

    window.gtag('consent', 'update', {
      'analytics_storage': status
    });

    const banner = document.getElementById('denCookieBanner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 300);
    }
  };

  // 6. Show or hide cookie banner (force=true opens it from footer link anytime)
  window.showCookieConsentBanner = function(force = false) {
    const banner = document.getElementById('denCookieBanner');
    if (!banner) return;

    let current = null;
    try {
      current = localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch (e) {}

    if (force || !current) {
      banner.style.display = 'block';
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });
    } else {
      banner.classList.remove('visible');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 300);
    }
  };

  // 7. Mount banner into DOM
  const mountCookieBanner = () => {
    if (document.getElementById('denCookieBanner') || !document.body) return;

    const banner = document.createElement('div');
    banner.id = 'denCookieBanner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Privacy and Cookie Preferences');
    banner.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-header">
          <div class="cookie-title-group">
            <svg class="cookie-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span class="cookie-title">Privacy &amp; Cookie Preferences</span>
          </div>
          <span class="cookie-badge">EU / GDPR</span>
        </div>
        <p class="cookie-desc">
          We use lightweight, anonymized Google Analytics cookies to track mod downloads and site traffic. No personal advertising or commercial trackers are used.
        </p>
        <div class="cookie-actions">
          <button type="button" class="btn btn-primary btn-sm cookie-btn-accept" id="btnAcceptCookies">
            <span>Accept All</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm cookie-btn-decline" id="btnDeclineCookies">
            <span>Essential Only</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    const btnAccept = banner.querySelector('#btnAcceptCookies');
    const btnDecline = banner.querySelector('#btnDeclineCookies');

    if (btnAccept) {
      btnAccept.addEventListener('click', () => window.updateCookieConsent(true));
    }
    if (btnDecline) {
      btnDecline.addEventListener('click', () => window.updateCookieConsent(false));
    }

    window.showCookieConsentBanner(false);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCookieBanner);
  } else {
    mountCookieBanner();
  }
})();

// ========================================================
// Consolidated Global Lightbox / Image Modal Component
// Provides unified openLightbox() & closeLightbox() for all pages
// Automatically handles DOM mounting, event delegation, and Escape key
// ========================================================
(function() {
  if (typeof window === 'undefined') return;

  function ensureLightboxModal() {
    let modal = document.getElementById('lightboxModal') || document.getElementById('imageModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightboxModal';
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <div class="lightbox-content">
          <button type="button" class="lightbox-close" aria-label="Close image preview">&times;</button>
          <img id="lightboxImg" src="" alt="Enlarged Preview">
          <p id="lightboxCaption" class="lightbox-caption"></p>
        </div>
      `;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function getLightboxElements() {
    const modal = ensureLightboxModal();
    const img = modal.querySelector('img') || document.getElementById('lightboxImg') || document.getElementById('modalImage');
    const caption = modal.querySelector('.lightbox-caption, .image-modal-caption') || document.getElementById('lightboxCaption') || document.getElementById('modalCaption');
    const closeBtn = modal.querySelector('.lightbox-close, .image-modal-close');
    return { modal, img, caption, closeBtn };
  }

  function openLightbox(src, captionText) {
    if (!src) return;
    const { modal, img, caption } = getLightboxElements();
    if (img) {
      img.src = src;
      img.alt = captionText || 'Preview';
    }
    if (caption) {
      caption.textContent = captionText || '';
      caption.style.display = captionText ? '' : 'none';
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(event) {
    const { modal, img, caption } = getLightboxElements();
    if (event && (event.target === img || event.target === caption)) {
      return;
    }
    closeLightboxDirect();
  }

  function closeLightboxDirect() {
    const modal = document.getElementById('lightboxModal') || document.getElementById('imageModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function setupLightboxEvents() {
    const modal = ensureLightboxModal();

    modal.addEventListener('click', (e) => {
      const img = modal.querySelector('img') || document.getElementById('lightboxImg') || document.getElementById('modalImage');
      const caption = modal.querySelector('.lightbox-caption, .image-modal-caption') || document.getElementById('lightboxCaption') || document.getElementById('modalCaption');
      if (e.target === img || e.target === caption) return;
      closeLightboxDirect();
    });

    const closeBtn = modal.querySelector('.lightbox-close, .image-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightboxDirect();
      });
    }

    // Prevent parent <a target="_blank"> links from opening a new browser tab
    // when clicking an image that triggers the lightbox
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const lightboxEl = target.closest('[onclick*="openLightbox"], [onclick*="openModal"], .blog-embedded-img');
      if (lightboxEl) {
        const parentAnchor = lightboxEl.closest('a[href]');
        if (parentAnchor) {
          e.preventDefault();
          if (lightboxEl.tagName === 'IMG' && !lightboxEl.hasAttribute('onclick') && !parentAnchor.hasAttribute('onclick')) {
            openLightbox(lightboxEl.src, lightboxEl.alt || 'Blog Image');
          }
        }
      }
    });
  }

  // Global Escape key support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('lightboxModal') || document.getElementById('imageModal');
      if (modal && modal.classList.contains('active')) {
        closeLightboxDirect();
      }
    }
  });

  // Expose global methods
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.closeLightboxDirect = closeLightboxDirect;

  // Compatibility aliases
  window.openModal = openLightbox;
  window.closeModal = closeLightbox;
  window.closeModalDirect = closeLightboxDirect;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLightboxEvents);
  } else {
    setupLightboxEvents();
  }
})();


