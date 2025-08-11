/* script.js */
'use strict';

/* ---------- tiny helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================================
   Sidebar: Show Contacts (persistent state)
   ========================================= */
(() => {
  const sidebar    = $("[data-sidebar]") || $(".sidebar");
  const sidebarBtn = $("[data-sidebar-btn]") || $(".info_more-btn");   // your existing button
  const labelSpan  = sidebarBtn ? sidebarBtn.querySelector("span") : null;
  const iconEl     = sidebarBtn ? sidebarBtn.querySelector("ion-icon") : null;

  if (!sidebar || !sidebarBtn) return;

  // Load last state from localStorage (default: closed)
  const storedState = localStorage.getItem("contactsOpen") === "true";
  sidebar.classList.toggle("active", storedState);

  const syncBtn = () => {
    const open = sidebar.classList.contains("active");
    if (labelSpan) labelSpan.textContent = open ? "Hide contact information" : "Show contact information";
    if (iconEl)    iconEl.setAttribute("name", open ? "chevron-up" : "chevron-down");
    // Save state so it persists when changing pages
    localStorage.setItem("contactsOpen", open);
  };

  // Set the initial label/icon
  syncBtn();

  // Toggle open/close + update label + save
  sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    syncBtn();
  });
})();


/* =========================================
   Project Modal (Portfolio items)
   ========================================= */
(() => {
  const items = $$(".project-item");
  if (!items.length) return;

  const modalContainer = $("[data-project-modal]");
  const overlay        = $("[data-project-overlay]");
  const closeBtn       = $("[data-project-close]");

  const imgEl    = $("[data-project-img]");
  const titleEl  = $("[data-project-title]");
  const insEl    = $("[data-project-instructor]");
  const authorEl = $("[data-project-author]");
  const coEl     = $("[data-project-coauthors]");
  const skillEl  = $("[data-project-skill]");
  const descEl   = $("[data-project-description]");
  const driveEl  = $("[data-project-drive]");

  const open = () => {
    if (!modalContainer || !overlay) return;
    modalContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    if (!modalContainer || !overlay) return;
    modalContainer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  // Click overlay → close
  overlay?.addEventListener("click", close);

  // Click ✖ → close
  closeBtn?.addEventListener("click", close);

  // Click anywhere outside the black box → close
  modalContainer?.addEventListener("click", (e) => {
    if (!e.target.closest(".project-modal")) close();
  });

  // Esc → close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Utility: set a meta row, hide its <li> if value empty
  const setRow = (el, value) => {
    if (!el) return;
    const v = (value || "").trim();
    el.textContent = v;
    if (el.parentElement) el.parentElement.style.display = v ? "" : "none";
  };

  // Bind each portfolio item
  items.forEach((li) => {
    const anchor = li.querySelector("a");
    anchor?.addEventListener("click", (e) => {
      e.preventDefault();

      // Large image
      const srcImg = li.querySelector("img");
      if (srcImg && imgEl) {
        imgEl.src = srcImg.src;
        imgEl.alt = srcImg.alt || "";
      }

      // Title
      const title = li.dataset.title || li.querySelector(".project-title")?.textContent || "";
      if (titleEl) titleEl.textContent = title;

      // Meta rows (all optional)
      setRow(insEl,    li.dataset.instructor || "");
      setRow(authorEl, li.dataset.author || "");
      setRow(coEl,     li.dataset.coauthors || "");
      setRow(skillEl,  li.dataset.skill || "");
      setRow(descEl,   li.dataset.description || "");

      // Drive link
      const drive = (li.dataset.drive || "").trim();
      if (driveEl) {
        if (drive) {
          driveEl.href = drive;
          driveEl.style.display = "inline-block";
        } else {
          driveEl.removeAttribute("href");
          driveEl.style.display = "none";
        }
      }

      open();
    });
  });
})();
