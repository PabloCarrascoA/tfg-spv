import { useState, useEffect, useRef } from 'react'
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

  console.log("ancho runer: " + anchoRuner)

  const anchoBanda = parseFloat(state.banda?.ancho) || null

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

  const editando = useRef(null)

  // cuando cambia margen -> recalcula luz

  useEffect(() => {

  if (editando.current === 'luz') return 
  if (!anchoBanda || !anchoRuner || !margen) return

  let luzCalculada

   if (cantidad === 2) {
    luzCalculada = anchoBanda - 2 * parseFloat(margen) - cantidad * anchoRuner
  }

  else if (cantidad === 3) {
    luzCalculada = (anchoBanda - 2 * parseFloat(margen) - cantidad * anchoRuner) / 2
  }

  editando.current = 'margen'
  setLuz(luzCalculada)
  setTimeout(() => { editando.current = null }, 0)

  }, [margen, cantidad, anchoRuner, anchoBanda])

  // cuando cambia luz -> recalcula margen

  useEffect(() => {

  if (editando.current === 'margen') return

  if (!anchoBanda || !anchoRuner || !luz) return

  let margenCalculado

  if (cantidad === 2) {
    margenCalculado = (anchoBanda - parseFloat(luz) - cantidad * anchoRuner) / 2
  }

  if (cantidad === 3) {
    margenCalculado = (anchoBanda - 2 * parseFloat(luz) - cantidad * anchoRuner) / 2
  }

  editando.current = 'luz'
  setMargen(margenCalculado)
  setTimeout(() => { editando.current = null }, 0)

  }, [luz, cantidad, anchoRuner, anchoBanda])

  function handleSiguiente() {

    if (!codigoRuner) {
        return alert('Asegúrese de haber elegido un código de runer')
    }
    const ruta = siguienteRuta(state.seleccion, 'runer')
    navigate(ruta, {
      state: {
        ...state,
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
    navigate('/banda/configurar/perfil-transversal', { state })
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
                  getLabel={runer => `${runer.codigo} - ${runer.tipo}`}
                  getKey={runer => runer.codigo}
                  placeholder="Busqueda por código o tipo de runer"
                />
                  
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
                      onChange={e => setMargen(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Luz (mm)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={luz}
                      onChange={e => setLuz(e.target.value)}
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
                No se encontró el ancho de banda — asegúrate de haberlo introducido en el paso anterior
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
                src={cantidad === 3 ? '/images/sketch-runer-2.svg' : '/images/sketch-runer-1.svg'}
                alt="Esquema de runers"
                className="config-side-img"
              />
              <span className="config-banda-label config-runer-margen">
                {margen || '—'} mm
              </span>
              <span className="config-banda-label config-runer-luz">
                {luz || '—'} mm
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
