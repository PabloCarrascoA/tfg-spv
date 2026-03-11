let tablaSeleccionada = null
let camposDB = []
let archivoImportado = null
let mapeoActual = {}

// =====================
// PERSISTENCIA DE ESTADO
// =====================

function guardarEstado() {
    localStorage.setItem('tablaSeleccionada', JSON.stringify(tablaSeleccionada));
    // No guardar camposDB, se obtiene del servidor
    localStorage.setItem('archivoImportado', JSON.stringify(archivoImportado));
}

async function cargarEstado() {
    const table = localStorage.getItem('tablaSeleccionada');
    if (table) {
        tablaSeleccionada = JSON.parse(table);
        document.getElementById("tabla").value = tablaSeleccionada;
        // Obtener camposDB del servidor
        try {
            const res = await fetch("http://127.0.0.1:8000/importer/campos/" + tablaSeleccionada);
            if (res.ok) {
                camposDB = await res.json();
                mostrarCamposTabla();
            }
        } catch (err) {
           console.error("Error cargando campos en estado:", err);
        }
    }
    const a = localStorage.getItem('archivoImportado');
    if (a) {
        archivoImportado = JSON.parse(a);
        mostrarPreviewArchivo();
        construirMapeo();
    }
}

// Cargar estado al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarEstado();
});

// =====================
// PASO 1
// =====================

document.getElementById("tabla").addEventListener("change", async function () {

    tablaSeleccionada = this.value

    if (!tablaSeleccionada) return

    try {

        const res = await fetch("http://127.0.0.1:8000/importer/campos/" + tablaSeleccionada)
        if (!res.ok) {

            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        camposDB = await res.json()
        console.log("Campos obtenidos:", camposDB)
        mostrarCamposTabla()

    } catch (err) {
        console.error("Error cargando campos:", err)
        alert("Error cargando campos: " + err.message)
    }

})

function mostrarCamposTabla() {

    const div = document.getElementById("tabla_campos")

    let html = "<h4>Columnas esperadas</h4>"
    html += "<table style='border-collapse: collapse; width: 100%; max-width: 1000px; margin-bottom: 25px;'>"

    camposDB.forEach(c => {

        html += `
        <tr style="background-color:#e4e4e4;">
        <td style="border:1px solid #2C2C2C; padding:8px;">${c.nombre}</td>
        <td style="border:1px solid #2C2C2C; padding:8px;">${c.tipo}</td>
        </tr>
        `
    })

    html += "</table>"

    div.innerHTML = html

}

// =====================
// PASO 2
// =====================

async function subirArchivo() {

    const file = document.getElementById("archivo").files[0]

    if (!file) {
        alert("Selecciona un archivo primero")
        return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
        const res = await fetch("http://127.0.0.1:8000/importer/upload", {
            method: "POST",
            body: formData
        })

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        archivoImportado = await res.json()
        console.log("Archivo subido:", archivoImportado)
        mostrarPreviewArchivo()
        construirMapeo()
        guardarEstado()
    } catch (err) {
        console.error("Error subiendo archivo:", err)
        alert("Error subiendo archivo: " + err.message)
    }

}

function mostrarPreviewArchivo() {

    const div = document.getElementById("preview_archivo")

    let html = "<h4>Encabezados detectados</h4>"

    html += "<table border='1'><tr>"

    archivoImportado.encabezados.forEach(header => {

        html += `<th>${header}</th>`

    })

    html += "</tr><tr>"

    archivoImportado.filas[0].forEach(value => {

        if (value === null || value === undefined) {
            value = ""
        }

        html += `<td>${value}</td>`
        
        

    })

    html += "</tr></table>"

    div.innerHTML = html

}

// =====================
// PASO 3
// =====================

function construirMapeo() {

    const div = document.getElementById("mapeo_container")

    let html = ""

    archivoImportado.encabezados.forEach(col => {

        html += `<div style="margin-bottom:10px">`

        html += `<strong>${col}</strong> → `

        html += `<select class="mapeo" data-col="${col}">`

        html += `<option value="">-- No asignado --</option>`

        camposDB.forEach(c => {

            html += `<option value="${c.nombre}">${c.nombre}</option>`

        })

        html += `</select>`

        html += `</div>`

    })

    div.innerHTML = html

}

// =====================
// PREVIEW
// =====================

function obtenerMapeo() {

    const selects = document.querySelectorAll(".mapeo")

    let mapeo = {}

    selects.forEach(s => {

        const col = s.dataset.col

        mapeo[col] = s.value

    })

    return mapeo
}

function cancelarImport() {
    // clear stored state
    localStorage.clear()
    // reset runtime variables
    tablaSeleccionada = null
    camposDB = []
    archivoImportado = null
    mapeoActual = {}
    // clear visible UI
    document.getElementById("tabla").value = ""
    document.getElementById("tabla_campos").innerHTML = ""
    // reset file input completely
    const fileInput = document.getElementById("archivo")
    fileInput.value = ""
    fileInput.type = "text"
    fileInput.type = "file"
    document.getElementById("preview_archivo").innerHTML = ""
    document.getElementById("mapeo_container").innerHTML = ""
    document.getElementById("preview_import").innerHTML = ""
    document.getElementById("resultado_import").innerHTML = ""
}


function previewMapeo() {

    const mapeo = obtenerMapeo()

    const filas = archivoImportado.filas.slice(0,10)

    let html = "<h4>Preview importación</h4>"
    html += "<table border='1'><tr>"

    Object.values(mapeo).forEach(c => {

        if (c) html += `<th>${c}</th>`

    })

    html += "</tr>"

    filas.forEach(f => {

        const filaObj = {}

        archivoImportado.encabezados.forEach((h,i) => {

            filaObj[h] = f[i]

        })

        html += "<tr>"

        for (let col in mapeo) {

            if (mapeo[col]) {

                html += `<td>${filaObj[col] ?? ""}</td>`

            }

        }

        html += "</tr>"

    })

    html += "</table>"

    document.getElementById("preview_import").innerHTML = html

}

// =====================
// IMPORT
// =====================

async function importar() {

    if (!tablaSeleccionada || !archivoImportado || !mapeoActual) {
        alert("Completa todos los pasos primero")
        return
    }

    const mapeo = obtenerMapeo()

    try {
        const res = await fetch("http://127.0.0.1:8000/importer/procesar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tabla: tablaSeleccionada,
                archivo: archivoImportado,
                mapeo: mapeo
            })
        })

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const resultado = await res.json()
        console.log("Resultado importación:", resultado)
        mostrarResultado(resultado)
        // Limpiar estado después de importar
        localStorage.clear()
    } catch (err) {
        console.error("Error importando:", err)
        alert("Error importando: " + err.message)
    }

}

function mostrarResultado(r) {

    const div = document.getElementById("resultado_import")

    if (r.insertados) {

        div.innerHTML = `<h3 style="color:green">Importación correcta</h3>`

        return
    }

    if (r.valores_invalidos.length) {

        div.innerHTML = `<h3 style="color:red">Errores detectados</h3>`

    }

}