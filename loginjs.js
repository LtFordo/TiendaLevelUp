// js/loginjs.js
// Valida credenciales frente a localStorage (clave: levelup_users).
// Normaliza email (lowercase) y compara password exactamente.

function iniciarSesion() {
  const mensajesDiv = document.getElementById('mensajes');
  mensajesDiv.innerHTML = '';

  const emailRaw = (document.getElementById('email') && document.getElementById('email').value) || '';
  const password = (document.getElementById('password') && document.getElementById('password').value) || '';

  const email = emailRaw.trim().toLowerCase();

  if (!email) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Ingrese su correo electrónico.</div>`;
    return;
  }
  if (!password) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Ingrese su contraseña.</div>`;
    return;
  }

  const STORAGE_KEY = 'levelup_users';
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error accediendo a localStorage:', err);
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Error accediendo al almacenamiento local.</div>`;
    return;
  }

  if (!raw) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger">No hay usuarios registrados. Regístrese primero.</div>`;
    return;
  }

  let usuarios;
  try {
    usuarios = JSON.parse(raw);
    if (!Array.isArray(usuarios)) throw new Error('Formato de usuarios inválido');
  } catch (err) {
    console.error('Error parseando usuarios desde localStorage:', err);
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Datos de usuarios corruptos en localStorage.</div>`;
    return;
  }

  // Buscar usuario por email (case-insensitive)
  const usuario = usuarios.find(u => {
    return (u.email || '').toString().trim().toLowerCase() === email;
  });

  if (!usuario) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Usuario o contraseña incorrectos.</div>`;
    return;
  }

  // Comparar contraseña (la implementación actual almacena la contraseña en claro)
  if ((usuario.password || '') !== password) {
    mensajesDiv.innerHTML = `<div class="alert alert-danger">Usuario o contraseña incorrectos.</div>`;
    return;
  }

  // Guardar sesión mínima
  try {
    const session = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role || 'cliente',
      loggedAt: new Date().toISOString()
    };
    localStorage.setItem('levelup_session', JSON.stringify(session));
  } catch (err) {
    console.warn('No se pudo guardar sesión en localStorage:', err);
    // no impedimos el login por esto
  }

  // Redirigir según rol
  if ((usuario.role || '').toString().toLowerCase() === 'admin') {
    window.location.href = 'Administrador/Admin.html';
  } else {
    window.location.href = 'index.html';
  }
}
