// registrojs.js
// Guarda en localStorage la clave "levelup_users".
// Almacena: id, nombre, email (lowercase), edad, password, confirmPassword, region, comuna, role, createdAt

(function () {
  const STORAGE_KEY = "levelup_users";

  document.addEventListener("DOMContentLoaded", function () {
    const regionSelect = document.getElementById("region");
    if (regionSelect) regionSelect.addEventListener("change", cargarComunas);

    const btn = document.getElementById("btn-registrar");
    if (btn) btn.addEventListener("click", validarFormulario);
  });

  function validarFormulario() {
    const mensajesDiv = document.getElementById("mensajes");
    mensajesDiv.innerHTML = "";

    const nombre = (document.getElementById("nombre").value || "").trim();
    const emailRaw = (document.getElementById("email").value || "").trim();
    const email = emailRaw.toLowerCase();
    const edadValue = document.getElementById("edad").value;
    const edad = edadValue === "" ? NaN : parseInt(edadValue, 10);
    const clave1 = document.getElementById("clave1").value || "";
    const clave2 = document.getElementById("clave2").value || "";
    const region = document.getElementById("region").value || "";
    const comuna = document.getElementById("comuna").value || "";

    const errores = [];

    if (!nombre) errores.push("El nombre no puede estar vacío.");
    // solo permite correos que terminen exactamente en @duoc.cl, @profesor.duoc.cl o @gmail.com
    const allowedEmailRegex = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    if (!email || !allowedEmailRegex.test(email)) {
      errores.push("El correo electrónico no es válido. Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.");}
    if (isNaN(edad) || edad <= 0) errores.push("Ingrese una edad válida.");
    if (!region) errores.push("Debe seleccionar una región.");
    if (!comuna) errores.push("Debe seleccionar una comuna.");
    if (typeof clave1 !== "string" || clave1.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
    if (clave1 !== clave2) errores.push("Las contraseñas no coinciden.");

    if (errores.length > 0) {
      mensajesDiv.innerHTML = `<div class="alert alert-danger"><ul><li>${errores.join("</li><li>")}</li></ul></div>`;
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const usuarios = raw ? JSON.parse(raw) : [];

      // Evitar duplicado por email (case-insensitive)
      const existe = usuarios.some(u => u.email && u.email.toLowerCase() === email);
      if (existe) {
        mensajesDiv.innerHTML = `<div class="alert alert-danger">⚠️ Ya existe un usuario registrado con ese correo.</div>`;
        return;
      }

      const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        email: email,                // guardado en minúsculas
        edad: edad,
        password: clave1,
        region: region,
        comuna: comuna,
        role: "cliente",
        createdAt: new Date().toISOString()
      };

      usuarios.push(nuevoUsuario);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

      mensajesDiv.innerHTML = `<div class="alert alert-success">✅ Registro exitoso. Usuario guardado en localStorage (clave: ${STORAGE_KEY}).</div>`;

      // limpiarFormulario();

    } catch (err) {
      console.error("Error guardando usuario en localStorage:", err);
      mensajesDiv.innerHTML = `<div class="alert alert-danger">Ocurrió un error al guardar el usuario.</div>`;
    }
  }

  function cargarComunas() {
    const regionSelect = document.getElementById("region");
    const comunaSelect = document.getElementById("comuna");
    if (!regionSelect || !comunaSelect) return;

    const comunasPorRegion = {
      "Región Metropolitana": ["Santiago", "Las Condes", "Providencia", "La Florida"],
      "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"],
      "Región del Biobío": ["Concepción", "Talcahuano", "Chiguayante"]
    };

    comunaSelect.innerHTML = "<option value=''>Seleccione una comuna</option>";
    const comunas = comunasPorRegion[regionSelect.value] || [];
    comunas.forEach(c => {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = c;
      comunaSelect.appendChild(option);
    });
  }

  // (Opcional) limpiar formulario si deseas activar
  function limpiarFormulario() {
    const ids = ["nombre","email","edad","clave1","clave2","region","comuna"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.tagName.toLowerCase() === "select") el.selectedIndex = 0;
        else el.value = "";
      }
    });
  }
})();
