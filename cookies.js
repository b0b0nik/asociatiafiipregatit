(function () {
  const GA_ID = "G-096NM6VP9W";
  const COOKIE_NAME = "afp_cookie_consent";
  const COOKIE_DAYS = 180;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }

    return "";
  }

  function setCookie(name, value, days) {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toUTCString();

    document.cookie =
      `${name}=${value}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  }

  function deleteCookie(name) {
    document.cookie =
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure`;
  }

  function deleteAnalyticsCookies() {
    const cookies = document.cookie.split(";");

    cookies.forEach(function (cookie) {
      const cookieName = cookie.split("=")[0].trim();

      if (cookieName === "_ga" || cookieName.startsWith("_ga_")) {
        deleteCookie(cookieName);
      }
    });
  }



  function withdrawAnalytics() {
    // Stop sending GA hits immediately, even when its script was already loaded.
    window["ga-disable-" + GA_ID] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {analytics_storage: "denied"});
    }
    window.__afpAnalyticsReady = false;
    deleteAnalyticsCookies();
    window.dispatchEvent(new Event("afp-analytics-revoked"));
  }

  function loadGoogleAnalytics() {
    if (window.__afpAnalyticsLoaded) {
      window["ga-disable-" + GA_ID] = false;
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {analytics_storage: "granted"});
        if (window.__afpScriptReady) {
          window.gtag("config", GA_ID, {anonymize_ip: true});
          window.__afpAnalyticsReady = true;
          window.dispatchEvent(new Event("afp-analytics-ready"));
        }
      }
      return;
    }

    window["ga-disable-" + GA_ID] = false;

    window.__afpAnalyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("consent", "update", {analytics_storage: "granted"});
    window.gtag("js", new Date());

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

    script.onload = function () {
      window.__afpScriptReady = true;
      if (getCookie(COOKIE_NAME) !== "accepted") return;
      window.gtag("config", GA_ID, {anonymize_ip: true});
      window.__afpAnalyticsReady = true;
      window.dispatchEvent(new Event("afp-analytics-ready"));
    };
    script.onerror = function () {
      window.__afpAnalyticsLoaded = false;
      window.__afpScriptReady = false;
      window.__afpAnalyticsReady = false;
    };

    document.head.appendChild(script);
  }

  function removeBanner() {
    const banner = document.getElementById("afpCookieBanner");

    if (banner) {
      banner.remove();
    }
  }

  function showBanner() {
    if (document.getElementById("afpCookieBanner")) return;

    const banner = document.createElement("div");

    banner.id = "afpCookieBanner";

    banner.innerHTML = `
      <div class="afp-cookie-card" role="dialog" aria-modal="false" aria-labelledby="afpCookieTitle">

        <div class="afp-cookie-icon">
          <i class="ti ti-cookie"></i>
        </div>

        <div class="afp-cookie-content">
          <h2 id="afpCookieTitle">Cookie-uri analitice</h2>

          <p>
            Folosim Google Analytics pentru statistici despre vizitarea site-ului.
            Poți accepta sau refuza — accesul la site și la înscriere nu este afectat.
          </p>

          <a href="/cookies/" class="afp-cookie-link">
            Politica de cookies
          </a>
        </div>

        <div class="afp-cookie-actions">
          <button type="button" class="afp-cookie-refuse" id="afpCookieRefuse">
            Refuz
          </button>

          <button type="button" class="afp-cookie-accept" id="afpCookieAccept">
            Accept
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(banner);

    document
      .getElementById("afpCookieAccept")
      .addEventListener("click", function () {
        setCookie(COOKIE_NAME, "accepted", COOKIE_DAYS);
        loadGoogleAnalytics();
        removeBanner();
      });

    document
      .getElementById("afpCookieRefuse")
      .addEventListener("click", function () {
        setCookie(COOKIE_NAME, "refused", COOKIE_DAYS);
        withdrawAnalytics();
        removeBanner();
      });
  }

  function addPreferencesButton() {
    if (document.getElementById("afpCookiePreferences")) return;

    const button = document.createElement("button");

    button.id = "afpCookiePreferences";
    button.type = "button";
    button.setAttribute("aria-label", "Preferințe cookie");

    button.innerHTML = `
      <i class="ti ti-cookie"></i>
      <span>Cookie-uri</span>
    `;

    button.addEventListener("click", function () {
      deleteCookie(COOKIE_NAME);
      withdrawAnalytics();
      showBanner();
    });

    document.body.appendChild(button);
  }

  function addSocialButtons() {
    if (document.getElementById("afpSocialDock")) return;

    const socialDock = document.createElement("div");

    socialDock.id = "afpSocialDock";

    socialDock.innerHTML = `
      <a
        href="https://wa.me/40745482705"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp Fii Pregătit"
        title="WhatsApp"
        class="afp-social-btn afp-whatsapp-btn"
      >
        <i class="ti ti-brand-whatsapp"></i>
      </a>

      <a
        href="https://www.instagram.com/fiipregatit.bv/"
        target="_blank"
        rel="noopener"
        aria-label="Instagram Fii Pregătit"
        title="Instagram"
        class="afp-social-btn afp-instagram-btn"
      >
        <i class="ti ti-brand-instagram"></i>
      </a>

      <a
        href="https://www.facebook.com/fiipregatit.bv/"
        target="_blank"
        rel="noopener"
        aria-label="Facebook Fii Pregătit"
        title="Facebook"
        class="afp-social-btn afp-facebook-btn"
      >
        <i class="ti ti-brand-facebook"></i>
      </a>
    `;

    document.body.appendChild(socialDock);
  }

  function replaceBrandLine() {
    const replacements = [
      ["Educație · Sănătate · Siguranță", "Siguranță · Sănătate · Educație"],
      ["Educație • Sănătate • Siguranță", "Siguranță • Sănătate • Educație"],
      ["EDUCAȚIE · SĂNĂTATE · SIGURANȚĂ", "SIGURANȚĂ · SĂNĂTATE · EDUCAȚIE"],
      ["EDUCAȚIE • SĂNĂTATE • SIGURANȚĂ", "SIGURANȚĂ • SĂNĂTATE • EDUCAȚIE"]
    ];

    function replaceInString(value) {
      let updated = value;

      replacements.forEach(function (pair) {
        updated = updated.split(pair[0]).join(pair[1]);
      });

      return updated;
    }

    if (document.body) {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      const textNodes = [];
      let node;

      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      textNodes.forEach(function (textNode) {
        const updated = replaceInString(textNode.nodeValue || "");

        if (updated !== textNode.nodeValue) {
          textNode.nodeValue = updated;
        }
      });
    }

    document.querySelectorAll("meta[content]").forEach(function (meta) {
      const current = meta.getAttribute("content") || "";
      const updated = replaceInString(current);

      if (updated !== current) {
        meta.setAttribute("content", updated);
      }
    });
  }

  function normalizePillarsSection() {
    const grid = document.querySelector(".pillars-grid");
    if (!grid) return;

    const section = grid.closest("section");
    if (!section) return;

    const eyebrow = section.querySelector(".eb");
    if (!eyebrow || eyebrow.textContent.trim() !== "Pilonii noștri") return;

    const title = section.querySelector("h2.t");
    if (title) {
      title.textContent = "Siguranță · Sănătate · Educație";
    }

    const intro = section.querySelector("div[style*='text-align:center'] p");
    if (intro) {
      intro.textContent = intro.textContent
        .replace("educație, sănătate și siguranță", "siguranță, sănătate și educație");
    }

    const cards = Array.from(grid.children);
    const order = {
      "siguranță": 0,
      "sănătate": 1,
      "educație": 2
    };

    cards
      .sort(function (a, b) {
        const aTitle = (a.querySelector("h3")?.textContent || "").trim().toLowerCase();
        const bTitle = (b.querySelector("h3")?.textContent || "").trim().toLowerCase();
        return (order[aTitle] ?? 99) - (order[bTitle] ?? 99);
      })
      .forEach(function (card) {
        grid.appendChild(card);
      });
  }

  function injectStyles() {
    const style = document.createElement("style");

    style.textContent = `
      #afpCookieBanner{
        position:fixed;
        left:18px;
        right:18px;
        bottom:18px;
        z-index:9999;
        display:flex;
        justify-content:center;
        pointer-events:none;
      }

      .afp-cookie-card{
        width:min(820px,100%);
        display:grid;
        grid-template-columns:auto 1fr auto;
        gap:14px;
        align-items:center;
        background:#ffffff;
        border:1px solid #e6e0d2;
        border-left:4px solid #ff5502;
        box-shadow:0 14px 38px rgba(0,0,0,.18);
        border-radius:12px;
        padding:14px 16px;
        pointer-events:auto;
      }

      .afp-cookie-icon{
        width:38px;
        height:38px;
        display:flex;
        align-items:center;
        justify-content:center;
        flex:0 0 auto;
        background:#f4efe4;
        color:#ff5502;
        border-radius:50%;
        font-size:18px;
      }

      .afp-cookie-content h2{
        margin:0 0 3px;
        color:#1b340c;
        font-family:'Fraunces',Georgia,serif;
        font-size:18px;
        line-height:1.15;
      }

      .afp-cookie-content p{
        margin:0;
        color:#4c5440;
        font-size:12px;
        line-height:1.45;
      }

      .afp-cookie-link{
        display:inline-block;
        margin-top:4px;
        color:#ff5502;
        font-size:11.5px;
        font-weight:700;
        text-decoration:none;
      }

      .afp-cookie-link:hover{
        text-decoration:underline;
      }

      .afp-cookie-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .afp-cookie-actions button{
        border-radius:6px;
        padding:9px 12px;
        font-family:inherit;
        font-size:12px;
        font-weight:700;
        cursor:pointer;
        transition:.2s;
      }

      .afp-cookie-refuse{
        background:#fff;
        color:#1b340c;
        border:1px solid #cdd6bd;
      }

      .afp-cookie-refuse:hover{
        border-color:#ff5502;
        color:#ff5502;
      }

      .afp-cookie-accept{
        background:#ff5502;
        color:#fff;
        border:1px solid #ff5502;
      }

      .afp-cookie-accept:hover{
        background:#e64d02;
        border-color:#e64d02;
      }

      #afpCookiePreferences{
        position:fixed;
        right:16px;
        bottom:16px;
        z-index:9998;
        display:flex;
        align-items:center;
        gap:7px;
        background:#1b340c;
        color:#fff;
        border:1px solid rgba(255,255,255,.2);
        border-radius:999px;
        padding:9px 13px;
        font-family:inherit;
        font-size:12px;
        font-weight:700;
        box-shadow:0 8px 20px rgba(0,0,0,.18);
        cursor:pointer;
      }

      #afpCookiePreferences:hover{
        background:#10380e;
      }

      #afpCookiePreferences i{
        color:#ff7a1f;
        font-size:16px;
      }

      #afpSocialDock{
        position:fixed;
        right:18px;
        bottom:60px;
        z-index:9997;
        display:flex;
        flex-direction:column;
        gap:9px;
      }

      .afp-social-btn{
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        color:#fff;
        text-decoration:none;
        font-size:17px;
        box-shadow:0 7px 16px rgba(0,0,0,.18);
        transition:transform .2s ease, box-shadow .2s ease;
      }

      .afp-social-btn:hover{
        transform:translateY(-3px) scale(1.06);
        box-shadow:0 11px 22px rgba(0,0,0,.24);
      }

      .afp-whatsapp-btn{
        background:#25D366;
      }

      .afp-instagram-btn{
        background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);
      }

      .afp-facebook-btn{
        background:#1877f2;
      }

      @media(min-width:761px){
        #afpCookiePreferences{
          right:18px;
          bottom:16px;
          padding:7px 11px;
          font-size:11px;
          gap:6px;
        }

        #afpCookiePreferences i{
          font-size:14px;
        }
      }

      @media(max-width:760px){
        #afpCookieBanner{
          left:12px;
          right:12px;
          bottom:12px;
        }

        .afp-cookie-card{
          display:block;
          padding:15px;
        }

        .afp-cookie-icon{
          margin-bottom:9px;
        }

        .afp-cookie-actions{
          justify-content:stretch;
          margin-top:14px;
        }

        .afp-cookie-actions button{
          flex:1;
        }

        #afpCookiePreferences{
          right:12px;
          bottom:12px;
        }

        #afpSocialDock{
          right:16px;
          bottom:62px;
          gap:8px;
        }

        .afp-social-btn{
          width:34px;
          height:34px;
          font-size:17px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function init() {
    replaceBrandLine();
    normalizePillarsSection();
    injectStyles();

    const consent = getCookie(COOKIE_NAME);

    if (consent === "accepted") {
      loadGoogleAnalytics();
    }

    if (!consent) {
      showBanner();
    }

    addPreferencesButton();
    addSocialButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
