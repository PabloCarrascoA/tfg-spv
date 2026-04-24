import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getOndas } from '../../../services/api'


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
  const [anchoOnda, setAnchoOnda]       = useState('')
  const [pisada, setPisada]             = useState('')
  const [comentarios, setComentarios]   = useState('')

 useEffect(() => {
     getOndas()
       .then(data => setOndas(data))
       .catch(err => console.error('Error cargando ondas:', err))
   }, [])

  function handleSiguiente() {

    if (altura > 100 || altura < 10) {
      return alert('La altura de la onda no puede ser ni mayor a 100 (mm) ni inferior a 10 (mm)')
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
          anchoOnda,
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
              <div className="form-group">
                <label className="form-label">Código de la onda</label>
                <select
                  className="form-select"
                  value={codigoOnda}
                  onChange={e => setCodigoOnda(e.target.value)}
                >
                  <option value="">- Seleccione una onda -</option>
                  {ondas.map(onda => (
                    <option key={onda.codigo} value={onda.codigo}>
                      {onda.codigo} - {onda.tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cantidad de ondas</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

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
                <label className="form-label">Base (mm)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={base} onChange={e => setBase(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Altura (mm)</label>

                <input type="number" className="form-input" placeholder="0"
                  value={altura} onChange={e => setAltura(e.target.value)} />

                {altura % 5 !== 0 && <p style={{ fontSize: 13, color: '#e57373' }}>Recuerda que la altura debe ser múltiplo de 5</p>}

              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ancho onda (mm)</label>
                <input type="number" className="form-input" placeholder="0"
                  value={anchoOnda} onChange={e => setAnchoOnda(e.target.value)} />
              </div>
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

        <div className="config-side-panel" />
      </div>
    </div>
  )
}

export default OndaConfigView
