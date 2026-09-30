/* Fii Pregătit: privacy-first aggregate engagement measurement.
   No form contents, names, addresses, free-text URLs, or session recordings.
   Google Analytics loads separately and only after analytical-cookie consent. */
(function () {
  "use strict";
  const CONSENT_COOKIE = "afp_cookie_consent=accepted";
  const GA_ID = "G-096NM6VP9W";
  const EVENT_NAMES = new Set([
    "afp_scroll_depth", "afp_section_engagement", "afp_cta_click",
    "whatsapp_click", "generate_lead", "sign_up"
  ]);

  function hasConsent() {
    return document.cookie.split(";").some(function (item) {
      return item.trim() === CONSENT_COOKIE;
    });
  }

  function analyticsAvailable() {
    return hasConsent() &&
      window.__afpAnalyticsReady === true &&
      window["ga-disable-" + GA_ID] !== true &&
      typeof window.gtag === "function";
  }

  window.afpTrackEvent = function (name, params) {
    if (!EVENT_NAMES.has(name) || !analyticsAvailable()) return false;
    window.gtag("event", name, params || {});
    return true;
  };

  const path = window.location.pathname;
  const page = path === "/" ? "homepage" :
    path.indexOf("/propunere-activitati/") === 0 ? "scoli" :
    path.indexOf("/documente/") === 0 ? "inscriere" : "informatii";

  // Only known, fixed CTA categories are transmitted: never the URL,
  // pre-filled WhatsApp text, user input or any query parameters.
  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target || !target.closest) return;
    const link = target.closest("a[href]");
    if (!link) return;
    const raw = link.getAttribute("href") || "";
    if (/^https?:\/\/(?:api\.)?wa\.me\//i.test(raw) ||
        /^https?:\/\/(?:www\.)?whatsapp\.com\//i.test(raw)) {
      window.afpTrackEvent("whatsapp_click", {source_page: page});
    } else if (/^\/documente\/?(?:#.*)?$/.test(raw)) {
      window.afpTrackEvent("afp_cta_click", {action_name: "inscriere", source_page: page});
    } else if (/^\/propunere-activitati\/?(?:#.*)?$/.test(raw)) {
      window.afpTrackEvent("afp_cta_click", {action_name: "propunere_activitati", source_page: page});
    } else if (/^mailto:/i.test(raw)) {
      window.afpTrackEvent("afp_cta_click", {action_name: "email", source_page: page});
    } else if (raw === "#activitati" || raw === "#oferta" || raw === "#contact") {
      window.afpTrackEvent("afp_cta_click", {
        action_name: raw.slice(1), source_page: page
      });
    }
  });

  // Never observe scrolling or sensitive registration-form content on /documente/.
  if (page !== "homepage" && page !== "scoli") return;

  const thresholds = [25, 50, 75, 90];
  const reportedDepths = new Set();
  const reportedSections = new Set();
  const secondsVisible = new Map();
  let ticker = null;
  let watched = [];

  function addSection(selector, label) {
    const element = document.querySelector(selector);
    if (element && !watched.some(function (item) { return item.element === element; })) {
      watched.push({element: element, label: label});
    }
  }

  function setupSections() {
    watched = [];
    if (page === "homepage") {
      addSection("#top", "hero");
      addSection('section[aria-label="Filosofia Fii Pregătit"]', "filosofie");
      addSection('[data-afp-section="experiente"]', "experiente");
      addSection("#cine-suntem", "cine_suntem");
      addSection("#metoda", "natura_si_metodologie");
      addSection("#activitati", "activitati");
      addSection("#sustine", "sustine");
      addSection("#contact", "contact");
    } else {
      addSection("#sus", "hero");
      addSection("#activitati", "activitati");
      addSection("#oferta", "oferta");
      const labels = [
        ["Nu organizăm simple ieșiri în natură.", "cine_suntem"],
        ["Trei direcții. O singură misiune.", "trei_piloni"],
        ["Pentru că lumea reală nu vine cu instrucțiuni.", "de_ce_fii_pregatit"],
        ["Natura este mediul. Experiența este metoda.", "metodologie"],
        ["Alegem intenționat acest interval de vârstă", "siguranta"],
        ["Feedback direct din comunitate", "testimoniale"],
        ["Educația pentru viață nu se învață doar din cărți.", "cta_final"]
      ];
      document.querySelectorAll("h2").forEach(function (heading) {
        const headingText = (heading.textContent || "").replace(/\s+/g," ").trim();
        labels.forEach(function (pair) {
          if (headingText.indexOf(pair[0]) === 0) {
            const section = heading.closest("section");
            if (section && !watched.some(function (item) { return item.element === section; })) {
              watched.push({element: section, label: pair[1]});
            }
          }
        });
      });
    }
  }

  function checkEngagement() {
    if (!analyticsAvailable() || document.visibilityState !== "visible") return;
    const total = Math.max(
      document.documentElement.scrollHeight, document.body.scrollHeight
    ) - window.innerHeight;
    const depth = total > 0 ? Math.round(window.scrollY / total * 100) : 0;
    thresholds.forEach(function (threshold) {
      if (depth >= threshold && !reportedDepths.has(threshold) &&
          window.afpTrackEvent("afp_scroll_depth", {
            depth_percent: threshold, source_page: page
          })) {
        reportedDepths.add(threshold);
      }
    });

    // Accumulate visible time only after consent, with the tab in foreground.
    // 8 seconds of on-screen time indicates exposure, not proven reading.
    const viewportTop = window.innerHeight * 0.20;
    const viewportBottom = window.innerHeight * 0.80;
    watched.forEach(function (item) {
      if (reportedSections.has(item.label)) return;
      const rect = item.element.getBoundingClientRect();
      const pixelsVisible = Math.max(
        0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)
      );
      if (pixelsVisible < 80) return;
      const seconds = (secondsVisible.get(item.label) || 0) + 1;
      secondsVisible.set(item.label, seconds);
      if (seconds >= 8 &&
          window.afpTrackEvent("afp_section_engagement", {
            section_name: item.label, source_page: page
          })) {
        reportedSections.add(item.label);
      }
    });
  }

  function start() {
    if (!analyticsAvailable() || ticker !== null) return;
    setupSections();
    ticker = window.setInterval(checkEngagement, 1000);
  }
  function stop() {
    if (ticker !== null) window.clearInterval(ticker);
    ticker = null;
    secondsVisible.clear();
  }
  window.addEventListener("afp-analytics-ready", start);
  window.addEventListener("afp-analytics-revoked", stop);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();