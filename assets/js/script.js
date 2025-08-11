/* script.js */
"use strict";

/* ---------- tiny helpers ---------- */
function $(sel, root)  { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/* =========================================
   Sidebar: Show / Hide contact information
   (persists across pages with localStorage)
   ========================================= */
(function () {
  var sidebar    = document.querySelector(".sidebar");
  var sidebarBtn = document.querySelector(".info_more-btn");
  if (!sidebar) return;

  var labelSpan = sidebarBtn ? sidebarBtn.querySelector("span") : null;
  var iconEl    = sidebarBtn ? sidebarBtn.querySelector("ion-icon") : null;
  var mqLarge   = window.matchMedia("(min-width: 1250px)");

  function syncBtnState() {
    if (!sidebarBtn) return;
    var open = sidebar.classList.contains("active");
    if (labelSpan) labelSpan.textContent = open ? "Hide Contacts" : "Show Contacts";
    if (iconEl)    iconEl.setAttribute("name", open ? "chevron-up" : "chevron-down");
  }

  // 讓大螢幕「載入/切換時」也有慢慢展開動畫
  function animateOpenOnce() {
    if (sidebar.classList.contains("active")) return;
    // 保證先處於收起狀態，再於下一畫格加上 active 觸發 transition
    sidebar.classList.remove("active");
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        sidebar.classList.add("active");
        syncBtnState();
      });
    });
  }

  function applyResponsiveContacts() {
    if (mqLarge.matches) {
      animateOpenOnce();            // 大螢幕：自動展開且有動畫
    } else {
      // 小螢幕：依上次狀態
      var storedOpen = localStorage.getItem("contactsOpen") === "true";
      sidebar.classList.toggle("active", storedOpen);
      syncBtnState();
    }
  }

  if (sidebarBtn) {
    // 小螢幕點擊切換 + 記憶狀態；大螢幕忽略按鈕
    sidebarBtn.addEventListener("click", function () {
      if (mqLarge.matches) return;
      sidebar.classList.toggle("active");
      localStorage.setItem("contactsOpen", String(sidebar.classList.contains("active")));
      syncBtnState();
    });
  }

  applyResponsiveContacts();
  mqLarge.addEventListener("change", applyResponsiveContacts);
  window.addEventListener("resize", applyResponsiveContacts);
})();



/* =========================================
   Portfolio Filters (buttons + mobile select)
   ========================================= */
(function () {
  var filterBox     = $(".filter-select-box");
  var filterSelect  = $(".filter-select");
  var selectValueEl = $(".select-value");
  var selectBtns    = $$(".select-list .select-item button");
  var desktopBtns   = $$(".filter-list .filter-item button");
  var projects      = $$(".project-item");

  if (!filterBox || !filterSelect || !selectValueEl || !projects.length) return;

  function setActiveDesktop(label) {
    var target = label.toLowerCase();
    desktopBtns.forEach(function (b) {
      b.classList.toggle("active", b.textContent.trim().toLowerCase() === target);
    });
  }

  function applyFilter(label) {
    var key = label.trim().toLowerCase();
    projects.forEach(function (li) {
      var catRaw = (li.getAttribute("data-category") || "").trim().toLowerCase();
      // support multi-category: "data science, data analysis"
      var catList = catRaw.split(/[,;]+/).map(function (s){ return s.trim(); });
      var show = (key === "all") || catList.indexOf(key) !== -1;
      li.classList.toggle("active", show);
    });
  }

  // Toggle mobile select open/close
  filterSelect && filterSelect.addEventListener("click", function (e) {
    e.stopPropagation();
    filterSelect.classList.toggle("active");
  });

  // Mobile select options
  selectBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.textContent.trim();
      selectValueEl.textContent = label;
      filterSelect.classList.remove("active");
      setActiveDesktop(label);
      applyFilter(label);
    });
  });

  // Desktop buttons
  desktopBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.textContent.trim();
      setActiveDesktop(label);
      if (selectValueEl) selectValueEl.textContent = label;
      filterSelect && filterSelect.classList.remove("active");
      applyFilter(label);
    });
  });

  // Click outside to close the dropdown
  document.addEventListener("click", function (e) {
    if (filterBox && !filterBox.contains(e.target)) {
      filterSelect && filterSelect.classList.remove("active");
    }
  });
})();

/* =========================================
   Project Modal (Portfolio items)
   ========================================= */
(function () {
  var items = $$(".project-item");
  if (!items.length) return;

  var modalContainer = document.querySelector("[data-project-modal]");
  var overlay        = document.querySelector("[data-project-overlay]");
  var closeBtn       = document.querySelector("[data-project-close]");

  var imgEl    = document.querySelector("[data-project-img]");
  var titleEl  = document.querySelector("[data-project-title]");
  var insEl    = document.querySelector("[data-project-instructor]");
  var authorEl = document.querySelector("[data-project-author]");
  var coEl     = document.querySelector("[data-project-coauthors]");
  var skillEl  = document.querySelector("[data-project-skill]");
  var descEl   = document.querySelector("[data-project-description]");
  var driveEl  = document.querySelector("[data-project-drive]");

  function open() {
    if (!modalContainer || !overlay) return;
    modalContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!modalContainer || !overlay) return;
    modalContainer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (overlay)  overlay.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);

  if (modalContainer) {
    modalContainer.addEventListener("click", function (e) {
      if (!e.target.closest(".project-modal")) close();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  function setRow(el, value) {
    if (!el) return;
    var v = (value || "").trim();
    el.textContent = v;
    if (el.parentElement) el.parentElement.style.display = v ? "" : "none";
  }

  items.forEach(function (li) {
    var anchor = li.querySelector("a");
    if (!anchor) return;
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      var srcImg = li.querySelector("img");
      if (srcImg && imgEl) {
        imgEl.src = srcImg.src;
        imgEl.alt = srcImg.alt || "";
      }

      var title = li.getAttribute("data-title") || (li.querySelector(".project-title") ? li.querySelector(".project-title").textContent : "");
      if (titleEl) titleEl.textContent = title;

      setRow(insEl,    li.getAttribute("data-instructor") || "");
      setRow(authorEl, li.getAttribute("data-author") || "");
      setRow(coEl,     li.getAttribute("data-coauthors") || "");
      setRow(skillEl,  li.getAttribute("data-skill") || "");
      setRow(descEl,   li.getAttribute("data-description") || "");

      var drive = (li.getAttribute("data-drive") || "").trim();
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

/* =========================================
   Contact form: enable button + mailto send
   ========================================= */
(function () {
  var form = document.querySelector(".contact .form");
  if (!form) return;

  var nameInput    = form.querySelector('input[name="fullname"]');
  var emailInput   = form.querySelector('input[name="email"]');
  var messageInput = form.querySelector('textarea[name="message"]');
  var btn          = form.querySelector(".form-btn");

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim()); }

  function updateState() {
    var ok =
      (nameInput && nameInput.value.trim().length > 0) &&
      (emailInput && isValidEmail(emailInput.value)) &&
      (messageInput && messageInput.value.trim().length > 0);
    if (btn) btn.disabled = !ok;
  }

  form.addEventListener("input", updateState);
  updateState();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!btn || btn.disabled) return;

    var to = "chiehan.chang.job@gmail.com";
    var subject = encodeURIComponent("Message from " + (nameInput ? nameInput.value.trim() : ""));
    var body = encodeURIComponent(
      "Name: " + (nameInput ? nameInput.value.trim() : "") +
      "\nEmail: " + (emailInput ? emailInput.value.trim() : "") +
      "\n\n" + (messageInput ? messageInput.value.trim() : "")
    );

    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
  });
})();
