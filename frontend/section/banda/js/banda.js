document.addEventListener("DOMContentLoaded", async () => {

  const selectBanda = document.getElementById("codigo");

  const selectTipoEmpalme = document.getElementById("tipoEmpalme");
  const selectCodigoEmpalme = document.getElementById("codigoEmpalme");

  const selectCodigoPerfilLongitudinalSuperior = document.getElementById("selectCodigoPerfilLongitudinalSuperior");
  const selectCodigoPerfilLongitudinalInferior = document.getElementById("selectCodigoPerfilLongitudinalInferior");
  const selectCodigoPerfilTransversal = document.getElementById("selectCodigoPerfilTransversal");
  const tipoPerfilSelect = document.getElementById("tipoPerfilSelect");
  const perfilesLongitudinalesSection = document.getElementById("perfilesLongitudinalesSection");
  const perfilesLongitudinalesSuperiores = document.getElementById("perfilesLongitudinalesSuperiores");
  const perfilesLongitudinalesInferiores = document.getElementById("perfilesLongitudinalesInferiores");
  const activarPerfilLongitudinalSuperior = document.getElementById("activarPerfilLongitudinalSuperior");
  const activarPerfilLongitudinalInferior = document.getElementById("activarPerfilLongitudinalInferior");
  const perfilesTransversalesSection = document.getElementById("perfilesTransversalesSection");

  const selectRuner = document.getElementById("codigoRuner");

  // -------------------------
  // CAMBIO TIPO DE PERFIL
  // -------------------------

  tipoPerfilSelect.addEventListener("change", () => {
    const tipoSelected = tipoPerfilSelect.value;

    if (tipoSelected === "longitudinal") {
      perfilesLongitudinalesSection.style.display = "block";
      perfilesTransversalesSection.style.display = "none";
      perfilesLongitudinalesSuperiores.style.display = activarPerfilLongitudinalSuperior.checked ? "block" : "none";
      perfilesLongitudinalesInferiores.style.display = activarPerfilLongitudinalInferior.checked ? "block" : "none";
      // Limpiar campos transversales
      document.getElementById("selectCodigoPerfilTransversal").value = "";
      document.getElementById("anchoPerfilTransversal").value = "";
      document.getElementById("nPerfilesTransversal").value = "";
      document.getElementById("pasoTransversal").value = "";
    } else if (tipoSelected === "transversal") {
      perfilesLongitudinalesSection.style.display = "none";
      perfilesTransversalesSection.style.display = "block";
      // Limpiar campos longitudinales
      activarPerfilLongitudinalSuperior.checked = false;
      activarPerfilLongitudinalInferior.checked = false;
      perfilesLongitudinalesSuperiores.style.display = "none";
      perfilesLongitudinalesInferiores.style.display = "none";
      document.getElementById("selectCodigoPerfilLongitudinalSuperior").value = "";
      document.getElementById("nPerfilesLongitudinalSuperior").value = "";
      document.getElementById("margenLongitudinalSuperior").value = "";
      document.getElementById("selectCodigoPerfilLongitudinalInferior").value = "";
      document.getElementById("nPerfilesLongitudinalInferior").value = "";
      document.getElementById("margenLongitudinalInferior").value = "";
    } else {
      perfilesLongitudinalesSection.style.display = "none";
      perfilesTransversalesSection.style.display = "none";
      perfilesLongitudinalesSuperiores.style.display = "none";
      perfilesLongitudinalesInferiores.style.display = "none";
    }
  });

  activarPerfilLongitudinalSuperior.addEventListener("change", () => {
    perfilesLongitudinalesSuperiores.style.display = activarPerfilLongitudinalSuperior.checked ? "block" : "none";
    if (!activarPerfilLongitudinalSuperior.checked) {
      document.getElementById("selectCodigoPerfilLongitudinalSuperior").value = "";
      document.getElementById("nPerfilesLongitudinalSuperior").value = "";
      document.getElementById("margenLongitudinalSuperior").value = "";
    }
  });

  activarPerfilLongitudinalInferior.addEventListener("change", () => {
    perfilesLongitudinalesInferiores.style.display = activarPerfilLongitudinalInferior.checked ? "block" : "none";
    if (!activarPerfilLongitudinalInferior.checked) {
      document.getElementById("selectCodigoPerfilLongitudinalInferior").value = "";
      document.getElementById("nPerfilesLongitudinalInferior").value = "";
      document.getElementById("margenLongitudinalInferior").value = "";
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
      const optionSuperior = document.createElement("option");
      optionSuperior.value = perfilL.codigo;
      optionSuperior.textContent = `${perfilL.codigo} - ${perfilL.tipo}`;
      selectCodigoPerfilLongitudinalSuperior.appendChild(optionSuperior);

      const optionInferior = document.createElement("option");
      optionInferior.value = perfilL.codigo;
      optionInferior.textContent = `${perfilL.codigo} - ${perfilL.tipo}`;
      selectCodigoPerfilLongitudinalInferior.appendChild(optionInferior);
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
    console.error("Error cargando perfiles transversales:", err);
  }

  // -------------------------
  // CARGAR RUNERS
  // -------------------------

  try {
    const response = await fetch("http://127.0.0.1:8000/configuracion/runers");
    const runers = await response.json();
    console.log(runers);

    runers.forEach(runer => {
      const option = document.createElement("option");
      option.value = runer.codigo;
      option.textContent = `${runer.codigo} - ${runer.tipo}`;
      selectRuner.appendChild(option);
    });

    // Habilitar el select si hay runers disponibles
    if (runers.length > 0) {
      selectRuner.disabled = false;
    }

  } catch (err) {
    console.error("Error cargando runers:", err);
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
  const tipoPerfilSeleccionado = document.getElementById("tipoPerfilSelect").value;
  const perfilLongitudinalSuperiorActivo = document.getElementById("activarPerfilLongitudinalSuperior").checked;
  const perfilLongitudinalInferiorActivo = document.getElementById("activarPerfilLongitudinalInferior").checked;


  const tipoEmpalme = document.getElementById("tipoEmpalme").value;
  const codigoEmpalme = document.getElementById("codigoEmpalme").value;


  const codigoPerfilLongitudinalSuperior = document.getElementById("selectCodigoPerfilLongitudinalSuperior").value;
  const numeroPerfilesLongitudinalesSuperior = document.getElementById("nPerfilesLongitudinalSuperior").value;
  const distanciaMargenSuperior = document.getElementById("margenLongitudinalSuperior").value;
  const codigoPerfilLongitudinalInferior = document.getElementById("selectCodigoPerfilLongitudinalInferior").value;
  const numeroPerfilesLongitudinalesInferior = document.getElementById("nPerfilesLongitudinalInferior").value;
  const distanciaMargenInferior = document.getElementById("margenLongitudinalInferior").value;


  const codigoPerfilTransversal = document.getElementById("selectCodigoPerfilTransversal").value;

  const numeroPerfilesTransversales = document.getElementById("nPerfilesTransversal").value;

  const anchoPerfilTransversal = document.getElementById("anchoPerfilTransversal").value;

  const distanciaPaso = document.getElementById("pasoTransversal").value;


  const codigoRuner = document.getElementById("codigoRuner").value;
  const numeroPerfilesRuner = document.getElementById("nPerfilesRuner").value;
  const agujerosPorFila = document.getElementById("agujerosPorFila").value;
  const filasDeAgujeros = document.getElementById("filasDeAgujeros").value;
  const diametroPerforacion = document.getElementById("diametroPerforacion").value;


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

  if (tipoPerfilSeleccionado === "longitudinal" && !perfilLongitudinalSuperiorActivo && !perfilLongitudinalInferiorActivo) {
    alert("Debes seleccionar al menos un perfil longitudinal: superior o inferior.");
    return;
  }

  if (perfilLongitudinalSuperiorActivo && (!codigoPerfilLongitudinalSuperior || !numeroPerfilesLongitudinalesSuperior || !distanciaMargenSuperior)) {
    alert("Debes completar código, número de perfiles y distancia de margen para el perfil longitudinal superior.");
    return;
  }

  if (perfilLongitudinalInferiorActivo && (!codigoPerfilLongitudinalInferior || !numeroPerfilesLongitudinalesInferior || !distanciaMargenInferior)) {
    alert("Debes completar código, número de perfiles y distancia de margen para el perfil longitudinal inferior.");
    return;
  }

  if (codigoRuner && toFloatOrNull(numeroPerfilesRuner) === null) {
    alert("Debes indicar el número de perfiles del runer.");
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
          codigo_perfil: toNullIfEmpty(codigoPerfilTransversal),
          n_perfiles: toFloatOrNull(numeroPerfilesTransversales),
          distancia_margen: null,
          distancia_paso: toFloatOrNull(distanciaPaso),
          ancho_perfil: toFloatOrNull(anchoPerfilTransversal),
          codigo_perfil_superior: perfilLongitudinalSuperiorActivo ? toNullIfEmpty(codigoPerfilLongitudinalSuperior) : null,
          n_perfiles_superior: perfilLongitudinalSuperiorActivo ? toFloatOrNull(numeroPerfilesLongitudinalesSuperior) : null,
          distancia_margen_superior: perfilLongitudinalSuperiorActivo ? toFloatOrNull(distanciaMargenSuperior) : null,
          codigo_perfil_inferior: perfilLongitudinalInferiorActivo ? toNullIfEmpty(codigoPerfilLongitudinalInferior) : null,
          n_perfiles_inferior: perfilLongitudinalInferiorActivo ? toFloatOrNull(numeroPerfilesLongitudinalesInferior) : null,
          distancia_margen_inferior: perfilLongitudinalInferiorActivo ? toFloatOrNull(distanciaMargenInferior) : null,
          codigo_runer: toNullIfEmpty(codigoRuner),
          n_perfiles_runer: toFloatOrNull(numeroPerfilesRuner),
          agujeros_x_fila: toFloatOrNull(agujerosPorFila),
          filas_x_agujero: toFloatOrNull(filasDeAgujeros),
          diametro_perforacion: toFloatOrNull(diametroPerforacion)

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
        `Cantidad bandas: ${nBandas}
        Ancho banda: ${data.ancho}
        Largo banda: ${data.largo}
        Precio banda: ${data.precio_banda} €
        Precio empalme: ${data.precio_empalme} €
        Precio perfil: ${data.precio_perfil} €
        Precio soldadura del perfil: ${data.precio_soldadura} €
        Precio perfil total: ${data.precio_perfil_final} €
        Precio runer: ${data.precio_runer} €
        Precio soldadura del runer: ${data.precio_runer_soldadura} €
        Precio runer total: ${data.precio_runer_final} €
        Precio perforaciones: ${data.precio_perforaciones} €
        Numero de perfiles: ${data.n_perfiles}
        Numero de perfiles superior: ${data.n_perfiles_superior}
        Numero de perfiles inferior: ${data.n_perfiles_inferior}
        Numero de perfiles runer: ${data.n_perfiles_runer}
        Distancia margen: ${data.distancia_margen}
        Distancia margen superior: ${data.distancia_margen_superior}
        Distancia margen inferior: ${data.distancia_margen_inferior}
        Distancia paso: ${data.distancia_paso}
        Paso filas: ${data.paso_filas}
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
