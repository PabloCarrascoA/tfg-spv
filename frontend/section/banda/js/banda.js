document.addEventListener("DOMContentLoaded", async () => {

  const selectBanda = document.getElementById("codigo");
  const selectTipoEmpalme = document.getElementById("tipoEmpalme");
  const selectCodigoEmpalme = document.getElementById("codigoEmpalme");
  const selectCodigoPerfilLongitudinal = document.getElementById("selectCodigoPerfilLongitudinal");
  const selectCodigoPerfilTransversal = document.getElementById("selectCodigoPerfilTransversal");

  // -------------------------
  // CARGAR BANDAS
  // -------------------------

  const optionDefault = document.createElement("option");
  optionDefault.value = "";
  optionDefault.textContent = "-- Selecciona una banda --";
  optionDefault.disabled = true;
  optionDefault.selected = true;
  selectBanda.appendChild(optionDefault);

  try {
    const response = await fetch("http://127.0.0.1:8000/configuracion/bandas");
    const bandas = await response.json();

    bandas.forEach(banda => {
      const option = document.createElement("option");
      option.value = banda.codigo;
      option.textContent = `${banda.codigo} - ${banda.nombre}`;
      selectBanda.appendChild(option);
    });

  } catch (err) {
    console.error("Error cargando bandas:", err);
  }

  // -------------------------
  // CARGAR PERFILES LONGITUDINALES
  // -------------------------

  try {
    const response = await fetch("http://127.0.0.1:8000/configuracion/perfiles/longitudinales");
    const perfilesL = await response.json();

    perfilesL.forEach(perfilL => {
      const option = document.createElement("option");
      option.value = perfilL.codigo;
      option.textContent = `${perfilL.codigo} - ${perfilL.nombre}`;
      selectCodigoPerfilLongitudinal.appendChild(option);
    });

  } catch (err) {
    console.error("Error cargando perfiles longitudinales:", err);
  }

  // -------------------------
  // CARGAR PERFILES TRANSVERSALES
  // -------------------------

  try {
    const response = await fetch("http://127.0.0.1:8000/configuracion/perfiles/transversales");
    const perfilesT = await response.json();

    perfilesT.forEach(perfilT => {
      const option = document.createElement("option");
      option.value = perfilT.codigo;
      option.textContent = `${perfilT.codigo} - ${perfilT.nombre}`;
      selectCodigoPerfilTransversal.appendChild(option);
    });

  } catch (err) {
    console.error("Error cargando perfiles longitudinales:", err);
  }

  // -------------------------
  // CAMBIO TIPO EMPALME
  // -------------------------

  selectTipoEmpalme.addEventListener("change", async () => {

    const tipo = selectTipoEmpalme.value;

    selectCodigoEmpalme.innerHTML = "";
    selectCodigoEmpalme.disabled = false;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona código --";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectCodigoEmpalme.appendChild(defaultOption);

    // Banda abierta no necesita código en BD
    if (tipo === "banda-abierta") {
      const option = document.createElement("option");
      option.value = "BA";
      option.textContent = "Banda Abierta (precio fijo)";
      selectCodigoEmpalme.appendChild(option);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/configuracion/empalmes/`
      );

      const empalmes = await response.json();

      empalmes.forEach(empalme => {
        const option = document.createElement("option");
        option.value = empalme.codigo;
        option.textContent = `${empalme.codigo} - ${empalme.precio} €`;
        selectCodigoEmpalme.appendChild(option);
      });

    } catch (err) {
      console.error("Error cargando empalmes:", err);
    }

  });

  // -------------------------
  // PERFILES LONGITUDINALES (REMOVED - now loaded on page load)
  // -------------------------

  // REMOVED: selectCodigoPerfilLongitudinal.addEventListener("change", async () => { ... });

  document.getElementById("calcular").addEventListener("click", calcular);

});


// -------------------------
// CALCULAR
// -------------------------

async function calcular() {

  const codigo = document.getElementById("codigo").value;
  const largo = parseFloat(document.getElementById("largo").value);
  const ancho = parseFloat(document.getElementById("ancho").value);
  const tipoEmpalme = document.getElementById("tipoEmpalme").value;
  const codigoEmpalme = document.getElementById("codigoEmpalme").value;

  if (!codigo || !tipoEmpalme || !codigoEmpalme) {
    alert("Debes seleccionar banda y empalme.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/configuracion/calcular",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo_banda: codigo,
          largo: largo,
          ancho: ancho,
          tipo_empalme: tipoEmpalme,
          codigo_empalme: codigoEmpalme,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      document.getElementById("resultado").innerText =
        `Precio banda: ${data.precio_banda} €
        Precio empalme: ${data.precio_empalme} €
        Precio total: ${data.precio_total} €`;
    } else {
      document.getElementById("resultado").innerText =
        "Error: " + data.detail;
    }

  } catch (err) {
    console.error("Error cálculo:", err);
  }
}