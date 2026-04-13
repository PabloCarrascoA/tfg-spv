import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function BandaConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [cantidad, setCantidad] = useState(1)

  function handleSiguiente() {
    // aquí navegarás al siguiente paso según la selección
    // lo implementaremos cuando tengamos el wizard
    console.log('siguiente paso')
  }

  function handleAtras() {
    navigate('/banda', { state })
  }

  return (
    <div className="config-view">

      {/* contenedor en fila: formulario + panel azul */}
      <div className="config-row">

        {/* mitad izquierda: formulario */}
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso 1 de 6</p>
          <p className="config-step-label">1. Banda cortada y empalme</p>

          <div className="config-form">

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de banda</label>
                <select className="form-select">
                  <option value="">- Seleccione una banda -</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad de bandas</label>
                <div className="counter">
                    <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                    <span className="counter-value">{cantidad}</span>
                    <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ancho (mm)</label>
                <input type="number" className="form-input" placeholder="0" />
              </div>

              <div className="form-group">
                <label className="form-label">Longitud (mm)</label>
                <input type="number" className="form-input" placeholder="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de empalme</label>
              <select className="form-select">
                <option value="">- Seleccione un tipo -</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Código de empalme</label>
              <select className="form-select">
                <option value="">- Seleccione un empalme -</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea
                className="form-textarea"
                placeholder="Comentarios"
                rows={3}
              />
            </div>

          </div>

          <div className="config-footer">
            <button className="btn-atras" onClick={handleAtras}>‹ Atrás</button>
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente ›</button>
          </div>
        </div>

        {/* mitad derecha: panel reservado */}
        <div className="config-side-panel" />

      </div>
    </div>
  )
}

export default BandaConfigView