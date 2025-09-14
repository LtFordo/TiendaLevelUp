// registrojs.js
// Guarda en localStorage la clave "levelup_users".
// Almacena: id, run, nombre, apellido, email (lowercase), edad, password, region, comuna, direccion, role, createdAt

(function () {
  const STORAGE_KEY = "levelup_users";

  document.addEventListener("DOMContentLoaded", function () {
    const regionSelect = document.getElementById("region");
    if (regionSelect) regionSelect.addEventListener("change", cargarComunas);

    const btn = document.getElementById("btn-registrar");
    if (btn) btn.addEventListener("click", validarFormulario);
  });

  /**
   * Normaliza el RUN/RUT: elimina puntos, guiones y espacios; deja en minúscula la 'k' si existe.
   * Retorna cadena limpia o '' si input vacío.
   */
  function normalizeRun(input) {
    if (!input) return "";
    return String(input).replace(/[.\-\s]/g, "").toLowerCase();
  }

  /**
   * Valida RUT chileno usando algoritmo módulo 11.
   * Se espera input ya "normalizado" (sin puntos/guión, en minúscula).
   * Además, comprobamos longitud total (incluyendo dígito verificador) entre 7 y 9 caracteres.
   *
   * Retorna true si válido, false si inválido.
   */
  function validateRUT(rutNormalized) {
    if (!rutNormalized) return false;

    // longitud total entre 7 y 9 caracteres (incluye dígito verificador)
    if (rutNormalized.length < 7 || rutNormalized.length > 9) return false;

    // separar cuerpo y dígito verificador
    const dv = rutNormalized.slice(-1); // último caracter
    const body = rutNormalized.slice(0, -1);

    // cuerpo debe ser solo dígitos
    if (!/^\d+$/.test(body)) return false;

    // calcular dígito verificador según módulo 11
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body.charAt(i)) * multiplier;
      multiplier++;
      if (multiplier > 7) multiplier = 2;
    }

    const remainder = 11 - (sum % 11);
    let dvCalc;
    if (remainder === 11) dvCalc = "0";
    else if (remainder === 10) dvCalc = "k";
    else dvCalc = String(remainder);

    return dvCalc === dv.toLowerCase();
  }

  function validarFormulario() {
    const mensajesDiv = document.getElementById("mensajes");
    mensajesDiv.innerHTML = "";

    const runRaw = (document.getElementById("run").value || "").trim();
    const run = normalizeRun(runRaw);
    const nombre = (document.getElementById("nombre").value || "").trim();
    const apellido = (document.getElementById("apellido").value || "").trim();
    const emailRaw = (document.getElementById("email").value || "").trim();
    const email = emailRaw.toLowerCase();
    const edadValue = document.getElementById("edad").value;
    const edad = edadValue === "" ? NaN : parseInt(edadValue, 10);
    const clave1 = document.getElementById("clave1").value || "";
    const clave2 = document.getElementById("clave2").value || "";
    const region = document.getElementById("region").value || "";
    const comuna = document.getElementById("comuna").value || "";
    const direccion = (document.getElementById("direccion").value || "").trim();

    const errores = [];

    // RUN: validar con algoritmo módulo 11
    if (!run) {
      errores.push("El RUN no puede estar vacío.");
    } else if (!validateRUT(run)) {
      errores.push("El RUN es inválido. Verifique el formato y el dígito verificador.");
    }

    // Nombre: no vacío, máximo 50 caracteres
    if (!nombre) {
      errores.push("El nombre no puede estar vacío.");
    } else if (nombre.length > 50) {
      errores.push("El nombre no puede superar los 50 caracteres.");
    }

    // Apellido: no vacío, máximo 100 caracteres
    if (!apellido) {
      errores.push("El apellido no puede estar vacío.");
    } else if (apellido.length > 100) {
      errores.push("El apellido no puede superar los 100 caracteres.");
    }

    // Correo: validación existente (no modificar)
    // solo permite correos que terminen exactamente en @duoc.cl, @profesor.duoc.cl o @gmail.com
    const allowedEmailRegex = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    if (!email || !allowedEmailRegex.test(email)) {
      errores.push("El correo electrónico no es válido. Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.");
    }

    // Edad
    if (isNaN(edad) || edad <= 0) errores.push("Ingrese una edad válida.");

    // Region / comuna
    if (!region) errores.push("Debe seleccionar una región.");
    if (!comuna) errores.push("Debe seleccionar una comuna.");

    // Dirección: máximo 300 caracteres, no vacío
    if (!direccion) {
      errores.push("La dirección no puede estar vacía.");
    } else if (direccion.length > 300) {
      errores.push("La dirección no puede superar los 300 caracteres.");
    }

    // Contraseña
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
      const existeEmail = usuarios.some(u => u.email && u.email.toLowerCase() === email);
      if (existeEmail) {
        mensajesDiv.innerHTML = `<div class="alert alert-danger">⚠️ Ya existe un usuario registrado con ese correo.</div>`;
        return;
      }

      // Evitar duplicado por RUN (normalizado)
      const existeRun = usuarios.some(u => normalizeRun(u.run) === run);
      if (existeRun) {
        mensajesDiv.innerHTML = `<div class="alert alert-danger">⚠️ Ya existe un usuario registrado con ese RUN.</div>`;
        return;
      }

      const nuevoUsuario = {
        id: Date.now(),
        run: run,                   // guardado normalizado (sin puntos/guión, minúscula para 'k')
        nombre: nombre,
        apellido: apellido,
        email: email,               // guardado en minúsculas
        edad: edad,
        password: clave1,
        region: region,
        comuna: comuna,
        direccion: direccion,
        role: "cliente",
        createdAt: new Date().toISOString()
      };

      usuarios.push(nuevoUsuario);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

      mensajesDiv.innerHTML = `<div class="alert alert-success">✅ Registro exitoso. Usuario guardado en localStorage (clave: ${STORAGE_KEY}).</div>`;

      // limpiarFormulario(); // opcional si quieres limpiar los campos tras registro

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
    const ids = ["run","nombre","apellido","email","edad","clave1","clave2","region","comuna","direccion"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.tagName.toLowerCase() === "select") el.selectedIndex = 0;
        else el.value = "";
      }
    });
  }
})();

