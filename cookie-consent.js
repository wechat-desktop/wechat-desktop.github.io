/* cookie-consent.js — simple, no-deps consent banner with Google Consent Mode v2
   Place at: /cookie-consent.js
   Add to <head> BEFORE GA4:
   <script src="/cookie-consent.js?v=1" defer></script>
   Update GA snippet to wait for consent (this script sets default denied, then user grants).
*/

(function(){
  const KEY = 'cc-consent-v2';
  const ONE_YEAR = 365*24*60*60*1000;

  // Utility: read/write consent state
  function getConsent(){
    try{ return JSON.parse(localStorage.getItem(KEY) || 'null'); }catch(e){ return null }
  }
  function setConsent(state){
    const payload = { ...state, ts: Date.now() };
    try{ localStorage.setItem(KEY, JSON.stringify(payload)); }catch(e){}
  }
  function isExpired(ts){ return !ts || (Date.now() - ts) > ONE_YEAR; }

  // Inject banner HTML
  function injectBanner(){
    const html = `
    <div id="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div class="cc-container">
        <div class="cc-text">
          <strong>We use cookies</strong>. We use cookies to analyze traffic and improve this site. You can accept or reject analytics cookies. Essential cookies always on. See our <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          <div class="cc-manage">Not affiliated with WeChat or Tencent.</div>
        </div>
        <div class="cc-actions">
          <button class="cc-btn secondary" id="cc-reject">Reject</button>
          <button class="cc-btn" id="cc-accept">Accept</button>
        </div>
      </div>
    </div>`;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstElementChild);
    requestAnimationFrame(()=>document.getElementById('cookie-banner').classList.add('is-visible'));
  }

  // Google Consent Mode v2 helpers
  function ensureGtag(){
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  }
  function setDefaultDenied(){
    ensureGtag();
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }
  function grantAll(){
    ensureGtag();
    gtag('consent', 'update', {
      'ad_storage': 'granted',
      'analytics_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  }
  function denyAll(){
    ensureGtag();
    gtag('consent', 'update', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function(){
    // 1) Set default denied before GA loads (GA should be placed after this script)
    setDefaultDenied();

    // 2) Read saved consent
    const saved = getConsent();
    if(saved && !isExpired(saved.ts)){
      if(saved.choice === 'accept') grantAll();
      // If saved choice was reject, we keep default denied
      return; // no banner
    }

    // 3) No saved or expired -> show banner
    injectBanner();

    // 4) Wire buttons
    document.getElementById('cc-accept').addEventListener('click', function(){
      setConsent({ choice: 'accept' });
      grantAll();
      const banner = document.getElementById('cookie-banner');
      banner.classList.remove('is-visible');
      setTimeout(()=>banner.remove(), 300);
    });
    document.getElementById('cc-reject').addEventListener('click', function(){
      setConsent({ choice: 'reject' });
      denyAll();
      const banner = document.getElementById('cookie-banner');
      banner.classList.remove('is-visible');
      setTimeout(()=>banner.remove(), 300);
    });
  });
})();