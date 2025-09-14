/* app.js
   Unificador de "añadir al carrito" sin tocar carrito.js.
   - Prioridad: usar carrito.js si expone window.productos + window.agregarAlCarrito.
   - Si no, persistir en localStorage 'carrito' (forma: [{codigo,nombre,precio,descripcion,img,cantidad},...]).
   - Mantiene compatibilidad con 'catalog_cart' como fallback secundario.
   - Sin alertas.
*/

const CatalogApp = (() => {
  const CART_KEY = 'catalog_cart'; // compatibilidad histórica
  const CART_KEY_PRIMARY = 'carrito'; // clave preferida para que carro.html la lea

  // Productos "maestro" usados por la UI (no tocar desde aquí)
  const products = [
    { code: 'JM001', category: 'Juegos de Mesa', name: 'Catan', price: 29990, img: 'img/Sebas/JM001.jpg', stock: 20 },
    { code: 'JM002', category: 'Juegos de Mesa', name: 'Carcassonne', price: 24990, img: 'img/Sebas/JM002.jpg', stock: 15 },
    { code: 'AC001', category: 'Accesorios', name: 'Joystick Xbox Series X', price: 59990, img: 'img/Sebas/AC001.jpg', stock: 22 },
    { code: 'AC002', category: 'Accesorios', name: 'Auriculares Gamer HyperX Cloud II', price: 79990, img: 'img/Sebas/AC002.jpg', stock: 16 },
    { code: 'CO001', category: 'Consolas', name: 'PlayStation 5', price: 549990, img: 'img/Sebas/CO001.jpg', stock: 10 },
    { code: 'CG001', category: 'Computadores Gamer', name: 'PC Gamer ASUS ROG Strix', price: 1299990, img: 'img/Sebas/CG001.jpg', stock: 5 },
    { code: 'SG001', category: 'Sillas Gamer', name: 'Silla Gamer Secretlab Titan', price: 349990, img: 'img/Sebas/SG001.jpg', stock: 9 },
    { code: 'MS001', category: 'Mouse', name: 'Mouse Gamer Logitech G502 HERO', price: 49990, img: 'img/Sebas/MS001.jpg', stock: 13 },
    { code: 'MP001', category: 'Mousepad', name: 'Mousepad Razer Goliathus Extended Chroma', price: 29990, img: 'img/Sebas/MP001.jpg', stock: 19 },
    { code: 'PP001', category: 'Poleras Personalizadas', name: "Polera Gamer Personalizada 'Level-Up'", price: 14990, img: 'img/Sebas/PP001.jpg', stock: 50 }
  ];

  // Formato CLP
  function formatCLP(n){ try { return Number(n).toLocaleString('es-CL'); } catch(e){ return String(n); } }

  // Escapes
  function escapeHtml(s){ if(s==null) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

  // ---- Helpers para localStorage 'carrito' (clave primaria) ----
  function readPrimaryCart(){
    try {
      const raw = localStorage.getItem(CART_KEY_PRIMARY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }
  function savePrimaryCart(arr){
    try { localStorage.setItem(CART_KEY_PRIMARY, JSON.stringify(arr)); } catch(e){}
    // mantener compatibilidad con 'catalog_cart' si quieres (no obligatorio)
  }

  // fallback compatibilidad antigua (catalog_cart)
  function readLegacyCatalogCart(){
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }
  function saveLegacyCatalogCart(arr){
    try { localStorage.setItem(CART_KEY, JSON.stringify(arr)); } catch(e){}
  }

  // Actualiza contador en nav (prefiere función expuesta por carrito.js si existe)
  function updateCartCount(){
    try {
      if (typeof window !== 'undefined' && typeof window.actualizarContadorCarrito === 'function') {
        window.actualizarContadorCarrito();
        return;
      }
    } catch(e){}
    // fallback: contemos en primary carrito
    try {
      const cart = readPrimaryCart();
      const total = cart.reduce((s,i) => s + (i.cantidad || 0), 0);
      const span = document.getElementById('cart-count');
      if (span) span.textContent = total;
    } catch(e){}
  }

  // Añadir al carrito usando carrito.js si es posible (espera indice en window.productos y función agregarAlCarrito)
  function tryAddUsingCarritoJsByIndex(code, qty = 1){
    try {
      if (typeof window !== 'undefined' && typeof window.agregarAlCarrito === 'function' && Array.isArray(window.productos)) {
        const idx = window.productos.findIndex(p => (p.codigo || p.code || '') === String(code));
        if (idx !== -1) {
          for (let i=0;i<qty;i++) window.agregarAlCarrito(idx);
          // carrito.js se encarga de persistir y actualizar contador si tiene esa lógica
          updateCartCount();
          return true;
        }
      }
    } catch(e){}
    return false;
  }

  // Si carrito.js NO está disponible o no expone window.productos, guardar en localStorage 'carrito' (clave primaria)
  function addToPrimaryCartFallback(mappedObj, qty = 1){
    if (!mappedObj || !mappedObj.codigo) return false;
    const code = String(mappedObj.codigo);
    const cart = readPrimaryCart();
    const existing = cart.find(i => String(i.codigo) === code);
    if (existing) {
      existing.cantidad = (existing.cantidad || 0) + qty;
    } else {
      const item = {
        codigo: code,
        nombre: mappedObj.nombre || mappedObj.name || code,
        precio: Number(mappedObj.precio || mappedObj.price || 0),
        descripcion: mappedObj.descripcion || mappedObj.category || '',
        img: mappedObj.img || '',
        cantidad: qty
      };
      cart.push(item);
    }
    savePrimaryCart(cart);
    // also update legacy catalog_cart if desired (keep compatibility)
    try {
      const legacy = readLegacyCatalogCart();
      // keep legacy as [{code, qty}, ...]
      const h = legacy.find(x => x.code === code);
      if (h) h.qty = (h.qty || 0) + qty;
      else legacy.push({ code: code, qty: qty });
      saveLegacyCatalogCart(legacy);
    } catch(e){}
    updateCartCount();
    return true;
  }

  // API pública para añadir producto (intenta carrito.js, si no guarda en localStorage)
  function addToCartUnified(code, qty = 1, productObjForMapping = null){
    // 1) si carrito.js expone window.productos y window.agregarAlCarrito -> usarlo
    const usedCarritoJs = tryAddUsingCarritoJsByIndex(code, qty);
    if (usedCarritoJs) return true;

    // 2) si no, intentar mapear el producto y guardarlo en primary cart (localStorage 'carrito')
    let mapped = productObjForMapping;
    if (!mapped) {
      mapped = products.find(p => p.code === code) || null;
      if (mapped) {
        mapped = {
          codigo: mapped.code,
          nombre: mapped.name,
          precio: mapped.price,
          descripcion: mapped.category,
          img: mapped.img
        };
      }
    } else {
      // asegurar propiedades clave
      mapped = {
        codigo: mapped.codigo || mapped.code,
        nombre: mapped.nombre || mapped.name,
        precio: mapped.precio || mapped.price,
        descripcion: mapped.descripcion || mapped.category || '',
        img: mapped.img || ''
      };
    }

    if (mapped) {
      addToPrimaryCartFallback(mapped, qty);
      return true;
    }

    // 3) si no se encontró mapping, guardamos en legacy catalog_cart (por lo menos)
    try {
      const legacy = readLegacyCatalogCart();
      const existing = legacy.find(x => x.code === code);
      if (existing) existing.qty = (existing.qty || 0) + qty;
      else legacy.push({ code: code, qty: qty });
      saveLegacyCatalogCart(legacy);
      updateCartCount();
      return true;
    } catch(e){
      return false;
    }
  }

  // ---- Renderizado de tarjetas ----
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
            <button class="add-btn" data-add="${escapeAttr(p.code)}" aria-label="Agregar ${escapeAttr(p.name)}">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(filterCategory = 'all'){
    const container = document.getElementById('products-grid');
    if(!container) return;
    const list = (!filterCategory || filterCategory === 'all') ? products : products.filter(p => (p.category || '').toLowerCase() === (filterCategory || '').toLowerCase());

    if(filterCategory && filterCategory !== 'all'){
      const exact = new Set(products.map(p => (p.category || '').toLowerCase()));
      if(!exact.has(filterCategory.toLowerCase())){
        const partial = products.filter(p => (p.category || '').toLowerCase().includes(filterCategory.toLowerCase()));
        if(partial.length) { container.innerHTML = partial.map(p => productCardHtml(p)).join(''); attachCardEvents(); return; }
      }
    }

    container.innerHTML = list.map(p => productCardHtml(p)).join('');
    attachCardEvents();
  }

  // attach events for add buttons and navigation
  function attachCardEvents(){
    const container = document.getElementById('products-grid');
    if(!container) return;

    // add button events
    container.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // no navegar al detalle
        const code = e.currentTarget.dataset.add;
        const product = products.find(x => x.code === code) || null;
        const mapped = product ? {
          codigo: product.code,
          nombre: product.name,
          precio: product.price,
          descripcion: product.category,
          img: product.img
        } : null;

        // Llamada silenciosa
        addToCartUnified(code, 1, mapped);
        // actualizar contador visual (si carrito.js no lo hizo)
        try {
          if (typeof window.actualizarContadorCarrito === 'function') window.actualizarContadorCarrito();
          else updateCartCount();
        } catch(e){ updateCartCount(); }
      });
    });

    // image fallback
    container.querySelectorAll('img.product-image').forEach(img => {
      img.onerror = () => { img.onerror = null; img.src = 'img/placeholder.png'; };
    });

    // click on card navigates to product.html
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // si clic en botón agregar se paró la propagación, aquí será otro clic => navegar
        const code = card.dataset.code;
        location.href = 'product.html?code=' + encodeURIComponent(code);
      });
    });
  }

  // datalist categorías
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

  // render página de detalle
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

    const specs = (typeof window !== 'undefined' && window.productSpecs) ? window.productSpecs[code] : null;
    // we have local productSpecs defined in earlier versions; if not present just show basic
    let detailsHtml = '';
    if (!specs && product) {
      // we can show short placeholders or omit
      detailsHtml = '';
    } else if (specs && specs.details) {
      detailsHtml = `<ul>${specs.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
    }

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
            <p style="margin-top:10px">${escapeHtml((specs && specs.short) || '')}</p>
            <section class="specs">
              <h4>Especificaciones / Detalles</h4>
              ${detailsHtml}
            </section>
          </div>
        </div>
      </div>
    `;

    const addBtn = document.getElementById('btn-add-detail');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const mapped = {
          codigo: product.code,
          nombre: product.name,
          precio: product.price,
          descripcion: product.category,
          img: product.img
        };
        addToCartUnified(product.code, 1, mapped);
        try {
          if (typeof window.actualizarContadorCarrito === 'function') window.actualizarContadorCarrito();
          else updateCartCount();
        } catch(e){ updateCartCount(); }
      });
    }
  }

  function getProductByCode(code){
    return products.find(p => p.code === code) || null;
  }

  // init y exposición pública
  function init(){
    updateCartCount();
    const datalist = document.querySelector('#category-list');
    if (datalist) populateCategoriesDatalist('#category-list');
  }

  return {
    init,
    renderProducts,
    populateCategoriesDatalist,
    renderProductPage,
    getProductByCode,
    updateCartCount,
    addToCart: addToCartUnified
  };
})();

// Fin de app.js