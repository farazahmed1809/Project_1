/* ============================================================
   NOVA//SYS — Hardware Catalog
   Vanilla JS: render, filter/search, modals, theme.
   ============================================================ */

(() => {
  "use strict";

  /* ---------------- Product data ---------------- */

  const ICONS = {
    earbuds: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="15" rx="4" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><rect x="9" y="12.5" width="6" height="4.5" rx="1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,
    watch: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M9 4h6M9 20h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 10.2v2.1l1.6 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    speaker: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="3" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="16" r="1.2" stroke="currentColor" stroke-width="1.4"/></svg>`,
    hub: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="4" y="9" width="16" height="7" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="12.5" r="1" fill="currentColor"/><circle cx="11.4" cy="12.5" r="1" fill="currentColor"/><path d="M12 4v3M8 4v2M16 4v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };

  const PRODUCTS = [
    {
      id: "aero-01",
      name: "Aero-01 ANC Earbuds",
      category: "Audio",
      icon: "earbuds",
      price: 149,
      desc: "In-ear monitors with active noise cancelling and a case that doubles as a 30-hour reserve.",
      specs: {
        "Driver": "10mm dynamic",
        "Battery (buds)": "8h",
        "Battery (w/ case)": "30h",
        "ANC depth": "32dB",
        "Bluetooth": "5.3",
        "Water rating": "IPX4",
        "Weight": "4.8g / bud"
      }
    },
    {
      id: "flux-band",
      name: "Flux Band SE",
      category: "Wearables",
      icon: "watch",
      price: 199,
      desc: "A training-focused wrist unit with a always-on transflective display and week-long battery.",
      specs: {
        "Display": "1.4in transflective",
        "Battery life": "9 days",
        "Water rating": "5ATM",
        "Sensors": "HR, SpO2, GPS",
        "Bluetooth": "5.2",
        "Weight": "38g"
      }
    },
    {
      id: "kilo-45",
      name: "Kilo-45 Table Speaker",
      category: "Audio",
      icon: "speaker",
      price: 129,
      desc: "A 45W desk speaker with a passive radiator pair for low end that doesn't need a sub.",
      specs: {
        "Output": "45W RMS",
        "Frequency range": "48Hz–20kHz",
        "Battery life": "14h",
        "Bluetooth": "5.3, multipoint",
        "Water rating": "IPX5",
        "Weight": "780g"
      }
    },
    {
      id: "orbit-mini",
      name: "Orbit Mini Watch",
      category: "Wearables",
      icon: "watch",
      price: 249,
      desc: "The Flux Band's sibling in a round AMOLED case, built for daily wear over training.",
      specs: {
        "Display": "1.3in AMOLED",
        "Battery life": "5 days",
        "Water rating": "3ATM",
        "Sensors": "HR, SpO2",
        "Bluetooth": "5.2",
        "Weight": "42g"
      }
    },
    {
      id: "node-hub",
      name: "Node Hub",
      category: "Home",
      icon: "hub",
      price: 89,
      desc: "A matchbox-sized smart-home bridge that talks Thread, Zigbee and Matter on one radio stack.",
      specs: {
        "Protocols": "Thread, Zigbee, Matter",
        "Range": "~30m indoor",
        "Power": "5V / 1A (USB-C)",
        "Devices supported": "128",
        "Weight": "62g"
      }
    },
    {
      id: "pico-45",
      name: "Pico-45 Puck Speaker",
      category: "Audio",
      icon: "speaker",
      price: 59,
      desc: "A pocket-sized companion speaker for the Kilo-45 — pair two for true stereo.",
      specs: {
        "Output": "8W RMS",
        "Frequency range": "90Hz–20kHz",
        "Battery life": "10h",
        "Bluetooth": "5.3",
        "Water rating": "IPX7",
        "Weight": "180g"
      }
    }
  ];

  /* ---------------- State ---------------- */

  let activeFilter = "all";
  let searchTerm = "";

  /* ---------------- DOM refs ---------------- */

  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const filterChips = document.getElementById("filterChips");

  const productModalBackdrop = document.getElementById("productModalBackdrop");
  const productModalBody = document.getElementById("productModalBody");
  const productModalClose = document.getElementById("productModalClose");

  const themeToggle = document.getElementById("themeToggle");
  const notifyForm = document.getElementById("notifyForm");
  const formMsg = document.getElementById("formMsg");
  const footerClock = document.getElementById("footerClock");

  /* ---------------- Render product grid ---------------- */

  function matchesFilters(product) {
    const inCategory = activeFilter === "all" || product.category === activeFilter;
    if (!inCategory) return false;
    if (!searchTerm) return true;

    const haystack = [
      product.name,
      product.category,
      product.desc,
      ...Object.entries(product.specs).flat()
    ].join(" ").toLowerCase();

    return haystack.includes(searchTerm);
  }

  function renderGrid() {
    const visible = PRODUCTS.filter(matchesFilters);
    grid.innerHTML = "";

    emptyState.hidden = visible.length !== 0;

    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.id = product.id;

      const topSpecs = Object.entries(product.specs).slice(0, 3);

      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon">${ICONS[product.icon]}</div>
          <span class="card-tag">${product.category}</span>
        </div>
        <h3>${product.name}</h3>
        <p class="desc">${product.desc}</p>
        <div class="spec-chips">
          ${topSpecs.map(([k, v]) => `<span>${k}: ${v}</span>`).join("")}
        </div>
        <div class="card-footer">
          <span class="card-price mono">$${product.price}</span>
          <div class="card-actions">
            <button class="link-btn" data-view="${product.id}">View specs</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  /* ---------------- Filters & search ---------------- */

  filterChips.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filterChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    renderGrid();
  });

  searchInput.addEventListener("input", e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  /* ---------------- Product modal ---------------- */

  function openProductModal(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    productModalBody.innerHTML = `
      <div class="modal-product-icon">${ICONS[product.icon]}</div>
      <h3 id="modalTitle">${product.name}</h3>
      <p class="modal-tag">${product.category} — ${product.id.toUpperCase()}</p>
      <p class="modal-desc">${product.desc}</p>
      <ul class="spec-list">
        ${Object.entries(product.specs).map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("")}
      </ul>
      <div class="modal-price-row">
        <span class="card-price mono">$${product.price}</span>
        <button class="btn btn-primary" data-close-modal>Close datasheet</button>
      </div>
    `;
    productModalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    productModalBackdrop.hidden = true;
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", e => {
    const viewBtn = e.target.closest("[data-view]");
    if (!viewBtn) return;
    openProductModal(viewBtn.dataset.view);
  });

  productModalClose.addEventListener("click", closeProductModal);
  productModalBackdrop.addEventListener("click", e => {
    if (e.target === productModalBackdrop || e.target.closest("[data-close-modal]")) closeProductModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!productModalBackdrop.hidden) closeProductModal();
  });

  /* ---------------- Theme toggle ---------------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", String(theme === "print"));
    themeToggle.querySelector(".toggle-label").textContent = theme === "print" ? "PRINT" : "DARK";
    localStorage.setItem("nova-theme", theme);
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "print" : "dark");
  });

  const savedTheme = localStorage.getItem("nova-theme");
  if (savedTheme) applyTheme(savedTheme);

  /* ---------------- Notify form ---------------- */

  notifyForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      formMsg.textContent = "Enter a valid email — we need somewhere to send the teardown.";
      formMsg.classList.add("error");
      return;
    }

    formMsg.classList.remove("error");
    formMsg.textContent = `Queued. Datasheet for Unit 04 will land in ${email} at release.`;
    notifyForm.reset();
  });

  /* ---------------- Footer clock (mono UTC readout) ---------------- */

  function tickClock() {
    const now = new Date();
    const stamp = now.toISOString().replace("T", " ").slice(0, 19) + "Z";
    footerClock.textContent = `SYS TIME ${stamp}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- Init ---------------- */

  renderGrid();
})();