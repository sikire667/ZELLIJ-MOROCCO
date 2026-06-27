const products = [...(window.ZELLIJ_PRODUCTS || [])];
const state = {
  products,
  cart: [],
  sort: "featured",
  filters: {
    sizes: new Set(),
    colors: new Set()
  }
};

const grid = document.querySelector("[data-product-grid]");
const cartCount = document.querySelector("[data-cart-count]");
const cartLines = document.querySelector("[data-cart-lines]");
const cartTotal = document.querySelector("[data-cart-total]");
const toast = document.querySelector("[data-toast]");

function formatMoney(value, currency) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function sortProducts(items) {
  const sorted = [...items];
  if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (state.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

function filterProducts(items) {
  return items.filter((product) => {
    const sizeMatch = state.filters.sizes.size === 0 || product.sizes.some((size) => state.filters.sizes.has(size));
    const colorMatch = state.filters.colors.size === 0 || state.filters.colors.has(product.color);
    return sizeMatch && colorMatch;
  });
}

function renderProducts() {
  const visibleProducts = sortProducts(filterProducts(state.products));

  if (!visibleProducts.length) {
    grid.innerHTML = '<p class="empty-state">Aucun article ne correspond aux filtres.</p>';
    return;
  }

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-media" type="button" data-preview="${product.id}" aria-label="Voir ${product.name}">
        <img src="${product.image}" alt="${product.name}">
        <span>${product.status}</span>
      </button>
      <div class="product-info">
        <div>
          <p>${product.brand}</p>
          <h2>${product.name}</h2>
        </div>
        <strong>${formatMoney(product.price, product.currency)}</strong>
      </div>
      <div class="size-row" aria-label="Tailles disponibles">
        ${product.sizes.map((size) => `<button type="button" data-add="${product.id}" data-size="${size}">${size}</button>`).join("")}
      </div>
    </article>
  `).join("");
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
        <p>Taille ${item.size}</p>
        <strong>${formatMoney(item.price, item.currency)}</strong>
      </div>
      <button type="button" data-remove-cart="${index}" aria-label="Retirer ${item.name}">x</button>
    </div>
  `).join("");
}

function openLayer(selector) {
  document.querySelector(selector).classList.add("is-open");
  document.querySelector(selector).setAttribute("aria-hidden", "false");
  document.body.classList.add("has-open-layer");
}

function closeLayer(selector) {
  document.querySelector(selector).classList.remove("is-open");
  document.querySelector(selector).setAttribute("aria-hidden", "true");
  if (!document.querySelector(".is-open")) document.body.classList.remove("has-open-layer");
}

function addToCart(productId, size) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  state.cart.push({ ...product, size });
  renderCart();
  showToast(`${product.name} taille ${size} ajoute au panier`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function showPreview(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const preview = document.createElement("div");
  preview.className = "preview-modal is-open";
  preview.innerHTML = `
    <div class="preview-card">
      <button class="drawer-close" type="button" data-close-preview aria-label="Fermer l'apercu">x</button>
      <img src="${product.image}" alt="${product.name}">
      <div>
        <p class="eyebrow">${product.status}</p>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <ul>${product.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>
        <div class="preview-sizes">
          ${product.sizes.map((size) => `<button type="button" data-add="${product.id}" data-size="${size}">${size}</button>`).join("")}
        </div>
      </div>
    </div>
  `;
  document.body.append(preview);
  document.body.classList.add("has-open-layer");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  if (target.matches("[data-open-menu]")) openLayer("[data-menu]");
  if (target.matches("[data-close-menu]")) closeLayer("[data-menu]");
  if (target.matches("[data-open-filter]")) openLayer("[data-filter]");
  if (target.matches("[data-close-filter]")) closeLayer("[data-filter]");
  if (target.matches("[data-open-cart]")) openLayer("[data-cart]");
  if (target.matches("[data-close-cart]")) closeLayer("[data-cart]");
  if (target.matches("[data-open-search], [data-open-newsletter]")) openLayer("[data-search]");
  if (target.matches("[data-close-search]")) closeLayer("[data-search]");

  if (target.matches("[data-apply-filter]")) {
    state.filters.sizes = new Set([...document.querySelectorAll("[data-size-filter]:checked")].map((input) => input.value));
    state.filters.colors = new Set([...document.querySelectorAll("[data-color-filter]:checked")].map((input) => input.value));
    renderProducts();
    closeLayer("[data-filter]");
  }

  if (target.matches("[data-add]")) {
    addToCart(target.dataset.add, target.dataset.size);
  }

  if (target.matches("[data-remove-cart]")) {
    state.cart.splice(Number(target.dataset.removeCart), 1);
    renderCart();
  }

  if (target.matches("[data-preview]")) {
    showPreview(target.dataset.preview);
  }

  if (target.matches("[data-close-preview]")) {
    target.closest(".preview-modal").remove();
    if (!document.querySelector(".is-open")) document.body.classList.remove("has-open-layer");
  }
});

document.querySelector("[data-sort]").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("[data-newsletter-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Inscription newsletter enregistree");
});

document.querySelector("[data-search-input]").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  state.products = products.filter((product) => {
    return product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
  });
  renderProducts();
});

renderProducts();
renderCart();
