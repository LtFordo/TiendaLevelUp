
// Si hay productos guardados por el admin, se usan esos.
// Si no hay nada en localStorage, cargamos productos por defecto


//lista productos
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
//detalle productos
  const productSpecs = {
    'JM001': { short: 'Catan — juego de estrategia de colocación y comercio.', details: ['Jugadores: 3–4 (ampliable 5–6 con expansión).','Tiempo de juego: 60–120 minutos.','Edad recomendada: 10+.','Componentes: tablero modular hexagonal, cartas de recursos, fichas, carreteras/poblados/ciudades, dados y cartas de desarrollo.','Mecánicas: comercio, colocación de losetas, gestión de recursos.'] },
    'JM002': { short: 'Carcassonne — juego de losetas con colocación de meeples.', details: ['Jugadores: 2–5.','Tiempo de juego: ~30–45 minutos.','Edad recomendada: 7+.','Componentes: losetas de terreno, meeples en varios colores y marcadores de puntuación.','Mecánicas: colocación de losetas, control de áreas y puntuación por ciudades/caminos/monasterios/pastizales.'] },
    'AC001': { short: 'Controlador inalámbrico compatible Xbox Series X/S y PC.', details: ['Conectividad: Xbox Wireless, Bluetooth y USB-C para conexión por cable.','Compatibilidad: Xbox Series X|S, Windows 10/11, Android, iOS.','Autonomía: depende de baterías AA (estimado en el sitio oficial).','Funciones: gatillos hápticos, D-pad y emparejamiento multi-dispositivo.'] },
    'AC002': { short: 'HyperX Cloud II — headset gaming circumaural USB/analógico.', details: ['Drivers: 53 mm con imanes de neodimio.','Respuesta de frecuencia (según HyperX): 10 Hz–23 kHz.','Micrófono: condensador electret desmontable, con cancelación de ruido.','Compatibilidad: PC, PS5, PS4, Xbox Series X|S, Nintendo Switch y dispositivos móviles.','Construcción: estructura de aluminio; almohadillas de memory foam.'] },
    'CO001': { short: 'PlayStation 5 — consola Sony de nueva generación.', details: ['CPU: AMD Zen 2 basado (8 núcleos a frecuencia variable).','GPU: RDNA 2 personalizado de AMD con trazado de rayos.','Memoria: 16 GB GDDR6.','Almacenamiento: SSD NVMe ultra-rápido; soporte de expansión NVMe.','Soporte de vídeo: hasta 4K@120Hz y salida 8K (según título y configuración).'] },
    'CG001': { short: 'PC Gamer ASUS ROG Strix — familia ROG Strix con variantes (GPU/Núcleo variable).', details: ['Serie: ROG Strix (es una línea; las especificaciones varían por modelo).','Opciones típicas: GPUs NVIDIA RTX (3060/4070/4080...), CPUs Intel o AMD (i5/i7/i9 o Ryzen 5/7/9), memoria DDR4/DDR5 y SSD NVMe.','Recomendación: revisar la ficha del modelo exacto para RAM, GPU y almacenamiento antes de comprar.'] },
    'SG001': { short: 'Secretlab Titan — silla gamer de gama alta (varias variantes).', details: ['Tamaños y variantes: Regular / XL / Small; materiales: NEO™ Hybrid Leatherette o tejido tejido (SoftWeave).','Ajustes: soporte lumbar integrado ajustable, inclinación, reposabrazos 4D.','Carga máxima y rango recomendado dependen de la variante (ver comparativa de Secretlab).'] },
    'MS001': { short: 'Logitech G502 HERO — mouse gaming con sensor HERO y pesos ajustables.', details: ['Sensor: HERO (100–25.600 DPI).','Pesos tunables: sistema de 5 pesos (3.6 g cada uno) para ajustar inercia.','Botones: múltiples botones programables y software G HUB para perfiles.','Dimensiones y peso: ver ficha oficial para datos exactos.'] },
    'MP001': { short: 'Razer Goliathus Extended Chroma — mousepad RGB extendido.', details: ['Superficie optimizada para sensores ópticos y láser.','Tamaño extendido para teclado+mause; iluminación RGB personalizable (requiere controlador compatible).','Construcción: base antideslizante de goma.'] },
    'PP001': { short: 'Polera gamer personalizada — prenda textil con impresión personalizada.', details: ["Material: algodón / mezcla poliéster (según acabados solicitados).","Tallas disponibles: S / M / L / XL (según stock).","Personalización: método de impresión y plazos varían según pedido."] }
  };

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
