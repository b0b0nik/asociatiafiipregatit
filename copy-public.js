/* Copiere explicită numai pentru câmpurile bancare din homepage. */
(function () {
  "use strict";
  const style = document.createElement("style");
  style.textContent = [
    ".afp-bank-copy{display:inline-flex;align-items:center;justify-content:center;",
    "vertical-align:middle;margin-left:5px;min-width:24px;min-height:24px;",
    "border:1px solid rgba(255,255,255,.23);border-radius:5px;",
    "background:rgba(255,255,255,.08);color:inherit;cursor:pointer;",
    "opacity:.85;-webkit-user-select:none!important;user-select:none!important}",
    ".afp-bank-copy:hover,.afp-bank-copy:focus-visible{",
    "background:rgba(255,255,255,.17);opacity:1;outline-offset:2px}",
    ".afp-bank-copy i{font-size:14px;pointer-events:none}",
    ".afp-bank-copy[data-copied='true']{color:#ff7a1f;border-color:#ff7a1f}"
  ].join("");
  document.head.appendChild(style);

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(field);
    field.focus();
    field.select();
    try {
      if (!document.execCommand("copy")) throw new Error("Copiere nereușită");
    } finally {
      field.remove();
    }
  }

  document.addEventListener("click", async function (event) {
    const button = event.target instanceof Element
      ? event.target.closest("#afp-donatii-bancare button[data-afp-copy]")
      : null;
    if (!button) return;
    event.preventDefault();
    try {
      await copyText(button.getAttribute("data-afp-copy"));
      button.setAttribute("data-copied", "true");
      button.setAttribute("title", "Copiat!");
      button.setAttribute("aria-label", "Copiat!");
      window.setTimeout(function () {
        button.removeAttribute("data-copied");
        button.setAttribute("title", "Copiază");
        button.setAttribute("aria-label", button.getAttribute("data-afp-copy-label") || "Copiază");
      }, 1600);
    } catch (error) {
      button.setAttribute("title", "Selectează textul și alege Copiază");
    }
  });
})();
