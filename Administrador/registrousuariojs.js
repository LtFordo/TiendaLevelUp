function validarFormulario() {
  let errores = [];

  let nombre = document.getElementById("nombre").value.trim();
  let email = document.getElementById("email").value.trim();
  let edad = parseInt(document.getElementById("edad").value);
  let clave1 = document.getElementById("clave1").value;
  let clave2 = document.getElementById("clave2").value;
  let region = document.getElementById("region").value;
  let comuna = document.getElementById("comuna").value;

  // Validar nombre
  if (nombre === "") {
    errores.push("El nombre no puede estar vacío.");
  }

  // Validar correo
  if (!email.includes("@")) {
    errores.push("El correo electrónico no es válido.");
  }

  // Validar edad
  if (isNaN(edad) || edad <= 0) {
    errores.push("Ingrese una edad válida.");
  }

  // Validar región
  if (region === "") {
    errores.push("Debe seleccionar una región.");
  }

  // Validar comuna
  if (comuna === "") {
    errores.push("Debe seleccionar una comuna.");
  }

  // Validar contraseña
  if (clave1.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres.");
  }

  // Confirmar contraseña
  if (clave1 !== clave2) {
    errores.push("Las contraseñas no coinciden.");
  }

  // Mostrar mensajes
  let mensajesDiv = document.getElementById("mensajes");
  mensajesDiv.innerHTML = "";

  if (errores.length > 0) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger"><ul><li>${errores.join("</li><li>")}</li></ul></div>`;
  } else {
    mensajesDiv.innerHTML = `<div class="alert alert-success">✅ Registro exitoso</div>`;

    // Save user data to localStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios.push({
      nombre: nombre,
      email: email,
      edad: edad,
      region: region,
      comuna: comuna
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
}

// Función para cargar las comunas según la región seleccionada
function cargarComunas() {
  const regionSelect = document.getElementById("region");
  const comunaSelect = document.getElementById("comuna");

  const comunasPorRegion = {
    "Región Metropolitana": ["Santiago", "Las Condes", "Providencia", "La Florida"],
    "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"],
    "Región del Biobío": ["Concepción", "Talcahuano", "Chiguayante"]
    // Agrega más regiones y comunas según sea necesario
  };

  comunaSelect.innerHTML = "<option value=''>Seleccione una comuna</option>";

  const comunas = comunasPorRegion[regionSelect.value] || [];
  comunas.forEach(comuna => {
    const option = document.createElement("option");
    option.value = comuna;
    option.textContent = comuna;
    comunaSelect.appendChild(option);
  });
}

// Agregar evento para actualizar comunas cuando cambia la región
document.getElementById("region").addEventListener("change", cargarComunas);
