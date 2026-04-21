import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'

const TIPOS_MALLA = [
  { value: 'uniforme',   label: 'Uniforme'   },
  { value: 'dispersado', label: 'Dispersado' },
]

function PerforacionesConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'perforaciones')

  const [agujerosPorFila, setAgujerosPorFila] = useState(1)
  const [filas, setFilas]                     = useState(1)
  const [diametro, setDiametro]               = useState('')
  const [tipoMalla, setTipoMalla]             = useState('')
  const [distanciaPaso, setDistanciaPaso]     = useState('')
  const [comentarios, setComentarios]         = useState('')

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'perforaciones')
    navigate(ruta, { state:
        {
            ...state,
            perforaciones: {
                agujerosPorFila,
                filas,
                diametro,
                tipoMalla,
                distanciaPaso,
                comentarios
            }
        }
     })
  }

  function handleAtras() {
    navigate('/banda/configurar/runer', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">5. Perforaciones</p>

          <div className="config-form">

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Agujeros por fila</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setAgujerosPorFila(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{agujerosPorFila}</span>
                  <button className="counter-btn" onClick={() => setAgujerosPorFila(c => c + 1)}>+</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Filas de agujeros</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setFilas(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{filas}</span>
                  <button className="counter-btn" onClick={() => setFilas(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Diámetro de los agujeros (mm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={diametro}
                onChange={e => setDiametro(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de malla</label>
              <select
                className="form-select"
                value={tipoMalla}
                onChange={e => {
                  setTipoMalla(e.target.value)
                  setDistanciaPaso('') // limpia al cambiar tipo
                }}
              >
                <option value="">- Seleccione un tipo -</option>
                {TIPOS_MALLA.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* solo visible si uniforme */}
            {tipoMalla === 'uniforme' && (
              <div className="form-group">
                <label className="form-label">Distancia de paso entre filas (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={distanciaPaso}
                  onChange={e => setDistanciaPaso(e.target.value)}
                />
              </div>
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

        <div className="config-side-panel" />
      </div>
    </div>
  )
}

export default PerforacionesConfigView