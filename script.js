const cities = [...(window.ZELLIJ_CITIES || [])];
const state = {
  selectedCity: cities[0],
  cityPageIndex: 0,
  cart: []
};

const cityNav = document.querySelector("[data-city-nav]");
const cityGrid = document.querySelector("[data-city-grid]");
const cityPageShell = document.querySelector("[data-city-page-shell]");
const timeline = document.querySelector("[data-city-timeline]");
const selectedKicker = document.querySelector("[data-selected-kicker]");
const selectedTitle = document.querySelector("[data-selected-title]");
const selectedStory = document.querySelector("[data-selected-story]");
const selectedTags = document.querySelector("[data-selected-tags]");
const selectedProduct = document.querySelector("[data-selected-product]");
const cartCount = document.querySelector("[data-cart-count]");
const cartLines = document.querySelector("[data-cart-lines]");
const cartTotal = document.querySelector("[data-cart-total]");
const toast = document.querySelector("[data-toast]");
const searchResults = document.querySelector("[data-search-results]");
const checkoutLines = document.querySelector("[data-checkout-lines]");
const checkoutSubtotal = document.querySelector("[data-checkout-subtotal]");
const checkoutShipping = document.querySelector("[data-checkout-shipping]");
const checkoutTotal = document.querySelector("[data-checkout-total]");
const orderItemsInput = document.querySelector("[data-order-items]");
const orderSubtotalInput = document.querySelector("[data-order-subtotal]");
const orderShippingInput = document.querySelector("[data-order-shipping]");
const orderTotalInput = document.querySelector("[data-order-total]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const featuredSection = document.querySelector("#featured");
const SHIPPING_FEE = 35;
const FREE_SHIPPING_MINIMUM = 900;

function formatMoney(value, currency) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function cityPattern(city) {
  const [first, second, third] = city.palette;
  return `style="--city-a:${first};--city-b:${second};--city-c:${third}"`;
}

function renderCityNav() {
  cityNav.innerHTML = cities.map((city) => `
    <button class="city-pill ${city.id === state.selectedCity.id ? "is-active" : ""}" type="button" data-select-city="${city.id}">
      ${city.name}
    </button>
  `).join("");
}

function renderCityGrid() {
  cityGrid.innerHTML = cities.map((city, index) => `
    <article class="city-card ${city.id === state.selectedCity.id ? "is-active" : ""}" ${cityPattern(city)}>
      <button type="button" data-select-city="${city.id}" aria-label="Voir le produit ${city.name}">
        <span class="city-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="city-visual product-visual">
          ${city.image || city.photo ? `<img src="${city.image || city.photo}" alt="T-shirt ${city.name}">` : `<span>${city.arabic}</span>`}
        </span>
        <span class="city-meta">
          <strong>${city.product?.name || city.name}</strong>
          <small>${city.name} / ${city.region}</small>
        </span>
        <span class="city-status">${city.status}</span>
      </button>
    </article>
  `).join("");
}

function renderCityPage() {
  const city = cities[state.cityPageIndex];
  const previous = cities[(state.cityPageIndex - 1 + cities.length) % cities.length];
  const next = cities[(state.cityPageIndex + 1) % cities.length];

  cityPageShell.innerHTML = `
    <button class="page-arrow page-arrow-left" type="button" data-city-prev aria-label="Ville precedente">
      <span aria-hidden="true">&#8592;</span>
      <small>${previous.name}</small>
    </button>
    <article class="city-page" ${cityPattern(city)} data-view-city="${city.id}" role="button" tabindex="0" aria-label="Voir le produit ${city.name}">
      <div class="city-page-photo">
        <img src="${city.photo || city.image}" alt="${city.name} Maroc">
      </div>
      <div class="city-page-copy">
        <p class="eyebrow">${String(state.cityPageIndex + 1).padStart(2, "0")} / ${cities.length} &middot; ${city.region}</p>
        <h3>${city.name}</h3>
        <p class="city-page-arabic">${city.arabic}</p>
        <h4>${city.pageTitle || city.story}</h4>
        <p>${city.pageDescription || city.story}</p>
        <div class="city-page-swatches" aria-label="Palette ${city.name}">
          ${city.palette.map((color) => `<span style="background:${color}"></span>`).join("")}
        </div>
        <button class="solid-button city-page-cta" type="button" data-view-city="${city.id}">Voir la capsule</button>
      </div>
    </article>
    <button class="page-arrow page-arrow-right" type="button" data-city-next aria-label="Ville suivante">
      <span aria-hidden="true">&#8594;</span>
      <small>${next.name}</small>
    </button>
    <div class="city-page-dots" aria-label="Pages des villes">
      ${cities.map((item, index) => `
        <button class="${index === state.cityPageIndex ? "is-active" : ""}" type="button" data-city-page-index="${index}" aria-label="Afficher ${item.name}"></button>
      `).join("")}
    </div>
  `;
}

function renderTimeline() {
  if (!timeline) return;

  timeline.innerHTML = cities.map((city, index) => `
    <button class="timeline-item ${city.id === state.selectedCity.id ? "is-active" : ""}" type="button" data-select-city="${city.id}">
      <span class="timeline-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="timeline-product">
        <img src="${city.image || city.photo}" alt="${city.name} T-shirt">
      </span>
      <span class="timeline-copy">
        <strong>${city.name}</strong>
        <small>${city.status}</small>
      </span>
    </button>
  `).join("");
}

function renderSelectedCity() {
  const city = state.selectedCity;
  selectedKicker.textContent = `${city.region} / ${city.status}`;
  selectedTitle.textContent = city.name;
  selectedStory.textContent = city.story;
  selectedTags.innerHTML = [
    city.arabic,
    city.mood,
    city.product ? "Produit disponible" : "Produit a venir"
  ].map((tag) => `<span>${tag}</span>`).join("");

  if (city.product) {
    const product = city.product;
    selectedProduct.innerHTML = `
      <div class="product-photo">
        <img src="${city.image}" alt="${product.name}">
      </div>
      <div class="product-panel">
        <p class="eyebrow">Disponible maintenant</p>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">${formatMoney(product.price, product.currency)}</div>
        <div class="size-row" aria-label="Tailles disponibles">
          ${product.sizes.map((size) => `<button type="button" data-add="${city.id}" data-size="${size}">${size}</button>`).join("")}
        </div>
      </div>
    `;
  } else {
    selectedProduct.innerHTML = `
      <div class="product-photo placeholder-photo" ${cityPattern(city)}>
        <span>${city.arabic}</span>
      </div>
      <div class="product-panel">
        <p class="eyebrow">Produit a venir</p>
        <h3>${city.name} capsule</h3>
        <p>La rubrique est prete. Ajoute les photos et le design produit quand la collection de cette ville est finalisee.</p>
        <button class="solid-button" type="button" data-open-newsletter>Me prevenir</button>
      </div>
    `;
  }
}

function setCityPage(index) {
  state.cityPageIndex = (index + cities.length) % cities.length;
  renderCityPage();
}

function scrollToSelectedProduct() {
  featuredSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCart() {
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = state.cart.length;
  cartTotal.textContent = formatMoney(total, "MAD");

  if (!state.cart.length) {
    cartLines.innerHTML = '<p class="empty-state">Ton panier est vide.</p>';
    return;
  }

  cartLines.innerHTML = state.cart.map((item, index) => `
    <div class="cart-line">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>${item.city} / Taille ${item.size}</p>
        <strong>${formatMoney(item.price, item.currency)}</strong>
      </div>
      <button type="button" data-remove-cart="${index}" aria-label="Retirer ${item.name}">x</button>
    </div>
  `).join("");
}

function getOrderTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_MINIMUM || subtotal === 0 ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

function getOrderSummary() {
  return state.cart.map((item, index) => {
    return `${index + 1}. ${item.name} - ${item.city} - Taille ${item.size} x1 - ${formatMoney(item.price, item.currency)}`;
  }).join("\n");
}

function renderCheckout() {
  const totals = getOrderTotals();

  checkoutLines.innerHTML = state.cart.map((item) => `
    <div class="order-product">
      <span>${item.name}<small>${item.city} / Taille ${item.size} x 1</small></span>
      <strong>${formatMoney(item.price, item.currency)}</strong>
    </div>
  `).join("");

  checkoutSubtotal.textContent = formatMoney(totals.subtotal, "MAD");
  checkoutShipping.textContent = totals.shipping ? `Flat rate: ${formatMoney(totals.shipping, "MAD")}` : "Free";
  checkoutTotal.textContent = formatMoney(totals.total, "MAD");
  orderItemsInput.value = getOrderSummary();
  orderSubtotalInput.value = `${totals.subtotal} MAD`;
  orderShippingInput.value = `${totals.shipping} MAD`;
  orderTotalInput.value = `${totals.total} MAD`;
}

function buildCheckoutEmailBody(form) {
  const data = new FormData(form);
  const totals = getOrderTotals();
  const lines = [
    "Nouvelle commande ZELLYJ",
    "",
    "CLIENT",
    `Prenom: ${data.get("first_name") || ""}`,
    `Nom: ${data.get("last_name") || ""}`,
    `Telephone: ${data.get("phone") || ""}`,
    `WhatsApp: ${data.get("whatsapp") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `Instagram: ${data.get("instagram") || ""}`,
    "",
    "LIVRAISON",
    "Pays: Morocco",
    `Adresse: ${data.get("street_address") || ""}`,
    `Appartement: ${data.get("apartment") || ""}`,
    `Ville: ${data.get("city") || ""}`,
    `Region: ${data.get("state") || ""}`,
    "",
    "COMMANDE",
    getOrderSummary(),
    "",
    `Sous-total: ${totals.subtotal} MAD`,
    `Livraison: ${totals.shipping} MAD`,
    `Total: ${totals.total} MAD`,
    "Paiement: Cash on delivery",
    "",
    "NOTES",
    data.get("order_notes") || ""
  ];

  return lines.join("\n");
}

function renderSearchResults(query = "") {
  const matches = cities.filter((city) => {
    const haystack = `${city.name} ${city.arabic} ${city.region} ${city.mood}`.toLowerCase();
    return !query || haystack.includes(query.toLowerCase());
  });

  searchResults.innerHTML = matches.map((city) => `
    <button type="button" data-select-city="${city.id}" data-close-search>
      <strong>${city.name}</strong>
      <span>${city.status}</span>
    </button>
  `).join("");
}

function selectCity(cityId) {
  const city = cities.find((item) => item.id === cityId);
  if (!city) return;
  state.selectedCity = city;
  state.cityPageIndex = cities.findIndex((item) => item.id === cityId);
  renderAll();
  scrollToSelectedProduct();
}

function openLayer(selector) {
  const layer = document.querySelector(selector);
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-open-layer");
}

function closeLayer(selector) {
  const layer = document.querySelector(selector);
  layer.classList.remove("is-open");
  layer.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".is-open")) document.body.classList.remove("has-open-layer");
}

function addToCart(cityId, size) {
  const city = cities.find((item) => item.id === cityId);
  if (!city?.product) return;
  state.cart.push({
    ...city.product,
    city: city.name,
    image: city.image,
    size
  });
  renderCart();
  showToast(`${city.product.name} taille ${size} ajoute au panier`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function renderAll() {
  renderCityNav();
  renderCityGrid();
  renderCityPage();
  renderTimeline();
  renderSelectedCity();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a, [data-view-city]");
  if (!target) return;

  if (target.matches("[data-open-menu]")) openLayer("[data-menu]");
  if (target.matches("[data-close-menu]")) closeLayer("[data-menu]");
  if (target.matches("[data-open-cart]")) openLayer("[data-cart]");
  if (target.matches("[data-close-cart]")) closeLayer("[data-cart]");
  if (target.matches("[data-open-checkout]")) {
    if (!state.cart.length) {
      showToast("Ajoute un article avant le checkout");
      return;
    }
    renderCheckout();
    closeLayer("[data-cart]");
    openLayer("[data-checkout]");
  }
  if (target.matches("[data-close-checkout]")) closeLayer("[data-checkout]");
  if (target.matches("[data-open-search], [data-open-newsletter]")) {
    renderSearchResults();
    openLayer("[data-search]");
  }
  if (target.matches("[data-close-search]")) closeLayer("[data-search]");
  if (target.matches("[data-city-prev]")) setCityPage(state.cityPageIndex - 1);
  if (target.matches("[data-city-next]")) setCityPage(state.cityPageIndex + 1);
  if (target.matches("[data-city-page-index]")) setCityPage(Number(target.dataset.cityPageIndex));
  if (target.matches("[data-view-city]")) selectCity(target.dataset.viewCity);
  if (target.matches("[data-select-city]")) selectCity(target.dataset.selectCity);
  if (target.matches("[data-add]")) addToCart(target.dataset.add, target.dataset.size);
  if (target.matches("[data-remove-cart]")) {
    state.cart.splice(Number(target.dataset.removeCart), 1);
    renderCart();
    if (document.querySelector("[data-checkout]").classList.contains("is-open")) {
      if (state.cart.length) renderCheckout();
      else closeLayer("[data-checkout]");
    }
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target.closest("[data-view-city]");
  if (!target || target.matches("button, a")) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  selectCity(target.dataset.viewCity);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.cart.length) {
    showToast("Ton panier est vide");
    return;
  }

  renderCheckout();
  const subject = encodeURIComponent("Nouvelle commande ZELLIJ");
  const body = encodeURIComponent(buildCheckoutEmailBody(event.currentTarget));
  window.location.href = `mailto:zellijmorocco@gmail.com?subject=${subject}&body=${body}`;
  showToast("Email de commande prepare");
});

document.querySelector("[data-newsletter-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Inscription newsletter enregistree");
});

document.querySelector("[data-search-input]").addEventListener("input", (event) => {
  renderSearchResults(event.target.value.trim());
});

renderAll();
renderCart();
renderCheckout();
renderSearchResults();
