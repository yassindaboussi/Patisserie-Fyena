// =====================================================
// FYENA - PÂTISSERIE TUNISIENNE - SCRIPT PRINCIPAL
// =====================================================

let allProducts = [];
let cartItems = [];

// ===== FORMATAGE DES PRIX (format tunisien : 13 -> "13,000") =====
function formatPrice(price) {
  return Number(price).toFixed(3).replace('.', ',');
}

// ===== PERSISTANCE DU PANIER (partagée entre les pages) =====
const CART_STORAGE_KEY = 'fyena_cart';

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (e) { /* stockage indisponible : on continue sans persistance */ }
}

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    cartItems = stored ? JSON.parse(stored) : [];
  } catch (e) {
    cartItems = [];
  }
}

// ===== ÉLÉMENTS DOM =====
const productGrid = document.getElementById('productGrid');
const toast = document.getElementById('toast');
const navCartCount = document.getElementById('navCartCount');
const floatCartCount = document.getElementById('floatCartCount');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartFloat = document.getElementById('cartFloat');
const navCartIcon = document.getElementById('navCartIcon');
const whatsappBtn = document.getElementById('whatsappOrderBtn');
const footer = document.getElementById('footer');

// =====================================================
// CHARGEMENT DES PRODUITS DEPUIS products.json
// =====================================================
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Impossible de charger products.json');
    allProducts = await response.json();
    if (productGrid) renderProducts(allProducts);
  } catch (error) {
    console.error('Erreur de chargement des produits :', error);
    if (!productGrid) return;
    const isFileProtocol = window.location.protocol === 'file:';
    productGrid.innerHTML = `
      <div style="text-align:center; padding: 40px; max-width: 600px; margin: 0 auto;">
        <p style="font-size:1.1rem; font-weight:700; margin-bottom:10px;">Impossible de charger les produits.</p>
        ${isFileProtocol ? `
          <p>Vous avez ouvert ce fichier directement (double-clic). Les navigateurs bloquent le chargement de products.json dans ce mode.</p>
          <p style="margin-top:10px;"><strong>Solution :</strong> double-cliquez sur <code>start-server.bat</code> dans le dossier du projet, puis le site s'ouvrira automatiquement correctement dans votre navigateur.</p>
        ` : `<p>Vérifiez que le fichier products.json est bien présent à côté de index.html.</p>`}
      </div>`;
  }
}

function renderProducts(products) {
  productGrid.innerHTML = products.map(p => `
    <div class="product-card" data-category="${p.category}">
      <a class="product-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="Voir ${p.name}">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" />
          <span class="product-badge">${p.badge}</span>
        </div>
      </a>
      <div class="product-info">
        <h3 title="${p.name}"><a class="product-title-link" href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3>
        <p title="${p.description}">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)} DT${p.unit ? ` <span class="price-unit">/ ${p.unit}</span>` : ''}</span>
          <button class="btn-order" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}" data-unit="${p.unit || 'pièce'}">
            <i class="fas fa-shopping-bag"></i> Commander
          </button>
        </div>
      </div>
    </div>
  `).join('');

  attachOrderButtons();
  animateProductCards();
}

// =====================================================
// MENU BURGER
// =====================================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// =====================================================
// FILTRES
// =====================================================
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    filterButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filterValue = this.dataset.filter;

    document.querySelectorAll('.product-card').forEach(card => {
      const category = card.dataset.category;
      if (filterValue === 'all' || category === filterValue) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// =====================================================
// GESTION DU PANIER
// =====================================================
function openCart() {
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartFloat.addEventListener('click', openCart);
navCartIcon.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', function (e) {
  if (e.target === this) closeCart();
});

function addToCart(name, price, image, qty = 1, unit = 'pièce') {
  const existing = cartItems.find(item => item.name === name);
  if (existing) {
    existing.quantity += qty;
  } else {
    cartItems.push({ name, price: parseFloat(price), quantity: qty, image, unit });
  }
  saveCart();
  updateCartUI();
  toast.textContent = `✅ ${name} ajouté au panier !`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateQuantity(name, delta) {
  const item = cartItems.find(i => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter(i => i.name !== name);
  }
  saveCart();
  updateCartUI();
  renderCart();
}

function updateCartUI() {
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  navCartCount.textContent = totalItems;
  floatCartCount.textContent = totalItems;
}

function renderCart() {
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-msg">Votre panier est vide.<br>🍰 Ajoutez vos douceurs préférées !</p>`;
    cartTotalPrice.textContent = '0,000 DT';
    updateWhatsAppLink(0);
    return;
  }

  let html = '';
  let total = 0;

  cartItems.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${formatPrice(item.price)} DT / ${item.unit || 'pièce'}</span>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-qty">
            <button onclick="updateQuantity('${item.name}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.name}', 1)">+</button>
          </div>
          <span class="cart-item-price">${formatPrice(subtotal)} DT</span>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = html;
  cartTotalPrice.textContent = formatPrice(total) + ' DT';
  updateWhatsAppLink(total);
}

// ===== LIEN WHATSAPP TOUJOURS ACTIF =====
function updateWhatsAppLink(total) {
  let message;
  if (cartItems.length === 0 || total === 0) {
    message = 'Bonjour, je souhaite passer une commande chez Fyena. Pouvez-vous me renseigner ?';
  } else {
    const itemList = cartItems.map(i => `${i.name} (x${i.quantity})`).join(', ');
    message = `Bonjour, je souhaite commander : ${itemList}. Total : ${formatPrice(total)} DT.`;
  }
  const url = `https://wa.me/21621600684?text=${encodeURIComponent(message)}`;
  whatsappBtn.href = url;
  whatsappBtn.style.opacity = '1';
  whatsappBtn.style.pointerEvents = 'auto';
}

function attachOrderButtons() {
  document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const name = this.dataset.name;
      const price = this.dataset.price;
      const image = this.dataset.image;
      const unit = this.dataset.unit;
      addToCart(name, price, image, 1, unit);
    });
  });
}

// =====================================================
// POSITION ADAPTATIVE DU BOUTON FLOTTANT (FOOTER)
// =====================================================
const footerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      cartFloat.classList.add('scrolled-up');
    } else {
      cartFloat.classList.remove('scrolled-up');
    }
  });
}, {
  threshold: 0,
  rootMargin: '0px 0px -50px 0px'
});
footerObserver.observe(footer);

// =====================================================
// ANIMATION AU SCROLL
// =====================================================
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

function animateProductCards() {
  document.querySelectorAll('.product-card:not(.hidden)').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollObserver.observe(el);
  });
}

// =====================================================
// INITIALISATION
// =====================================================
loadCart();
updateCartUI();
renderCart();
loadProducts();

console.log('🍰 Bienvenue chez Fyena !');
