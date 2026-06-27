const cities = [...(window.ZELLIJ_CITIES || [])];
const state = {
  selectedCity: cities[0],
  cart: []
};

const cityNav = document.querySelector("[data-city-nav]");
const cityGrid = document.querySelector("[data-city-grid]");
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
      <button type="button" data-select-city="${city.id}" aria-label="Voir la rubrique ${city.name}">
        <span class="city-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="city-visual">
          ${city.image ? `<img src="${city.image}" alt="T-shirt ${city.name} ZELLIJ">` : `<span>${city.arabic}</span>`}
        </span>
        <span class="city-meta">
          <strong>${city.name}</strong>
          <small>${city.region}</small>
        </span>
        <span class="city-status">${city.status}</span>
      </button>
    </article>
  `).join("");
}

function renderTimeline() {
  timeline.innerHTML = cities.map((city, index) => `
    <button class="timeline-item ${city.id === state.selectedCity.id ? "is-active" : ""}" type="button" data-select-city="${city.id}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${city.name}</strong>
      <small>${city.status}</small>
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
  renderAll();
  document.querySelector("#featured").scrollIntoView({ behavior: "smooth", block: "start" });
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
  renderTimeline();
  renderSelectedCity();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  if (target.matches("[data-open-menu]")) openLayer("[data-menu]");
  if (target.matches("[data-close-menu]")) closeLayer("[data-menu]");
  if (target.matches("[data-open-cart]")) openLayer("[data-cart]");
  if (target.matches("[data-close-cart]")) closeLayer("[data-cart]");
  if (target.matches("[data-open-search], [data-open-newsletter]")) {
    renderSearchResults();
    openLayer("[data-search]");
  }
  if (target.matches("[data-close-search]")) closeLayer("[data-search]");
  if (target.matches("[data-select-city]")) selectCity(target.dataset.selectCity);
  if (target.matches("[data-add]")) addToCart(target.dataset.add, target.dataset.size);
  if (target.matches("[data-remove-cart]")) {
    state.cart.splice(Number(target.dataset.removeCart), 1);
    renderCart();
  }
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
renderSearchResults();
