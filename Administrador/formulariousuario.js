document.addEventListener("DOMContentLoaded", function () {
  const usuariosTableBody = document.querySelector("#usuariosTable tbody");

  function cargarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuariosTableBody.innerHTML = "";

    usuarios.forEach((usuario) => {
      const row = document.createElement("tr");

      const nombreCell = document.createElement("td");
      nombreCell.textContent = usuario.nombre;
      row.appendChild(nombreCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = usuario.email;
      row.appendChild(emailCell);

      const edadCell = document.createElement("td");
      edadCell.textContent = usuario.edad;
      row.appendChild(edadCell);

      const regionCell = document.createElement("td");
      regionCell.textContent = usuario.region;
      row.appendChild(regionCell);

      const comunaCell = document.createElement("td");
      comunaCell.textContent = usuario.comuna;
      row.appendChild(comunaCell);

      usuariosTableBody.appendChild(row);
    });
  }

  cargarUsuarios();
});
