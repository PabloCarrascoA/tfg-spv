import { useState } from 'react'
import {
  getColumnasTabla, parsearArchivo,
  previsualizarImportacion, ejecutarImportacion
} from '../../services/api'

const SECCIONES = [
  { group: 'Material',  value: 'bandas',                  label: 'Banda — Material'           },
  { group: 'Material',  value: 'empalmes',                label: 'Empalmes — Material'         },
  { group: 'Material',  value: 'perfiles_longitudinales', label: 'PerfilL — Material'          },
  { group: 'Material',  value: 'perfiles_transversales',  label: 'PerfilT — Material'          },
  { group: 'Material',  value: 'runners',                 label: 'Runer — Material'            },
  { group: 'Material',  value: 'ondas',                   label: 'Onda — Material'             },
  { group: 'Gestión',   value: 'clientes',                label: 'Clientes'                    },
  { group: 'Gestión',   value: 'descuentos',              label: 'Descuentos — Material'       },
  { group: 'Gestión',   value: 'descuentos_soldadura',    label: 'Descuentos — Soldadura'      },
]

const SEPARADORES = [
  { value: ',',  label: 'Coma (,)'          },
  { value: ';',  label: 'Punto y coma (;)'  },
  { value: '|',  label: 'Barra vertical (|)'},
  { value: '\t', label: 'Tabulador'         },
]

function ImporterView() {
  const [paso, setPaso]               = useState(1)

  // paso 1
  const [tabla, setTabla]             = useState('')
  const [columnas, setColumnas]       = useState([])

  // paso 2
  const [archivo, setArchivo]         = useState(null)
  const [separador, setSeparador]     = useState(',')
  const [encabezados, setEncabezados] = useState([])
  const [primeraLinea, setPrimeraLinea] = useState([])
  const [todasFilas, setTodasFilas]   = useState([])
  const [archivoNombre, setArchivoNombre] = useState('')
  const [cargandoArchivo, setCargandoArchivo] = useState(false)

  // paso 3
  const [mapeo, setMapeo]             = useState({})
  const [preview, setPreview]         = useState([])
  const [duplicados, setDuplicados]   = useState([])
  const [mostrandoPreview, setMostrandoPreview] = useState(false)
  const [modoDuplicados, setModoDuplicados] = useState(null) // 'solo_nuevos' | 'actualizar' | null

  // resultado
  const [resultado, setResultado]     = useState(null)
  const [cargando, setCargando]       = useState(false)

  // ── paso 1 ──────────────────────────────────────────
  async function handleTablaChange(valor) {
    setTabla(valor)
    setColumnas([])
    setPaso(1)
    if (!valor) return
    const cols = await getColumnasTabla(valor)
    setColumnas(cols)
  }

  function handleSiguiente1() {
    if (!tabla || columnas.length === 0) return
    setPaso(2)
  }

  // ── paso 2 ──────────────────────────────────────────
  async function handleCargarArchivo() {
    if (!archivo) return
    setCargandoArchivo(true)
    const data = await parsearArchivo(archivo, separador)
    setEncabezados(data.encabezados)
    setPrimeraLinea(data.primera_linea)
    setTodasFilas(data.filas)
    setArchivoNombre(archivo.name)
    // mapeo inicial vacío
    const mapeoInicial = {}
    data.encabezados.forEach(h => { mapeoInicial[h] = '' })
    setMapeo(mapeoInicial)
    setCargandoArchivo(false)
  }

  function handleSiguiente2() {
    if (encabezados.length === 0) return
    setPaso(3)
    setMostrandoPreview(false)
    setPreview([])
    setDuplicados([])
    setModoDuplicados(null)
  }

  // ── paso 3 ──────────────────────────────────────────
  function handleMapeoChange(campoArchivo, campoDB) {
    setMapeo(prev => ({ ...prev, [campoArchivo]: campoDB }))
    setMostrandoPreview(false)
    setDuplicados([])
    setModoDuplicados(null)
  }

  async function handlePrevisualizar() {
    const data = await previsualizarImportacion(tabla, encabezados, todasFilas, mapeo)
    setPreview(data.preview)
    setDuplicados(data.duplicados)
    setMostrandoPreview(true)
    setModoDuplicados(null)
  }

  async function handleImportar(modo) {
    setCargando(true)
    const data = await ejecutarImportacion(tabla, encabezados, todasFilas, mapeo, modo)
    setResultado(data)
    setPaso(4)
    setCargando(false)
  }

  function handleCancelar() {
    setTabla(''); setColumnas([]); setArchivo(null)
    setEncabezados([]); setPrimeraLinea([]); setTodasFilas([])
    setArchivoNombre(''); setMapeo({}); setPreview([])
    setDuplicados([]); setMostrandoPreview(false)
    setModoDuplicados(null); setResultado(null)
    setPaso(1)
  }

  const seccionLabel = SECCIONES.find(s => s.value === tabla)?.label ?? ''
  const columnasDest = columnas.map(c => c.nombre)

  return (
    <div className="importer-view">
      <h2 className="content-title">Panel de Importación</h2>
      <p className="content-subtitle">Importar Datos</p>

      {/* ── PASO 1 ── */}
      <div className="importer-paso">
        <p className="importer-paso-titulo">1. Indique la sección donde desea importar</p>

        <select className="form-select importer-select"
          value={tabla} onChange={e => handleTablaChange(e.target.value)}>
          <option value="">- Seleccionar -</option>
          <optgroup label="── Material ──">
            {SECCIONES.filter(s => s.group === 'Material').map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </optgroup>
          <optgroup label="── Gestión ──">
            {SECCIONES.filter(s => s.group === 'Gestión').map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </optgroup>
        </select>

        {columnas.length > 0 && (
          <>
            <p className="importer-columnas-label">
              Columnas esperadas para la sección{' '}
              <span className="importer-seccion-nombre">{seccionLabel}</span>
            </p>
            <table className="exporter-tabla">
              <tbody>
                {columnas.map(col => (
                  <tr key={col.nombre}>
                    <td className="exporter-col-nombre">{col.nombre.toUpperCase()}</td>
                    <td className="exporter-col-tipo">{col.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paso === 1 && (
              <div className="importer-botones">
                <button className="btn-continuar" onClick={handleSiguiente1}>Siguiente</button>
                <button className="btn-atras" onClick={handleCancelar}>Cancelar</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PASO 2 ── */}
      {paso >= 2 && (
        <div className="importer-paso">
          <p className="importer-paso-titulo">2. Cargue el archivo a importar</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            Sube un archivo CSV o Excel con datos de productos y configuraciones
          </p>

          <input type="file" accept=".csv,.xlsx,.xls"
            className="importer-file-input"
            onChange={e => { setArchivo(e.target.files[0]); setEncabezados([]) }}
          />

          <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
            Se empleará la primera fila como encabezado
          </p>

          <div className="form-group" style={{ maxWidth: 240 }}>
            <label className="form-label">Formato — Separador entre campos</label>
            <select className="form-select" value={separador}
              onChange={e => setSeparador(e.target.value)}>
              {SEPARADORES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <button className="btn-continuar" onClick={handleCargarArchivo}
            disabled={!archivo || cargandoArchivo}>
            {cargandoArchivo ? 'Cargando...' : 'Cargar archivo'}
          </button>

          {encabezados.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: '#4a6f8a', fontWeight: 500 }}>
                Archivo cargado: {archivoNombre}
              </p>
              <p className="importer-columnas-label">Encabezados obtenidos:</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="importer-tabla-preview">
                  <thead>
                    <tr>
                      {encabezados.map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {primeraLinea.map((v, i) => <td key={i}>{v}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>

              {paso === 2 && (
                <div className="importer-botones">
                  <button className="btn-continuar" onClick={handleSiguiente2}>Siguiente</button>
                  <button className="btn-atras" onClick={handleCancelar}>Cancelar</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── PASO 3 ── */}
      {paso >= 3 && (
        <div className="importer-paso">
          <p className="importer-paso-titulo">3. Relacione las columnas de origen y destino</p>

          <div className="mapeo-grid">
            <p className="mapeo-header">Campo origen</p>
            <p className="mapeo-header">Campo destino</p>

            {encabezados.map(h => (
              <>
                <div key={`origen-${h}`} className="mapeo-origen">{h}</div>
                <select key={`dest-${h}`} className="form-select mapeo-select"
                  value={mapeo[h] ?? ''}
                  onChange={e => handleMapeoChange(h, e.target.value)}>
                  <option value="">- No asignado -</option>
                  {columnasDest.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </>
            ))}
          </div>

          <div className="importer-botones">
            <button className="btn-continuar" onClick={handlePrevisualizar}>Previsualizar</button>
            <button className="btn-atras" onClick={handleCancelar}>Resetear Relación</button>
          </div>

          {/* aviso duplicados */}
          {mostrandoPreview && duplicados.length > 0 && modoDuplicados === null && (
            <div className="importer-duplicados-aviso">
              <p style={{ fontSize: 13, color: '#e57373', fontWeight: 500 }}>
                Se encontraron <strong>{duplicados.length}</strong> identificadores duplicados.
                ¿Cómo desea proceder?
              </p>
              <div className="importer-botones" style={{ marginTop: 8 }}>
                <button className="btn-continuar"
                  onClick={() => setModoDuplicados('actualizar')}>
                  Insertar nuevos + actualizar existentes
                </button>
                <button className="btn-atras"
                  onClick={() => setModoDuplicados('solo_nuevos')}>
                  Solo insertar nuevos
                </button>
                <button className="pedido-borrar-btn" onClick={handleCancelar}>
                  Cancelar importación
                </button>
              </div>
            </div>
          )}

          {/* preview */}
          {mostrandoPreview && preview.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: '#1a1a1a', marginTop: 16 }}>
                Primeras <span style={{ color: '#4a6f8a', fontWeight: 500 }}>10 filas</span> de la sección a importar
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="importer-tabla-preview">
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((fila, i) => (
                      <tr key={i}>
                        {Object.values(fila).map((v, j) => <td key={j}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* botón importar — aparece si no hay duplicados o si ya eligió modo */}
              {(duplicados.length === 0 || modoDuplicados !== null) && (
                <div className="importer-botones" style={{ marginTop: 16 }}>
                  <button className="btn-continuar"
                    disabled={cargando}
                    onClick={() => handleImportar(modoDuplicados ?? 'solo_nuevos')}>
                    {cargando ? 'Importando...' : 'Importar datos'}
                  </button>
                  <button className="btn-atras" onClick={handleCancelar}>
                    Cancelar Importación
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── RESULTADO ── */}
      {paso === 4 && resultado && (
        <div className="importer-paso">
          <div className="exporter-archivos-generados">
            <p className="importer-paso-titulo" style={{ marginBottom: 12 }}>
              Archivos importados
            </p>
            <div className="exporter-archivo-fila">
              <span className="exporter-archivo-icono">📄</span>
              <span className="exporter-archivo-nombre">{archivoNombre}</span>
              <span className="exporter-descargado">Importado</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#4a6f8a', fontWeight: 500, marginTop: 12 }}>
            Se han importado con éxito{' '}
            <strong>{resultado.insertados}</strong> filas
            {resultado.actualizados > 0 && ` y actualizado ${resultado.actualizados}`}.
          </p>
          <button className="btn-atras" style={{ marginTop: 16 }} onClick={handleCancelar}>
            Nueva importación
          </button>
        </div>
      )}
    </div>
  )
}

export default ImporterView