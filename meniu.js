/* Meniu: când butoanele trec pe rândul de sub logo, ocupă toată lățimea ferestrei */
(function () {
  "use strict";
  function setup(nav) {
    var links = nav.querySelector(".nav-links-wrap, .afp-header-links, .page-nav-actions");
    var brand = nav.firstElementChild;
    if (!links || !brand || links === brand) return;
    var lastWidth = -1;
    function check(force) {
      var w = nav.clientWidth;
      if (!force && w === lastWidth) return;
      lastWidth = w;
      nav.classList.remove("afp-meniu-rand-nou");
      var wrapped = links.offsetTop >= brand.offsetTop + brand.offsetHeight - 4;
      nav.classList.toggle("afp-meniu-rand-nou", wrapped);
    }
    check(true);
    if ("ResizeObserver" in window) new ResizeObserver(function () { check(false); }).observe(nav);
    else window.addEventListener("resize", function () { check(false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { check(true); });
    window.addEventListener("load", function () { check(true); });
  }
  document.querySelectorAll("nav.nav, nav.page-nav").forEach(setup);

  /* Butonul „sus” apare după ce ai coborât cam un ecran */
  var sus = document.querySelector(".afp-sus, .quick-nav a[href=\"#sus\"]");
  if (sus) {
    var toggle = function () { sus.classList.toggle("afp-sus-vizibil", window.scrollY > window.innerHeight * 0.8); };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
    sus.addEventListener("click", function (event) {
      event.preventDefault();
      var smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    });
  }
})();
