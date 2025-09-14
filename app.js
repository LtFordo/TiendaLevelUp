/* /app.js
   ÚNICAMENTE: mantener persistencia products_table/productSpecs_table y exponer API.
   Restauración estricta de la estructura HTML de cada tarjeta para respetar CSS.
   No modifico HTML/CSS del proyecto.
*/

/* global window, document, localStorage, console */
(function () {
  'use strict';

  // KEYS
  var PRODUCTS_KEY = 'products_table';
  var PRODUCT_SPECS_KEY = 'productSpecs_table';
  var CART_KEY = 'carrito';

  // SEED (no tocar)
  var productsSeed = [
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

  var productSpecsSeed = {
    'JM001': { short: 'Catan — juego de estrategia de colocación y comercio.', details: ['Jugadores: 3–4', 'Tiempo de juego: 60–120 min'] },
    'JM002': { short: 'Carcassonne — colocación de losetas.', details: ['Jugadores: 2–5', 'Tiempo de juego: 30–45 min'] },
    'AC001': { short: 'Control inalámbrico Xbox/PC.', details: ['Conectividad: Bluetooth/USB-C'] },
    'AC002': { short: 'Auriculares HyperX Cloud II.', details: ['Micrófono desmontable'] },
    'CO001': { short: 'PS5 — consola Sony.', details: ['CPU: AMD Zen2', 'GPU: RDNA2'] },
    'CG001': { short: 'PC Gamer ASUS ROG Strix.', details: ['Varía por modelo'] },
    'SG001': { short: 'Secretlab Titan — silla.', details: ['Soporte lumbar'] },
    'MS001': { short: 'Logitech G502 HERO — mouse.', details: ['Sensor HERO'] },
    'MP001': { short: 'Razer Goliathus — mousepad.', details: ['Base antideslizante'] },
    'PP001': { short: 'Polera personalizada.', details: ['Material: algodón/mezcla'] }
  };

  // UTIL
  function safeGetJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('safeGetJSON', key, e);
      return fallback;
    }
  }
  function safeSetJSON(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error('safeSetJSON', key, e);
      return false;
    }
  }
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; });
  }
  function formatCLP(n) {
    try { return Number(n).toLocaleString('es-CL'); } catch (e) { return String(n); }
  }

  // STORAGE: init/read/save (essentials only)
  function initStorageIfEmpty() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      safeSetJSON(PRODUCTS_KEY, productsSeed.slice());
      console.info('[CatalogApp] seed products written');
    }
    if (!localStorage.getItem(PRODUCT_SPECS_KEY)) {
      safeSetJSON(PRODUCT_SPECS_KEY, Object.assign({}, productSpecsSeed));
      console.info('[CatalogApp] seed specs written');
    }
  }
  function readProducts() { return safeGetJSON(PRODUCTS_KEY, productsSeed.slice()); }
  function saveProducts(arr) { return safeSetJSON(PRODUCTS_KEY, arr); }
  function readSpecs() { return safeGetJSON(PRODUCT_SPECS_KEY, Object.assign({}, productSpecsSeed)); }
  function saveSpecs(obj) { return safeSetJSON(PRODUCT_SPECS_KEY, obj); }

  // ADMIN minimal (compatible)
  function adminList() { initStorageIfEmpty(); return readProducts(); }
  function adminGet(code) { if (!code) return null; var a = readProducts(); for (var i=0;i<a.length;i++) if (String(a[i].code) === String(code)) return a[i]; return null; }
  function adminAdd(obj) {
    if (!obj || !obj.code) return { ok:false, msg:'code required' };
    var arr = readProducts();
    for (var i=0;i<arr.length;i++) if (String(arr[i].code) === String(obj.code)) return { ok:false, msg:'exists' };
    arr.push({ code:String(obj.code), category: obj.category||'', name: obj.name||'', price: Number(obj.price||0), img: obj.img||'', stock: Number(obj.stock||0) });
    var ok = saveProducts(arr);
    var specs = readSpecs(); specs[obj.code] = { short: obj.short||'', details: Array.isArray(obj.details) ? obj.details.slice() : (obj.details ? [obj.details] : []) }; saveSpecs(specs);
    return { ok: ok };
  }
  function adminUpdate(code, up) {
    if (!code) return { ok:false, msg:'code required' };
    var arr = readProducts(); var idx=-1;
    for (var i=0;i<arr.length;i++) if (String(arr[i].code) === String(code)) { idx=i; break; }
    if (idx === -1) return { ok:false, msg:'not found' };
    arr[idx] = {
      code: code,
      category: (typeof up.category !== 'undefined') ? up.category : arr[idx].category,
      name: (typeof up.name !== 'undefined') ? up.name : arr[idx].name,
      price: Number(typeof up.price !== 'undefined' ? up.price : arr[idx].price),
      img: (typeof up.img !== 'undefined') ? up.img : arr[idx].img,
      stock: Number(typeof up.stock !== 'undefined' ? up.stock : arr[idx].stock || 0)
    };
    var okP = saveProducts(arr);
    var specs = readSpecs();
    specs[code] = { short: (up && up.short) ? up.short : (specs[code] && specs[code].short) || '', details: Array.isArray(up && up.details) ? up.details.slice() : (up && up.details ? [up.details] : (specs[code] && specs[code].details) || []) };
    saveSpecs(specs);
    return { ok: okP };
  }
  function adminDelete(code) {
    if (!code) return { ok:false, msg:'code required' };
    var arr = readProducts(); var idx=-1;
    for (var i=0;i<arr.length;i++) if (String(arr[i].code) === String(code)) { idx=i; break; }
    if (idx === -1) return { ok:false, msg:'not found' };
    arr.splice(idx,1);
    var okP = saveProducts(arr);
    var specs = readSpecs(); if (specs && typeof specs[code] !== 'undefined') delete specs[code]; saveSpecs(specs);
    return { ok: okP };
  }
  var adminAPI = { initStorage: initStorageIfEmpty, list: adminList, get: adminGet, add: adminAdd, update: adminUpdate, del: adminDelete, readSpecs: readSpecs, saveSpecs: saveSpecs, PRODUCTS_KEY: PRODUCTS_KEY, PRODUCT_SPECS_KEY: PRODUCT_SPECS_KEY };

  // CART minimal
  function readCart() { return safeGetJSON(CART_KEY, []); }
  function saveCart(arr) { return safeSetJSON(CART_KEY, arr); }
  function addToCartUnified(code, qty, mapping) {
    if (!code) return false;
    if (!qty) qty = 1;
    try {
      var mapped = mapping || null;
      if (!mapped) {
        var arr = readProducts();
        for (var i=0;i<arr.length;i++) if (String(arr[i].code) === String(code)) { mapped = { codigo: arr[i].code, nombre: arr[i].name, precio: arr[i].price, img: arr[i].img }; break; }
      }
      if (!mapped) return false;
      var cart = readCart();
      var f = null;
      for (var j=0;j<cart.length;j++) if (String(cart[j].codigo) === String(mapped.codigo)) { f = cart[j]; break; }
      if (f) f.cantidad = (f.cantidad || 0) + qty;
      else cart.push({ codigo: String(mapped.codigo), nombre: mapped.nombre, precio: Number(mapped.precio || mapped.price || 0), cantidad: qty, img: mapped.img || '' });
      saveCart(cart);
      updateCartCount();
      return true;
    } catch (e) { console.error('addToCartUnified', e); return false; }
  }
  function updateCartCount() {
    try {
      var cart = readCart();
      var total = 0;
      for (var i=0;i<cart.length;i++) total += Number(cart[i].cantidad || 0);
      var el = document.getElementById('cart-count') || document.getElementById('nav-cart-count') || document.querySelector('.cart-link span');
      if (el) el.textContent = total;
    } catch (e) { /* ignore */ }
  }

  // ---------- RENDER: respetando estructura exacta
  // Esta función construye la tarjeta **con la estructura original** que tu CSS espera.
  function productCardHtml(p) {
    var img = p.img || 'img/default.png';
    // Estructura respetada: article.product-card > img.product-image + div.product-body { div (title/meta) , div.product-footer (price + button) }
    // Añadimos link en imagen y en título **sin cambiar color**: anchor tiene inline style color:inherit; text-decoration:none;
    var codeEnc = encodeURIComponent(p.code);
    var out = '';
    out += '<article class="product-card" data-code="' + esc(p.code) + '">';
    out +=   '<a href="product.html?code=' + codeEnc + '" style="color:inherit;text-decoration:none;">';
    out +=     '<img class="product-image" src="' + esc(img) + '" alt="' + esc(p.name) + '" onerror="this.onerror=null;this.src=\'img/default.png\'" />';
    out +=   '</a>';
    out +=   '<div class="product-body">';
    out +=     '<div>';
    out +=       '<div class="product-title"><a href="product.html?code=' + codeEnc + '" style="color:inherit;text-decoration:none;">' + esc(p.name) + '</a></div>';
    out +=       '<div class="product-meta">' + esc(p.category) + '</div>';
    out +=     '</div>';
    out +=     '<div class="product-footer">';
    out +=       '<div class="price">$' + formatCLP(p.price) + '</div>';
    out +=       '<div style="display:flex;gap:8px;"><button class="btn btn-cerulean add-to-cart" data-code="' + esc(p.code) + '">Añadir</button></div>';
    out +=     '</div>';
    out +=   '</div>';
    out += '</article>';
    return out;
  }

  function renderProducts(filterCategory) {
    try {
      var container = document.getElementById('products-grid');
      if (!container) return;
      var list = readProducts();
      if (filterCategory && filterCategory !== 'all') {
        var fc = String(filterCategory).toLowerCase();
        var filtered = [];
        for (var i=0;i<list.length;i++){
          var p = list[i];
          if ((p.category || '').toLowerCase() === fc || (p.name || '').toLowerCase().indexOf(fc) !== -1) filtered.push(p);
        }
        list = filtered;
      }
      var html = [];
      for (var j=0;j<list.length;j++) html.push(productCardHtml(list[j]));
      container.innerHTML = html.join('');
      // attach events: add-to-cart buttons
      var adds = container.querySelectorAll('.add-to-cart');
      for (var k=0;k<adds.length;k++){
        (function(btn){
          btn.removeEventListener('click', onGridAddClick);
          btn.addEventListener('click', onGridAddClick);
        }(adds[k]));
      }
      // attach click on whole article -> go to detail when clicking outside buttons/links
      var articles = container.querySelectorAll('article.product-card');
      for (var a=0;a<articles.length;a++){
        (function(article){
          article.removeEventListener('click', onArticleClick);
          article.addEventListener('click', onArticleClick);
        }(articles[a]));
      }
      updateCartCount();
    } catch (e) { console.error('renderProducts', e); }
  }

  function onGridAddClick(e) {
    e.preventDefault();
    e.stopPropagation();
    var code = e.currentTarget.getAttribute('data-code');
    if (!code) return;
    addToCartUnified(code, 1, null);
  }

  // clicking on article (but ignore clicks on anchors or buttons)
  function onArticleClick(e) {
    var target = e.target || e.srcElement;
    // if clicked an <a> or a button, do nothing (the <a> will navigate)
    var node = target;
    while (node && node !== this) {
      if (node.tagName && node.tagName.toLowerCase() === 'a') return;
      if (node.classList && (node.classList.contains('add-to-cart') || node.tagName.toLowerCase() === 'button')) return;
      node = node.parentNode;
    }
    var code = this.getAttribute('data-code');
    if (code) {
      // navigate to product detail
      try { location.href = 'product.html?code=' + encodeURIComponent(code); } catch (err) {}
    }
  }

  function populateCategoriesDatalist(selector) {
    try {
      var datalist = document.querySelector(selector);
      if (!datalist) return;
      var arr = readProducts();
      var set = {};
      for (var i=0;i<arr.length;i++) set[arr[i].category || 'Sin categoría'] = true;
      var opts = [];
      for (var k in set) if (set.hasOwnProperty(k)) opts.push('<option value="' + esc(k) + '"></option>');
      datalist.innerHTML = opts.sort().join('');
    } catch (e) { console.error('populateCategoriesDatalist', e); }
  }

  function renderProductPage(code) {
    try {
      var root = document.getElementById('product-detail');
      if (!root) return;
      if (!code) { root.innerHTML = '<p>Producto no especificado.</p>'; return; }
      var arr = readProducts();
      var prod = null;
      for (var i=0;i<arr.length;i++) if (String(arr[i].code) === String(code)) { prod = arr[i]; break; }
      if (!prod) { root.innerHTML = '<p>Producto no encontrado.</p>'; return; }
      var specs = readSpecs(); var sp = specs && specs[code] ? specs[code] : { short:'', details:[] };

      var html = '';
      html += '<article class="card product-detail-card"><div class="grid">';
      html += '<div class="detail-image"><img src="' + esc(prod.img || 'img/default.png') + '" alt="' + esc(prod.name) + '" onerror="this.onerror=null;this.src=\'img/default.png\'" /></div>';
      html += '<div class="detail-body">';
      html += '<h1>' + esc(prod.name) + '</h1>';
      html += '<div class="meta">' + esc(prod.category) + ' — Código: ' + esc(prod.code) + '</div>';
      html += '<p class="price">$' + formatCLP(prod.price) + ' CLP</p>';
      if (sp && sp.short) html += '<p>' + esc(sp.short) + '</p>';
      if (sp && sp.details && sp.details.length) { html += '<h4>Detalles</h4><ul>'; for (var d=0; d<sp.details.length; d++) html += '<li>' + esc(sp.details[d]) + '</li>'; html += '</ul>'; }
      html += '<div class="detail-actions"><button id="btn-add-detail" class="btn">Añadir al carrito</button></div>';
      html += '</div></div></article>';

      root.innerHTML = html;

      var btn = document.getElementById('btn-add-detail');
      if (btn) btn.addEventListener('click', function () { addToCartUnified(prod.code, 1, { codigo: prod.code, nombre: prod.name, precio: prod.price, img: prod.img }); });

    } catch (e) { console.error('renderProductPage', e); }
  }

  // INIT
  function init() {
    try { initStorageIfEmpty(); } catch (e) { /* ignore */ }
    try { updateCartCount(); } catch (e) { /* ignore */ }
    // pages call renderProducts / renderProductPage explicitly
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      try { init(); } catch (e) { console.error('CatalogApp init failed', e); }
    });
  }

  // EXPORT
  var API = {
    init: init,
    renderProducts: renderProducts,
    populateCategoriesDatalist: populateCategoriesDatalist,
    renderProductPage: renderProductPage,
    addToCart: addToCartUnified,
    updateCartCount: updateCartCount,
    admin: adminAPI,
    _internal: { readProducts: readProducts, readSpecs: readSpecs }
  };

  try { window.CatalogApp = API; } catch (e) { /* ignore */ }

}());
