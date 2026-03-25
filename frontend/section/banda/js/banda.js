document.addEventListener("DOMContentLoaded", async () => {

  const selectBanda = document.getElementById("codigo");
  const selectTipoEmpalme = document.getElementById("tipoEmpalme");
  const selectCodigoEmpalme = document.getElementById("codigoEmpalme");
  const selectCodigoPerfilLongitudinal = document.getElementById("selectCodigoPerfilLongitudinal");
  const selectCodigoPerfilTransversal = document.getElementById("selectCodigoPerfilTransversal");
  const tipoPerfilSelect = document.getElementById("tipoPerfilSelect");
  const perfilesLongitudinalesSection = document.getElementById("perfilesLongitudinalesSection");
  const perfilesTransversalesSection = document.getElementById("perfilesTransversalesSection");

  // -------------------------
  // CAMBIO TIPO DE PERFIL
  // -------------------------

  tipoPerfilSelect.addEventListener("change", () => {
    const tipoSelected = tipoPerfilSelect.value;

    if (tipoSelected === "longitudinal") {
      perfilesLongitudinalesSection.style.display = "block";
      perfilesTransversalesSection.style.display = "none";
      // Limpiar campos transversales
      document.getElementById("selectCodigoPerfilTransversal").value = "";
      document.getElementById("anchoPerfilTransversal").value = "";
      document.getElementById("nPerfilesTransversal").value = "";
      document.getElementById("pasoTransversal").value = "";
    } else if (tipoSelected === "transversal") {
      perfilesLongitudinalesSection.style.display = "none";
      perfilesTransversalesSection.style.display = "block";
      // Limpiar campos longitudinales
      document.getElementById("selectCodigoPerfilLongitudinal").value = "";
      document.getElementById("nPerfilesLongitudinal").value = "";
      document.getElementById("margenLongitudinal").value = "";
    } else {
      perfilesLongitudinalesSection.style.display = "none";
      perfilesTransversalesSection.style.display = "none";
    }
  });

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
      option.textContent = `${perfilL.codigo} - ${perfilL.tipo}`;
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
      option.textContent = `${perfilT.codigo} - ${perfilT.tipo}`;
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
        `http://127.0.0.1:8000/configuracion/empalmes/${tipo}`
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
  document.getElementById("limpiar").addEventListener("click", () => {
    window.location.reload();
  });

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


  const codigoPerfilLongitudinal = document.getElementById("selectCodigoPerfilLongitudinal").value;

  const numeroPerfilesLongitudinales = document.getElementById("nPerfilesLongitudinal").value;

  const distanciaMargen = document.getElementById("margenLongitudinal").value;


  const codigoPerfilTransversal = document.getElementById("selectCodigoPerfilTransversal").value;

  const numeroPerfilesTransversales = document.getElementById("nPerfilesTransversal").value;

  const anchoPerfilTransversal = document.getElementById("anchoPerfilTransversal").value;

  const distanciaPaso = document.getElementById("pasoTransversal").value;


  const nBandas = document.getElementById("nBandas").value;

  // Debug: mostrar qué valores se están enviando
  console.log("=== DEBUG INFO ===");
  console.log("Input anchoPerfilTransversal:", document.getElementById("anchoPerfilTransversal").value);
  console.log("===================");

  if (anchoPerfilTransversal > ancho) {
    alert("El ancho del perfil no puede superar el ancho de la banda");
  }

  // Helper function to convert empty strings to null
  const toNullIfEmpty = (val) => val === "" || val === null ? null : val;
  const toFloatOrNull = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

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
          codigo_perfil: toNullIfEmpty(codigoPerfilLongitudinal) || toNullIfEmpty(codigoPerfilTransversal),
          n_perfiles: toFloatOrNull(numeroPerfilesLongitudinales) || toFloatOrNull(numeroPerfilesTransversales),
          distancia_margen: toFloatOrNull(distanciaMargen),
          ancho_perfil: toFloatOrNull(anchoPerfilTransversal),
          distancia_paso: toFloatOrNull(distanciaPaso)
        }),
      }
    );

    const data = await response.json();

    console.log("Response data:", data);
    // console.log("data.ancho_perfil:", data.ancho_perfil);

    if (response.ok) {
        let distancia = data.distancia_paso

        if (distancia === null) {
            distancia = data.distancia_margen
        }
      document.getElementById("resultado").innerText =
        `Precio banda: ${data.precio_banda} €
        Precio empalme: ${data.precio_empalme} €
        Precio perfil: ${data.precio_perfil} €
        Precio soldadura: ${data.precio_soldadura} €
        Precio perfil total: ${data.precio_perfil_final} €
        Numero de perfiles: ${data.n_perfiles}
        Distancia margen: ${data.distancia_margen}
        Distancia paso: ${data.distancia_paso}
        Ancho perfil: ${data.ancho_perfil}
        Precio total: ${nBandas * data.precio_total} €`;
    } else {
      console.error("Response error:", data);
      document.getElementById("resultado").innerText =
        "Error: " + JSON.stringify(data);
    }

  } catch (err) {
    console.error("Error cálculo:", JSON.stringify(err, null, 2));
    alert("Error: " + err.message);
  }
}