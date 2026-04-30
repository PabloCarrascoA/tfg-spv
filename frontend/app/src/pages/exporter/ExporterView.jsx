import { useState } from 'react'
import { getInfoTabla, exportarTabla } from '../../services/api'

const SECCIONES = [
  { value: 'bandas',                  label: 'Banda Material'    },
  { value: 'perfiles_longitudinales', label: 'PerfilL Material'  },
  { value: 'perfiles_transversales',  label: 'PerfilT Material'  },
  { value: 'runners',                 label: 'Runer Material'    },
  { value: 'ondas',                   label: 'Onda Material'     },
]

function ExporterView() {
  const [seccion,       setSeccion]       = useState('')
  const [infoTabla,     setInfoTabla]     = useState(null)
  const [paso,          setPaso]          = useState(1)   // 1: selección, 2: previa, 3: descargado
  const [cargando,      setCargando]      = useState(false)
  const [archivoNombre, setArchivoNombre] = useState('')

  async function handleSeccionChange(valor) {
    setSeccion(valor)
    setInfoTabla(null)
    if (!valor) return
    const info = await getInfoTabla(valor)
    setInfoTabla(info)
  }

  function handleSiguiente() {
    if (!seccion) return
    setPaso(2)
  }

  function handleCancelar() {
    setSeccion('')
    setInfoTabla(null)
    setPaso(1)
  }

  async function handleExportar() {
    setCargando(true)
    const nombre = await exportarTabla(seccion)
    setArchivoNombre(nombre)
    setPaso(3)
    setCargando(false)
  }

  const seccionLabel = SECCIONES.find(s => s.value === seccion)?.label ?? ''
  const fecha = new Date().toISOString().split('T')[0]

  return (
    <div className="exporter-view">
      <h2 className="content-title">Panel de exportación</h2>
      <p className="content-subtitle">Exportar Datos</p>

      {/* paso 1 — selección */}
      <div className="exporter-paso">
        <p className="exporter-paso-titulo">1. Seleccione la sección a exportar</p>
        <select
          className="form-select exporter-select"
          value={seccion}
          onChange={e => handleSeccionChange(e.target.value)}
        >
          <option value="">- Seleccionar -</option>
          {SECCIONES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* tabla de columnas */}
        {infoTabla && (
          <>
            <p className="exporter-columnas-label">
              Columnas a exportar de la sección <span className="exporter-seccion-nombre">{seccionLabel}</span>
            </p>
            <table className="exporter-tabla">
              <tbody>
                {infoTabla.columnas.map(col => (
                  <tr key={col.nombre}>
                    <td className="exporter-col-nombre">{col.nombre}</td>
                    <td className="exporter-col-tipo">{col.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {paso === 1 && seccion && (
          <div className="exporter-botones">
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente</button>
            <button className="btn-atras" onClick={handleCancelar}>Cancelar</button>
          </div>
        )}
      </div>

      {/* paso 2 — previa descarga */}
      {paso >= 2 && (
        <div className="exporter-paso">
          <p className="exporter-paso-titulo">2. Descarga de archivos</p>
          <p className="exporter-desc">Se van a generar los siguientes archivos:</p>
          <ul className="exporter-archivos-preview">
            <li>
              <span className="exporter-archivo-nombre">
                tabla_{seccion}_{fecha}.xlsx
              </span>
              <span className="exporter-archivo-info">— {infoTabla?.total ?? '...'} registros</span>
            </li>
          </ul>
          <button
            className="btn-continuar"
            onClick={handleExportar}
            disabled={cargando}
          >
            {cargando ? 'Exportando...' : 'Exportar datos'}
          </button>
        </div>
      )}

      {/* paso 3 — descargado */}
      {paso === 3 && (
        <div className="exporter-paso">
          <p className="exporter-paso-titulo">Archivos generados</p>
          <div className="exporter-archivos-generados">
            <div className="exporter-archivo-fila">
              <span className="exporter-archivo-icono">📄</span>
              <span className="exporter-archivo-nombre">{archivoNombre}</span>
              <span className="exporter-descargado">descargado</span>
            </div>
          </div>
          <button
            className="btn-atras"
            style={{ marginTop: 16 }}
            onClick={handleCancelar}
          >
            Nueva exportación
          </button>
        </div>
      )}
    </div>
  )
}

export default ExporterView