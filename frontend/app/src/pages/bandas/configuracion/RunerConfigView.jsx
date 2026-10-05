import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getRuners } from '../../../services/api'
import AutocompleteSelect from '../../../components/common/AutocompleteSelect'

const COLORES = [
  { value: 'NEGRO', label: 'Negro' },
  { value: 'BLANCO', label: 'Blanco' },
  { value: 'AZUL', label: 'Azul' },
  { value: 'VERDE', label: 'Verde'}
]

function RunerConfigView() {

  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'runer')

  const [anchoEditado, setAnchoEditado] = useState(state.banda?.ancho ?? '')
  const [largoEditado, setLargoEditado] = useState(state.banda?.longitud ?? '')

  const [runers, setRuners]             = useState([])
  const [codigoRuner, setCodigoRuner]   = useState('')
  const [cantidad, setCantidad]         = useState(2)
  const [luz, setLuz]                   = useState('')
  const [margen, setMargen]             = useState('')
  const [comentarios, setComentarios]   = useState('')

  const [color, setColor]               = useState('')
  const [tipo, setTipoRuner]             = useState('')

  // ancho del runer

  const anchoRuner = runers.find(r => r.codigo === codigoRuner)?.ancho ?? null

  const anchoBanda = Number(anchoEditado) || null

  const largoBanda = Number(largoEditado)
  const anchoPerfil = Number(anchoRuner)
  const medidasValidas = Number.isFinite(anchoPerfil) && anchoPerfil > 0 &&
    Number.isFinite(largoBanda) && largoBanda > 0
  const proporcion = medidasValidas ? largoBanda / anchoPerfil : null

  const largoEsMultiploDelAncho = medidasValidas && Math.round(proporcion) >= 1 &&
    Math.abs(proporcion - Math.round(proporcion)) <=
      Number.EPSILON * Math.max(1, Math.abs(proporcion)) * 4

  // -----  Función en desuso por el AutocompleteSelect -----
  function handleCodigoRunerChange(e) {
    const nuevoCodigo = e.target.value
    const runerSeleccionado = runers.find(runer => runer.codigo === nuevoCodigo)

    setCodigoRuner(nuevoCodigo)
    setColor(runerSeleccionado?.color ?? '')
    setTipoRuner(runerSeleccionado?.tipo ?? '')
    setLuz('')
    setMargen('')
  }
  // ------------

  useEffect(() => {
    getRuners()
      .then(data => setRuners(data))
      .catch(err => console.error('Error cargando runers:', err))
  }, [])

  function handleMargenChange(valor) {
    setMargen(valor)
    if (valor === '' || !Number.isFinite(Number(valor)) ||
        !anchoBanda || !anchoPerfil || cantidad <= 1) {
      setLuz('')
      return
    }

    setLuz((anchoBanda - 2 * Number(valor) - cantidad * anchoPerfil) / (cantidad - 1))
  }

  function handleLuzChange(valor) {
    setLuz(valor)
    if (valor === '' || !Number.isFinite(Number(valor)) ||
        !anchoBanda || !anchoPerfil || cantidad <= 1) {
      setMargen('')
      return
    }

    setMargen((anchoBanda - (cantidad - 1) * Number(valor) - cantidad * anchoPerfil) / 2)
  }

  const estadoActualizado = {
    ...state,
    banda: {
      ...state.banda,
      ancho: anchoEditado,
      longitud: largoEditado,
    },
  }

  function handleSiguiente() {
    if (!Number.isFinite(anchoBanda) || anchoBanda <= 0 ||
        !Number.isFinite(largoBanda) || largoBanda <= 0) {
      return alert('Introduce un ancho y un largo de banda mayores que cero')
    }


    if (!codigoRuner) {
        return alert('Asegúrese de haber elegido un código de runer')
    }
    const ruta = siguienteRuta(state.seleccion, 'runer')
    navigate(ruta, {
      state: {
        ...estadoActualizado,
        runer: {
          codigoRuner,
          cantidad,
          luz,
          margen,
          anchoRuner,
          comentarios,
          color,
          tipo,
        }
      }
    })
  }

  function handleAtras() {
    navigate('/banda/configurar/perfil-transversal', { state: estadoActualizado })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Runer</p>

          <div className="config-form">

            <div className="form-row">
              <span className="form-label">- Valores introducidos previamente -</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="runer-ancho-banda">Ancho de la banda (mm)</label>
                <input
                  id="runer-ancho-banda"
                  type="number"
                  className="form-input"
                  min="0"
                  step="any"
                  value={anchoEditado}
                  onChange={e => {
                    setAnchoEditado(e.target.value)
                    setMargen('')
                    setLuz('')
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="runer-largo-banda">Largo de la banda (mm)</label>
                <input
                  id="runer-largo-banda"
                  type="number"
                  className="form-input"
                  min="0"
                  step="any"
                  value={largoEditado}
                  onChange={e => setLargoEditado(e.target.value)}
                />
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid #4a6f8a' }} />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de Runer</label>

                <AutocompleteSelect
                  opciones={runers}
                  valorSeleccionado={runers.find(r => r.codigo === codigoRuner) ?? null}
                  onSeleccionar={runer => {
                    setCodigoRuner(runer?.codigo ?? '')
                    setTipoRuner(runer?.tipo ?? '')
                    setLuz('')
                    setMargen('')
                    //console.log('Color del runer seleccionado:', runer?.color)
                    //console.log('Tipo del runer seleccionado:', runer?.tipo)
                  }}
                  getLabel={runer => `${runer.codigo}`}
                  getKey={runer => runer.codigo}
                  placeholder="Busqueda por código o tipo de runer"
                />
                {codigoRuner && (
                  <p role="status" style={{ fontSize: 13, color: largoEsMultiploDelAncho ? '#2e7d32' : '#e57373' }}>
                    {!medidasValidas
                      ? 'No se puede verificar el múltiplo: el paso del runer y el largo de la banda deben ser números positivos.'
                      : largoEsMultiploDelAncho
                        ? `El largo de la banda (${largoBanda} mm) es múltiplo del paso del runer (${anchoPerfil} mm).`
                        : `El largo de la banda (${largoBanda} mm) no es múltiplo del paso del runer (${anchoPerfil} mm).`}
                  </p>
                )}
                  
              </div>

              <div className="form-group">
                <label className="form-label">Número de Runers</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => { setCantidad(c => Math.max(1, c - 1)); setLuz(''); setMargen('') }}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => { setCantidad(c => c + 1); setLuz(''); setMargen('') }}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Seleccione el color del runer</label>
                  <select className="form-select" 
                          value={color}
                          onChange={e => setColor(e.target.value)}>
                    <option value="">- Seleccione un color -</option>
                    {COLORES?.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
              </div>
            </div>

            

            {/* solo muestra los campos si hay runer seleccionado y ancho de banda disponible */}

            {codigoRuner && anchoBanda && (
              <>
                {!anchoBanda && (
                  <p style={{ fontSize: 13, color: '#e57373' }}>
                    No se encontró el ancho de banda del paso anterior
                  </p>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Margen lateral (mm)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={margen}
                      onChange={e => handleMargenChange(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Luz (mm)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={luz}
                      onChange={e => handleLuzChange(e.target.value)}
                    />
                  </div>
                </div>

                {luz && parseFloat(luz) < 0 && (
                  <p style={{ fontSize: 13, color: '#e57373' }}>
                    La combinación de margen y runers supera el ancho de la banda
                  </p>
                )}

                {margen && parseFloat(margen) < 0 && (
                  <p style={{ fontSize: 13, color: '#e57373' }}>
                    La combinación de luz y runers supera el ancho de la banda
                  </p>
                )}

              </>
            )}

            {codigoRuner && !anchoBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                Introduce el ancho de la banda en el campo superior
              </p>
            )}

            {codigoRuner && !anchoRuner && (
              // errores = true
              <p style={{ fontSize: 13, color: '#e57373' }}>
                No se encontró el ancho del runer
              </p>
            )}

            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea
                className="form-textarea"
                placeholder="Comentarios"
                rows={3}
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
              />
            </div>

          </div>

          <div className="config-footer">
            <button className="btn-atras" onClick={handleAtras}>‹ Atrás</button>
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente ›</button>
          </div>
        </div>

        <div className="config-side-panel">
          <div className="config-side-row">

            <div className="config-side-img-wrapper">
              <img
                src={cantidad >= 3 ? '/images/sketch-runer-2.svg' : '/images/sketch-runer-1.svg'}
                alt="Esquema de runers"
                className="config-side-img"
              />
              <span className="config-banda-label config-runer-margen">
                {margen === '' ? '—' : margen} mm
              </span>
              <span className="config-banda-label config-runer-luz">
                {luz === '' ? '—' : luz} mm
              </span>
            </div>

            <div className="config-side-img-wrapper">
              <img
                src="/images/sketch-runer-3.svg"
                alt="Esquema aclarativo de runer"
                className="config-side-img"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default RunerConfigView
