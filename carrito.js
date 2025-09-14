
// Si hay productos guardados por el admin, se usan esos.
// Si no hay nada en localStorage, cargamos productos por defecto

const productos = JSON.parse(localStorage.getItem("productosAdmin")) || [
    { codigo: 'JM001', category: 'Juegos de Mesa', nombre: 'Catan', precio: 29990, img: 'img/Sebas/JM001.jpg', stock: 20 },
    { codigo: 'JM002', category: 'Juegos de Mesa', nombre: 'Carcassonne', precio: 24990, img: 'img/Sebas/JM002.jpg', stock: 15 },
    { codigo: 'AC001', category: 'Accesorios', nombre: 'Joystick Xbox Series X', precio: 59990, img: 'img/Sebas/AC001.jpg', stock: 22 },
    { codigo: 'AC002', category: 'Accesorios', nombre: 'Auriculares Gamer HyperX Cloud II', precio: 79990, img: 'img/Sebas/AC002.jpg', stock: 16 },
    { codigo: 'CO001', category: 'Consolas', nombre: 'PlayStation 5', precio: 549990, img: 'img/Sebas/CO001.jpg', stock: 10 },
    { codigo: 'CG001', category: 'Computadores Gamers', nombre: 'PC Gamer ASUS ROG Strix', precio: 1299990, img: 'img/Sebas/CG001.jpg', stock: 5 },
    { codigo: 'SG001', category: 'Sillas Gamers', nombre: 'Silla Gamer Secretlab Titan', precio: 349990, img: 'img/Sebas/SG001.jpg', stock: 9 },
    { codigo: 'MS001', category: 'Mouse', nombre: 'Mouse Gamer Logitech G502 HERO', precio: 49990, img: 'img/Sebas/MS001.jpg', stock: 13 },
    { codigo: 'MP001', category: 'Mousepad', nombre: 'Mousepad Razer Goliathus Extended Chroma', precio: 29990, img: 'img/Sebas/MP001.jpg', stock: 19 },
    { codigo: 'PP001', category: 'Poleras Personalizadas', nombre: "Polera Gamer Personalizada 'Level-Up'", precio: 14990, img: 'img/Sebas/PP001.jpg', stock: 50 }
  
];

// Carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Renderizar productos (versión genérica para catálogos)
function mostrarProductos() {
  const lista = document.getElementById("product-list");
  if (!lista) return; // evita errores si no existe en la página actual
  lista.innerHTML = "";
  productos.forEach((p, i) => {
    lista.innerHTML += `
      <div class="producto">
        <h3>${p.nombre}</h3>
        <p>Precio: $${p.precio.toLocaleString()} CLP</p>
        <a href="detalle.html?id=${i}"><button>Ver detalle</button></a>
        <button onclick="agregarAlCarrito(${i})">Agregar al carrito</button>
      </div>
    `;
  });
}

// Renderizar carrito
function mostrarCarrito() {
  const lista = document.getElementById("cart-list");
  const totalDiv = document.getElementById("cart-total");
  if (!lista || !totalDiv) return;

  lista.innerHTML = "";
  let total = 0;

  carrito.forEach((item, i) => {
    total += item.precio * item.cantidad;
    lista.innerHTML += `
      <div>
        ${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toLocaleString()} CLP
        <button onclick="eliminarDelCarrito(${i})">❌</button>
      </div>
    `;
  });

  totalDiv.innerText = "Total: $" + total.toLocaleString() + " CLP";

  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Agregar producto al carrito
function agregarAlCarrito(indice) {
  const producto = productos[indice];
  const existe = carrito.find(item => item.codigo === producto.codigo);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  mostrarCarrito();
}

// Eliminar producto del carrito
function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);
  mostrarCarrito();
}

// Vaciar carrito
function vaciarCarrito() {
  carrito = [];
  mostrarCarrito();
}

// Inicialización
mostrarProductos();
mostrarCarrito();
