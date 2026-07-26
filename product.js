// =====================================================
// FYENA — FICHE PRODUIT (product.js)
// Ce fichier ne gère que le contenu de la page produit.
// Le panier, le header et le menu sont gérés par script.js,
// déjà chargé sur cette page.
// =====================================================

const CATEGORY_LABELS = {
  'coffret': 'Coffret gourmand',
  'coffret-bebe': 'Coffret naissance',
  'coffret-pfe': 'Coffret réussite PFE',
  'produits': 'Nos douceurs'
};

// Mots courts pour le sceau circulaire : le texte courbé d'un <textPath>
// ne se replie pas à la ligne, donc on garde volontairement des mots
// courts et répétés pour qu'ils bouclent proprement sur le cercle.
const CATEGORY_STAMP_WORD = {
  'coffret': 'GOURMAND',
  'coffret-bebe': 'NAISSANCE',
  'coffret-pfe': 'RÉUSSITE',
  'produits': 'MAISON'
};

const CATEGORY_UNIT = {
  'coffret': 'le coffret',
  'coffret-bebe': 'le coffret',
  'coffret-pfe': 'le coffret',
  'produits': 'la pièce'
};

const CATEGORY_CHIPS = {
  'coffret': [
    { icon: 'fa-hands', label: 'Façonné à la main' },
    { icon: 'fa-gift', label: 'Emballage cadeau soigné' },
    { icon: 'fa-leaf', label: 'Sans conservateurs' }
  ],
  'coffret-bebe': [
    { icon: 'fa-hands', label: 'Façonné à la main' },
    { icon: 'fa-baby', label: 'Personnalisable prénom' },
    { icon: 'fa-leaf', label: 'Sans conservateurs' }
  ],
  'coffret-pfe': [
    { icon: 'fa-hands', label: 'Façonné à la main' },
    { icon: 'fa-graduation-cap', label: 'Personnalisable' },
    { icon: 'fa-leaf', label: 'Sans conservateurs' }
  ],
  'produits': [
    { icon: 'fa-hands', label: 'Fait à la main' },
    { icon: 'fa-star', label: 'Recette tunisienne' },
    { icon: 'fa-leaf', label: 'Sans conservateurs' }
  ]
};

const CATEGORY_ACCORDION = {
  'coffret': {
    composition: "Assortiment de douceurs tunisiennes sélectionnées par notre atelier, présenté dans un coffret cadeau. La composition exacte peut varier légèrement selon la disponibilité des fruits secs de saison.",
    conservation: "Ces douceurs sont meilleures dégustées dans les jours suivant leur préparation. Conservez le coffret dans un endroit sec et frais, à l'abri de la lumière directe.",
    livraison: "Chaque commande est confirmée par téléphone ou WhatsApp. Retrait en atelier ou livraison selon votre zone — délais et frais vous sont communiqués directement lors de la prise de contact."
  },
  'coffret-bebe': {
    composition: "Douceurs miniatures façonnées à la main pour célébrer une naissance. Couleurs, prénom et détails de personnalisation sont à préciser lors de la commande.",
    conservation: "À conserver dans un endroit sec et frais, à l'abri de la lumière directe. Nous vous recommandons de commander à l'approche de la date de l'évènement pour une fraîcheur optimale.",
    livraison: "Commande à confirmer par téléphone ou WhatsApp, idéalement quelques jours avant l'évènement pour laisser le temps à la personnalisation. Retrait en atelier ou livraison selon votre zone."
  },
  'coffret-pfe': {
    composition: "Sélection de douceurs fines pensée pour féliciter un jeune diplômé. Le nom, la spécialité ou une mention personnalisée peuvent être ajoutés sur demande.",
    conservation: "À conserver dans un endroit sec et frais, à l'abri de la lumière directe. Pour une présentation optimale le jour J, nous vous conseillons de commander à l'approche de la date de soutenance.",
    livraison: "Commande à confirmer par téléphone ou WhatsApp. Retrait en atelier ou livraison selon votre zone — pensez à réserver quelques jours à l'avance en période d'examens."
  },
  'produits': {
    composition: "Préparé à la main dans notre atelier avec des fruits secs sélectionnés et un minimum d'ingrédients. La recette traditionnelle tunisienne est respectée à chaque fournée.",
    conservation: "À conserver dans un endroit sec et frais, à l'abri de la lumière directe. Pour toute question sur la fraîcheur au moment de la livraison, n'hésitez pas à nous contacter.",
    livraison: "Commande à confirmer par téléphone ou WhatsApp. Retrait en atelier ou livraison selon votre zone — les délais vous sont communiqués directement lors de la prise de contact."
  }
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function buildStampSvg(categoryKey, uid) {
  const word = CATEGORY_STAMP_WORD[categoryKey] || 'FYENA';
  const repeated = `${word} ✦ ${word} ✦ ${word} ✦ `;
  const pathId = `stampPath-${uid}`;
  return `
    <svg class="stamp-svg" viewBox="0 0 140 140" aria-hidden="true">
      <defs>
        <path id="${pathId}" d="M 70,70 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" />
      </defs>
      <circle cx="70" cy="70" r="61" class="stamp-ring" />
      <circle cx="70" cy="70" r="49" class="stamp-face" />
      <text class="stamp-text">
        <textPath href="#${pathId}" startOffset="2%">${escapeHtml(repeated)}</textPath>
      </text>
      <text x="70" y="67" class="stamp-brand" text-anchor="middle">Fyena</text>
      <text x="70" y="83" class="stamp-sub" text-anchor="middle">ATELIER</text>
    </svg>`;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

let currentProduct = null;
let currentQty = 1;

async function initProductPage() {
  const detailSection = document.getElementById('productDetail');
  const id = getParam('id');

  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('products.json indisponible');
    const products = await res.json();

    const product = products.find(p => p.id === id);
    if (!product) {
      renderNotFound(detailSection);
      return;
    }

    currentProduct = product;
    renderBreadcrumb(product);
    renderProductDetail(detailSection, product);
    renderRelated(products, product);
    document.title = `${product.name} – Fyena`;
  } catch (err) {
    console.error('Erreur de chargement de la fiche produit :', err);
    detailSection.innerHTML = `
      <div class="detail-error">
        <p>Impossible de charger cette fiche produit pour le moment.</p>
        <p><a href="index.html">← Retour à nos douceurs</a></p>
      </div>`;
  }
}

function renderNotFound(detailSection) {
  detailSection.innerHTML = `
    <div class="detail-error">
      <p>🍰 Cette douceur n'existe pas ou n'est plus disponible.</p>
      <p><a href="index.html">← Retour à nos douceurs</a></p>
    </div>`;
}

function renderBreadcrumb(product) {
  const breadcrumb = document.getElementById('breadcrumb');
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Nos douceurs';
  breadcrumb.innerHTML = `
    <a href="index.html">Accueil</a>
    <span class="crumb-sep">/</span>
    <a href="index.html#produits">${escapeHtml(categoryLabel)}</a>
    <span class="crumb-sep">/</span>
    <span class="crumb-current">${escapeHtml(product.name)}</span>
  `;
}

function renderProductDetail(detailSection, product) {
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Fyena';
  const unit = CATEGORY_UNIT[product.category] || 'la pièce';
  const chips = CATEGORY_CHIPS[product.category] || CATEGORY_CHIPS['produits'];
  const accordion = CATEGORY_ACCORDION[product.category] || CATEGORY_ACCORDION['produits'];
  const uid = (product.id || 'p').replace(/[^a-zA-Z0-9-]/g, '');

  detailSection.innerHTML = `
    <div class="container">
      <div class="detail-grid">
        <div class="detail-photo-wrap">
          <div class="detail-photo-halo"></div>
          <div class="detail-photo">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
          </div>
          <div class="stamp-badge">${buildStampSvg(product.category, uid)}</div>
        </div>

        <div class="detail-info">
          <span class="detail-eyebrow">${escapeHtml(categoryLabel)}</span>
          <h1 class="detail-title">${escapeHtml(product.name)}</h1>
          <p class="detail-desc">${escapeHtml(product.description)}</p>

          <div class="price-ticket">
            <span class="amount">${product.price} DT</span>
            <span class="unit">/ ${escapeHtml(unit)}</span>
          </div>

          <div class="detail-actions">
            <div class="qty-stepper">
              <button type="button" id="qtyMinus" aria-label="Diminuer la quantité">−</button>
              <span class="qty-value" id="qtyValue">1</span>
              <button type="button" id="qtyPlus" aria-label="Augmenter la quantité">+</button>
            </div>
            <button type="button" class="btn-add-detail" id="btnAddDetail">
              <i class="fas fa-shopping-bag"></i> Ajouter au panier
            </button>
          </div>

          <div class="detail-secondary-actions">
            <a href="#" id="whatsappDirectOrder" target="_blank">
              <i class="fab fa-whatsapp"></i> Commander directement sur WhatsApp
            </a>
          </div>

          <div class="trust-row">
            ${chips.map(c => `<span class="trust-chip"><i class="fas ${c.icon}"></i>${escapeHtml(c.label)}</span>`).join('')}
          </div>

          <div class="detail-accordion">
            <details class="acc-item" open>
              <summary>Composition</summary>
              <div class="acc-body">${escapeHtml(accordion.composition)}</div>
            </details>
            <details class="acc-item">
              <summary>Conservation</summary>
              <div class="acc-body">${escapeHtml(accordion.conservation)}</div>
            </details>
            <details class="acc-item">
              <summary>Commande &amp; livraison</summary>
              <div class="acc-body">${escapeHtml(accordion.livraison)}</div>
            </details>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-order-bar" id="mobileOrderBar">
      <span class="mob-price">${product.price} DT</span>
      <button type="button" id="mobileAddBtn"><i class="fas fa-shopping-bag"></i> Ajouter</button>
    </div>
  `;

  wireDetailInteractions(product);
}

function wireDetailInteractions(product) {
  currentQty = 1;
  const qtyValue = document.getElementById('qtyValue');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const btnAdd = document.getElementById('btnAddDetail');
  const mobileAddBtn = document.getElementById('mobileAddBtn');
  const whatsappDirect = document.getElementById('whatsappDirectOrder');

  function refreshQty() {
    qtyValue.textContent = currentQty;
    qtyMinus.disabled = currentQty <= 1;
  }
  refreshQty();

  qtyMinus.addEventListener('click', () => {
    if (currentQty > 1) { currentQty -= 1; refreshQty(); }
  });
  qtyPlus.addEventListener('click', () => {
    currentQty += 1; refreshQty();
  });

  function addCurrentToCart() {
    addToCart(product.name, product.price, product.image, currentQty);
  }
  btnAdd.addEventListener('click', addCurrentToCart);
  mobileAddBtn.addEventListener('click', addCurrentToCart);

  function updateWhatsappDirect() {
    const msg = `Bonjour, je souhaite commander : ${product.name} (x${currentQty}). Merci de me confirmer la disponibilité.`;
    whatsappDirect.href = `https://wa.me/21621600684?text=${encodeURIComponent(msg)}`;
  }
  updateWhatsappDirect();
  qtyMinus.addEventListener('click', updateWhatsappDirect);
  qtyPlus.addEventListener('click', updateWhatsappDirect);

  // Barre flottante mobile : visible seulement quand le bouton principal
  // n'est plus à l'écran (utile en bas d'une longue fiche produit).
  const mobileBar = document.getElementById('mobileOrderBar');
  const stickyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      mobileBar.classList.toggle('show', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  stickyObserver.observe(btnAdd);
}

function renderRelated(allProductsList, currentProduct) {
  const relatedGrid = document.getElementById('relatedGrid');
  const relatedSection = document.getElementById('relatedSection');

  const related = allProductsList
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) {
    relatedSection.style.display = 'none';
    return;
  }

  relatedGrid.innerHTML = related.map(p => `
    <div class="product-card" data-category="${escapeHtml(p.category)}">
      <a class="product-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="Voir ${escapeHtml(p.name)}">
        <div class="product-image">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" />
          <span class="product-badge">${escapeHtml(p.badge)}</span>
        </div>
      </a>
      <div class="product-info">
        <h3 title="${escapeHtml(p.name)}"><a class="product-title-link" href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h3>
        <p title="${escapeHtml(p.description)}">${escapeHtml(p.description)}</p>
        <div class="product-footer">
          <span class="product-price">${p.price} DT</span>
          <button class="btn-order" data-name="${escapeHtml(p.name)}" data-price="${p.price}" data-image="${escapeHtml(p.image)}">
            <i class="fas fa-shopping-bag"></i> Commander
          </button>
        </div>
      </div>
    </div>
  `).join('');

  attachOrderButtons();
}

initProductPage();
