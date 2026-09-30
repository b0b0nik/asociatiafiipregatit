(function () {
  "use strict";

  const isEditable = (target) => target && target.closest("input, textarea, select, [contenteditable='true']");

  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  });
  document.addEventListener("copy", (event) => {
    if (!isEditable(event.target)) event.preventDefault();
  });
  document.addEventListener("cut", (event) => {
    if (!isEditable(event.target)) event.preventDefault();
  });
  document.addEventListener("selectstart", (event) => {
    if (!isEditable(event.target)) event.preventDefault();
  });
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && ["c", "s", "u", "p"].includes(key) && !isEditable(event.target)) {
      event.preventDefault();
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    html, body, body *:not(input):not(textarea):not(select):not([contenteditable="true"]) {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    img { -webkit-user-drag: none; user-drag: none; }
    .afp-protected-image { position: relative; display: block; overflow: hidden; }
    .afp-protected-image > img:first-child { display: block; width: 100%; }
    .afp-watermark {
      position: absolute !important;
      right: 4% !important;
      bottom: 4% !important;
      width: clamp(54px, 18%, 150px) !important;
      height: auto !important;
      aspect-ratio: auto !important;
      object-fit: contain !important;
      object-position: center !important;
      border-radius: 0 !important;
      opacity: .42 !important;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,.55));
      pointer-events: none !important;
      z-index: 3 !important;
    }
  `;
  document.head.appendChild(style);

  const protectImages = () => {
    document.querySelectorAll("img").forEach((image) => {
      const source = image.currentSrc || image.getAttribute("src") || "";
      if (/logo|patch/i.test(source) || image.classList.contains("afp-watermark") || image.closest(".afp-protected-image")) return;

      const anchor = image.closest("a");
      if (anchor && /\.(?:jpe?g|png|webp|gif|avif)(?:[?#].*)?$/i.test(anchor.getAttribute("href") || "")) {
        anchor.addEventListener("click", (event) => event.preventDefault());
        anchor.removeAttribute("target");
        anchor.removeAttribute("download");
      }

      const wrapper = document.createElement("span");
      wrapper.className = "afp-protected-image";
      image.parentNode.insertBefore(wrapper, image);
      wrapper.appendChild(image);

      const watermark = document.createElement("img");
      watermark.src = "/assets/imagini-site/LOGO-OFFICIAL.png";
      watermark.alt = "";
      watermark.setAttribute("aria-hidden", "true");
      watermark.className = "afp-watermark";
      watermark.draggable = false;
      wrapper.appendChild(watermark);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectImages, { once: true });
  } else {
    protectImages();
  }
})();
