/* /js/app.js
   Catálogo: filtrado por categoría (datalist), render dinámico desde array.
   Carrito simple en localStorage (clave: 'catalog_cart').
   Imágenes: se carga img/{code}.jpg y onerror => img/placeholder.png
   Además: render de página product.html con especificaciones.
*/

const CatalogApp = (() => {
  const CART_KEY = 'catalog_cart';

  // Productos (array maestro)
  const products = [
    { code: 'JM001', category: 'Juegos de Mesa', name: 'Catan', price: 29990, img: 'img/JM001.jpg' },
    { code: 'JM002', category: 'Juegos de Mesa', name: 'Carcassonne', price: 24990, img: 'img/JM002.jpg' },
    { code: 'AC001', category: 'Accesorios', name: 'Joystick Xbox Series X', price: 59990, img: 'img/AC001.jpg' },
    { code: 'AC002', category: 'Accesorios', name: 'Auriculares Gamer HyperX Cloud II', price: 79990, img: 'img/AC002.jpg' },
    { code: 'CO001', category: 'Consolas', name: 'PlayStation 5', price: 549990, img: 'img/CO001.jpg' },
    { code: 'CG001', category: 'Computadores Gamers', name: 'PC Gamer ASUS ROG Strix', price: 1299990, img: 'img/CG001.jpg' },
    { code: 'SG001', category: 'Sillas Gamers', name: 'Silla Gamer Secretlab Titan', price: 349990, img: 'img/SG001.jpg' },
    { code: 'MS001', category: 'Mouse', name: 'Mouse Gamer Logitech G502 HERO', price: 49990, img: 'img/MS001.jpg' },
    { code: 'MP001', category: 'Mousepad', name: 'Mousepad Razer Goliathus Extended Chroma', price: 29990, img: 'img/MP001.jpg' },
    { code: 'PP001', category: 'Poleras Personalizadas', name: "Polera Gamer Personalizada 'Level-Up'", price: 14990, img: 'img/PP001.jpg' }
  ];

  // PRODUCT SPECS (resumen investigado). Se muestran solo en product.html.
  // Fuentes: webs oficiales y fichas técnicas (ver citas al final).
  const productSpecs = {
    'JM001': {
      short: 'Catan — juego de estrategia de colocación y comercio.',
      details: [
        'Jugadores: 3–4 (ampliable 5–6 con expansión).',
        'Tiempo de juego: 60–120 minutos.',
        'Edad recomendada: 10+.',
        'Componentes: tablero modular hexagonal, cartas de recursos, fichas, carreteras/poblados/ciudades, dados y cartas de desarrollo.',
        'Mecánicas: comercio, colocación de losetas, gestión de recursos.'
      ]
    },
    'JM002': {
      short: 'Carcassonne — juego de losetas con colocación de meeples.',
      details: [
        'Jugadores: 2–5.',
        'Tiempo de juego: ~30–45 minutos.',
        'Edad recomendada: 7+.',
        'Componentes: losetas de terreno, meeples en varios colores y marcadores de puntuación.',
        'Mecánicas: colocación de losetas, control de áreas y puntuación por ciudades/caminos/monasterios/pastizales.'
      ]
    },
    'AC001': {
      short: 'Controlador inalámbrico compatible Xbox Series X/S y PC.',
      details: [
        'Conectividad: Xbox Wireless, Bluetooth y USB-C para conexión por cable.',
        'Compatibilidad: Xbox Series X|S, Windows 10/11, Android, iOS.',
        'Autonomía: depende de baterías AA (estimado en el sitio oficial).',
        'Funciones: gatillos hápticos, D-pad y emparejamiento multi-dispositivo.'
      ]
    },
    'AC002': {
      short: 'HyperX Cloud II — headset gaming circumaural USB/analógico.',
      details: [
        'Drivers: 53 mm con imanes de neodimio.',
        'Respuesta de frecuencia (según HyperX): 10 Hz–23 kHz.',
        'Micrófono: condensador electret desmontable, con cancelación de ruido.',
        'Compatibilidad: PC, PS5, PS4, Xbox Series X|S, Nintendo Switch y dispositivos móviles.',
        'Construcción: estructura de aluminio; almohadillas de memory foam.'
      ]
    },
    'CO001': {
      short: 'PlayStation 5 — consola Sony de nueva generación.',
      details: [
        'CPU: AMD Zen 2 basado (8 núcleos a frecuencia variable).',
        'GPU: RDNA 2 personalizado de AMD con trazado de rayos.',
        'Memoria: 16 GB GDDR6.',
        'Almacenamiento: SSD NVMe ultra-rápido; soporte de expansión NVMe.',
        'Soporte de vídeo: hasta 4K@120Hz y salida 8K (según título y configuración).'
      ]
    },
    'CG001': {
      short: 'PC Gamer ASUS ROG Strix — familia ROG Strix con variantes (GPU/Núcleo variable).',
      details: [
        'Serie: ROG Strix (es una línea; las especificaciones varían por modelo).',
        'Opciones típicas: GPUs NVIDIA RTX (3060/4070/4080...), CPUs Intel o AMD (i5/i7/i9 o Ryzen 5/7/9), memoria DDR4/DDR5 y SSD NVMe.',
        'Recomendación: revisar la ficha del modelo exacto para RAM, GPU y almacenamiento antes de comprar.'
      ]
    },
    'SG001': {
      short: 'Secretlab Titan — silla gamer de gama alta (varias variantes).',
      details: [
        'Tamaños y variantes: Regular / XL / Small; materiales: NEO™ Hybrid Leatherette o tejido tejido (SoftWeave).',
        'Ajustes: soporte lumbar integrado ajustable, inclinación, reposabrazos 4D.',
        'Carga máxima y rango recomendado dependen de la variante (ver comparativa de Secretlab).'
      ]
    },
    'MS001': {
      short: 'Logitech G502 HERO — mouse gaming con sensor HERO y pesos ajustables.',
      details: [
        'Sensor: HERO (100–25.600 DPI).',
        'Pesos tunables: sistema de 5 pesos (3.6 g cada uno) para ajustar inercia.',
        'Botones: múltiples botones programables y software G HUB para perfiles.',
        'Dimensiones y peso: ver ficha oficial para datos exactos.'
      ]
    },
    'MP001': {
      short: 'Razer Goliathus Extended Chroma — mousepad RGB extendido.',
      details: [
        'Superficie optimizada para sensores ópticos y láser.',
        'Tamaño extendido para teclado+mause; iluminación RGB personalizable (requiere controlador compatible).',
        'Construcción: base antideslizante de goma.'
      ]
    },
    'PP001': {
      short: 'Polera gamer personalizada — prenda textil con impresión personalizada.',
      details: [
        "Material: algodón / mezcla poliéster (según acabados solicitados).",
        "Tallas disponibles: S / M / L / XL (según stock).",
        "Personalización: método de impresión y plazos varían según pedido."
      ]
    }
  };

  // UTILIDADES
  function formatCLP(n){ try { return n.toLocaleString('es-CL'); } catch(e){ return String(n); } }

  function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
  function addToCart(code, qty = 1){
    const cart = getCart();
    const found = cart.find(i => i.code === code);
    if(found) found.qty += qty; else cart.push({ code, qty });
    saveCart(cart);
  }
  function getTotalItems(){ return getCart().reduce((s, i) => s + (i.qty||0), 0); }

  // Escape helpers
  function escapeHtml(s){ if(s==null) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

  // PRODUCT LIST RENDER
  function productCardHtml(p){
    return `
      <article class="product-card" data-code="${escapeAttr(p.code)}" role="article" aria-label="${escapeAttr(p.name)}">
        <img class="product-image" src="${escapeAttr(p.img)}" alt="${escapeAttr(p.name)}" />
        <div class="product-body">
          <div>
            <div class="product-title">${escapeHtml(p.name)}</div>
            <div class="product-meta">${escapeHtml(p.category)}</div>
          </div>
          <div class="product-footer">
            <div class="price">$${formatCLP(p.price)} CLP</div>
            <button class="add-btn" data-add="${escapeAttr(p.code)}">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(filterCategory = 'all'){
    const container = document.getElementById('products-grid');
    if(!container) return;
    const list = (!filterCategory || filterCategory === 'all') ? products : products.filter(p => (p.category || '').toLowerCase() === (filterCategory || '').toLowerCase());

    // If filterCategory is free text and no exact category matches, try partial match
    if(filterCategory && filterCategory !== 'all'){
      const exact = new Set(products.map(p => p.category.toLowerCase()));
      if(!exact.has(filterCategory.toLowerCase())){
        const partial = products.filter(p => p.category.toLowerCase().includes(filterCategory.toLowerCase()));
        if(partial.length) { container.innerHTML = partial.map(p => productCardHtml(p)).join(''); attachCardEvents(); return; }
      }
    }

    container.innerHTML = list.map(p => productCardHtml(p)).join('');
    attachCardEvents();
  }

  function attachCardEvents(){
    const container = document.getElementById('products-grid');
    if(!container) return;

    // add button events
    container.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent navigating to product page
        const code = e.currentTarget.dataset.add;
        addToCart(code, 1);
        updateCartCount();
        const product = products.find(x=>x.code===code);
        // minimal feedback
        window.alert(`Añadido: ${product.name}`);
      });
    });

    // image fallback
    container.querySelectorAll('img.product-image').forEach(img => {
      img.onerror = () => { img.onerror = null; img.src = 'img/placeholder.png'; };
    });

    // click on card navigates to product.html
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const code = card.dataset.code;
        // if user clicked on the add button we stopped propagation; otherwise navigate
        location.href = 'product.html?code=' + encodeURIComponent(code);
      });
    });
  }

  // CATEGORIES datalist population (for input suggestions)
  function getCategories(){
    const set = new Set(products.map(p => p.category || 'Sin categoría'));
    return Array.from(set).sort();
  }
  function populateCategoriesDatalist(selector){
    const datalist = document.querySelector(selector);
    if(!datalist) return;
    const cats = getCategories();
    datalist.innerHTML = cats.map(c => `<option value="${escapeAttr(c)}"></option>`).join('');
  }

  // PRODUCT PAGE render
  function renderProductPage(code){
    const root = document.getElementById('product-detail');
    if(!root) return;
    if(!code){
      root.innerHTML = `<div class="product-detail"><p>Producto no especificado.</p></div>`;
      return;
    }
    const product = products.find(p => p.code === code);
    if(!product){
      root.innerHTML = `<div class="product-detail"><p>Producto con código ${escapeHtml(code)} no encontrado.</p></div>`;
      return;
    }

    const specs = productSpecs[code] || { short: '', details: [] };

    root.innerHTML = `
      <div class="product-detail">
        <div class="grid">
          <div>
            <img src="${escapeAttr(product.img)}" alt="${escapeAttr(product.name)}" onerror="this.onerror=null;this.src='img/placeholder.png'"/>
            <div style="margin-top:8px;display:flex;gap:8px;">
              <button id="btn-add-detail" class="add-btn">Agregar al carrito</button>
            </div>
          </div>
          <div>
            <h2>${escapeHtml(product.name)}</h2>
            <div class="product-meta">${escapeHtml(product.category)} • Código: ${escapeHtml(product.code)}</div>
            <p style="margin-top:12px;font-weight:700;font-size:1.1rem">$${formatCLP(product.price)} CLP</p>

            <p style="margin-top:10px">${escapeHtml(specs.short || '')}</p>

            <section class="specs">
              <h4>Especificaciones / Detalles</h4>
              <ul>
                ${ (specs.details || []).map(d => `<li>${escapeHtml(d)}</li>`).join('') }
              </ul>
            </section>
          </div>
        </div>
      </div>
    `;

    // hook add button
    const addBtn = document.getElementById('btn-add-detail');
    if(addBtn) addBtn.addEventListener('click', () => {
      addToCart(product.code, 1);
      updateCartCount();
      alert(`Añadido al carrito: ${product.name}`);
    });
  }

  function getProductByCode(code){
    return products.find(p => p.code === code) || null;
  }

  // Navigation cart count
  function updateCartCount(){
    const span = document.getElementById('cart-count');
    if(!span) return;
    span.textContent = getTotalItems();
  }

  // Expose methods and init
  function init(){
    updateCartCount();
    // ensure datalist exists if present on page
    const datalist = document.querySelector('#category-list');
    if(datalist) populateCategoriesDatalist('#category-list');
  }

  // Public API
  return {
    init,
    renderProducts,
    populateCategoriesDatalist,
    renderProductPage,
    getProductByCode,
  //  updateCartCount,
  //  addToCart
  };
})();
