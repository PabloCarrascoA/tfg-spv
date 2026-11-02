import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getOndas } from '../../../services/api'
import AutocompleteSelect from '../../../components/common/AutocompleteSelect'

const COLORES = [
  { value: 'NEGRO', label: 'Negro' },
  { value: 'BLANCO', label: 'Blanco' },
  { value: 'AZUL', label: 'Azul' },
  { value: 'VERDE', label: 'Verde'}
]


function OndaConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'ondas')

  const [ondas, setOndas] = useState([])

  const [codigoOnda, setCodigoOnda]     = useState('')
  const [cantidad, setCantidad]         = useState(1)
  const [continua, setContinua]         = useState(null)
  const [base, setBase]                 = useState('')
  const [altura, setAltura]             = useState('')
  const [anchoOndaTotal, setAnchoOndaTotal]       = useState('')
  const [pisada, setPisada]             = useState('')
  const [comentarios, setComentarios]   = useState('')
  const [color, setColor]               = useState('')

  const [paso, setPaso]                 = useState(1)
  const [columnas, setColumnas]         = useState(1)
  const [margen, setMargen]             = useState('')
  const [luz, setLuz]                   = useState('')
  const [anchoOnda, setAnchoOnda]       = useState('')
  const [referenciaAncho, setReferenciaAncho] = useState('ancho')

  const anchoBanda = Number(state.banda?.ancho)
  const largoBanda = Number(state.banda?.longitud)
  const alturaNumero = Number(altura)
  const baseMayorQueLargoBanda = base !== '' && Number(base) > largoBanda
  const anchoOndaTotalMayorQueAnchoBanda = anchoOndaTotal !== '' && Number(anchoOndaTotal) > anchoBanda
  const alturaFueraDeRango = altura !== '' && (alturaNumero > 100 || alturaNumero < 10)

 useEffect(() => {
     getOndas()
       .then(data => setOndas(data))
       .catch(err => console.error('Error cargando ondas:', err))
   }, [])

useEffect(() => {
      const largo = parseFloat(state.banda?.longitud)
      if (!largo || cantidad <= 1) {
        setPaso('')  // reset
        return
      }

      const paso = largo / cantidad
      setPaso(paso.toFixed(2))  
    }, [cantidad, state.banda?.longitud])

  useEffect(() => {
    if (!Number.isFinite(anchoBanda) || anchoBanda <= 0) return
    if (referenciaAncho === 'margen') {
      setAnchoOndaTotal(margen === '' ? '' : String(anchoBanda - 2 * Number(margen)))
    } else {
      setMargen(anchoOndaTotal === '' ? '' : String((anchoBanda - Number(anchoOndaTotal)) / 2))
    }
  }, [anchoBanda, anchoOndaTotal, margen, referenciaAncho])

  useEffect(() => {
    if (columnas === 1) {
      setAnchoOnda(anchoOndaTotal)
      return
    }
    if (anchoOndaTotal === '' || luz === '') {
      setAnchoOnda('')
      return
    }
    const anchoCalculado = (Number(anchoOndaTotal) - Number(luz) * (columnas - 1)) / columnas
    setAnchoOnda(anchoCalculado > 0 ? anchoCalculado.toFixed(2) : '')
  }, [anchoOndaTotal, luz, columnas])

  const luzIncompatible = columnas > 1 && luz !== '' && (
    Number(luz) < 0 || (anchoOndaTotal !== '' && Number(luz) * (columnas - 1) >= Number(anchoOndaTotal))
  )
  const margenIncompatible = margen !== '' && (Number(margen) < 0 || Number(margen) * 2 >= anchoBanda)

  function handleSiguiente() {

    if (alturaFueraDeRango || baseMayorQueLargoBanda || anchoOndaTotalMayorQueAnchoBanda || luzIncompatible || margenIncompatible) {
      return alert('Revisa las alertas de configuración, hay parámetros incompatibles')
    }

    if (!codigoOnda) {
       return alert('Asegúrese de haber elegido un código de onda')
    }

    const ruta = siguienteRuta(state.seleccion, 'ondas')
    navigate(ruta, {
      state: {
        ...state,
        onda: {
          codigoOnda,
          cantidad,
          continua,
          base,
          altura,
          anchoOndaTotal,
          anchoOnda,
          columnas,
          margen,
          luz: columnas > 1 ? luz : '',
          paso,
          pisada,
          comentarios,
        }
      }
    })
  }

  function handleAtras() {
    navigate('/banda/configurar/perforaciones', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">6. Ondas</p>

          <div className="config-form">

            <div className="form-row">
                <span className="form-label">Ancho de la banda: <span className='config-step-label'>{state.banda?.ancho} mm</span></span>
                <span className="form-label">Largo de la banda: <span className='config-step-label'>{state.banda?.longitud} mm</span></span>
          </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de la onda</label>

                <AutocompleteSelect
                  opciones={ondas}
                  valorSeleccionado={ondas.find(o => o.codigo === codigoOnda) ?? null}
                  onSeleccionar={onda => {
                    setCodigoOnda(onda?.codigo ?? '')
                  }}
                  getLabel={onda => `${onda.codigo} - ${onda.tipo}`}
                  getKey={onda => onda.codigo}
                  placeholder="Busqueda por código o tipo de onda"
                />

              </div>

              <div className="form-group">
                <label className="form-label">Número de filas</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>

            </div>

            {cantidad > 1 && (
                      <div className="form-group">
                        <label className="form-label">Paso entre ondas (mm)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={paso}
                          readOnly
                          style={{ background: '#f5f6f8', color: '#6b7280' }}
                        />
                      </div>
                    )}

            <div className="form-group">
              <label className="form-label">¿Es la onda continua?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="continua"
                    value="si"
                    checked={continua === true}
                    onChange={() => setContinua(true)}
                  />
                  Sí
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="continua"
                    value="no"
                    checked={continua === false}
                    onChange={() => setContinua(false)}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ondas por fila</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setColumnas(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{columnas}</span>
                  <button className="counter-btn" onClick={() => setColumnas(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{columnas === 1 ? 'Ancho onda (mm)' : 'Ancho total (ondas + luces) (mm)'}</label>
                <input type="number" className="form-input" placeholder="0"
                  value={anchoOndaTotal} onChange={e => { setReferenciaAncho('ancho'); setAnchoOndaTotal(e.target.value) }} />
                {anchoOndaTotalMayorQueAnchoBanda && <p style={{ fontSize: 13, color: '#e57373' }}>El ancho de la onda no puede ser superior al ancho de la banda ({anchoBanda} mm)</p>}
              </div>

               <div className="form-group">
                <label className="form-label">Margen Lateral (mm)</label>

                <input type="number" className="form-input" placeholder="0"
                  value={margen} onChange={e => { setReferenciaAncho('margen'); setMargen(e.target.value) }} />
                {margenIncompatible && <p style={{ fontSize: 13, color: '#e57373' }}>El margen debe dejar un ancho positivo para las ondas dentro de la banda.</p>}

              </div>
            </div>

            {columnas > 1 && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Luz (mm)</label>
                  <input type="number" min="0" className="form-input" placeholder="0"
                    value={luz} onChange={e => setLuz(e.target.value)} />
                  {luzIncompatible && <p style={{ fontSize: 13, color: '#e57373' }}>Las luces deben dejar un ancho positivo para cada onda.</p>}
                </div>
                {luz !== '' && (
                  <div className="form-group">
                    <label className="form-label">Ancho onda (mm)</label>
                    <input type="number" className="form-input" value={anchoOnda} readOnly
                      style={{ background: '#f5f6f8', color: '#6b7280' }} />
                  </div>
                )}
              </div>
            )}

            <hr style={{ border: 0, borderTop: '1px solid #4a6f8a' }} />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base (mm)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={base} onChange={e => setBase(e.target.value)} />
                {baseMayorQueLargoBanda && <p style={{ fontSize: 13, color: '#e57373' }}>La base de la onda no puede ser superior al largo de la banda ({largoBanda} mm)</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Altura (mm)</label>

                <input type="number" className="form-input" placeholder="0"
                  value={altura} onChange={e => setAltura(e.target.value)} />

                {altura % 5 !== 0 && <p style={{ fontSize: 13, color: '#e57373' }}>Recuerda que la altura debe ser múltiplo de 5</p>}
                {alturaFueraDeRango && <p style={{ fontSize: 13, color: '#e57373' }}>La altura de la onda no puede ser ni mayor a 100 (mm) ni inferior a 10 (mm)</p>}

              </div>
            </div>

            <div className="form-row">
              
              <div className="form-group">
                <label className="form-label">Pisada (mm)</label>
                <select
                  className="form-select"
                  value={pisada}
                  onChange={e => setPisada(e.target.value)}
                >
                  <option value="">- Seleccione una pisada -</option>
                  <option value="12">12</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea className="form-textarea" placeholder="Comentarios" rows={3}
                value={comentarios} onChange={e => setComentarios(e.target.value)} />
            </div>

          </div>

          <div className="config-footer">
            <button className="btn-atras" onClick={handleAtras}>‹ Atrás</button>
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente ›</button>
          </div>
        </div>

        <div className="config-side-panel">
          <div className="config-side-img-wrapper config-onda-wrapper">
            <img
              src="/images/sketch-ondas.svg"
              alt="Esquema de onda"
              className="config-side-img"
            />
            <span className="config-onda-label config-onda-ancho">
              {anchoOnda || '—'} mm
            </span>
            <span className="config-onda-label config-onda-altura">
              {altura || '—'} mm
            </span>
            <span className="config-onda-label config-onda-base">
              {base || '—'} mm
            </span>
            <span className="config-onda-label config-onda-pisada">
              {pisada || '—'} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OndaConfigView
