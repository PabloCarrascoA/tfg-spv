import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function PerfilLConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [inferior, setInferior] = useState({ activo: true,  cantidad: 1, distancia: '', margen: '' })
  const [superior, setSuperior] = useState({ activo: false, cantidad: 1, distancia: '', margen: '' })

  function handleSiguiente() {
    console.log('siguiente paso')
  }

  function handleAtras() {
    navigate('/banda/configurar/banda', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">

        {/* mitad izquierda: formulario */}
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso 2 de 6</p>
          <p className="config-step-label">2. Perfil longitudinal</p>

          <div className="config-form">

            {/* --- bloque inferior --- */}
            <div className="perfil-bloque">
              <label className="perfil-check-label">
                <input
                  type="checkbox"
                  className="componente-checkbox"
                  checked={inferior.activo}
                  onChange={e => setInferior(p => ({ ...p, activo: e.target.checked }))}
                />
                Perfil longitudinal en cobertura inferior
              </label>

              {inferior.activo && (
                <div className="perfil-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Código de perfil</label>
                      <select className="form-select">
                        <option value="">- Seleccione un perfil -</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Número de perfiles</label>
                      <div className="counter">
                        <button className="counter-btn" onClick={() => setInferior(p => ({ ...p, cantidad: Math.max(1, p.cantidad - 1) }))}>−</button>
                        <span className="counter-value">{inferior.cantidad}</span>
                        <button className="counter-btn" onClick={() => setInferior(p => ({ ...p, cantidad: p.cantidad + 1 }))}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Distancia centros (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={inferior.distancia}
                        onChange={e => setInferior(p => ({ ...p, distancia: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Margen lateral (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={inferior.margen}
                        onChange={e => setInferior(p => ({ ...p, margen: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- bloque superior --- */}
            <div className="perfil-bloque">
              <label className="perfil-check-label">
                <input
                  type="checkbox"
                  className="componente-checkbox"
                  checked={superior.activo}
                  onChange={e => setSuperior(p => ({ ...p, activo: e.target.checked }))}
                />
                Perfil longitudinal en cobertura superior
              </label>

              {superior.activo && (
                <div className="perfil-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Código de perfil</label>
                      <select className="form-select">
                        <option value="">- Seleccione un perfil -</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Número de perfiles</label>
                      <div className="counter">
                        <button className="counter-btn" onClick={() => setSuperior(p => ({ ...p, cantidad: Math.max(1, p.cantidad - 1) }))}>−</button>
                        <span className="counter-value">{superior.cantidad}</span>
                        <button className="counter-btn" onClick={() => setSuperior(p => ({ ...p, cantidad: p.cantidad + 1 }))}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Distancia centros (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={superior.distancia}
                        onChange={e => setSuperior(p => ({ ...p, distancia: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Margen lateral (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={superior.margen}
                        onChange={e => setSuperior(p => ({ ...p, margen: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* comentarios — siempre visible */}
            <div className="form-group">
              <label className="form-label">Comentarios</label>
              <textarea className="form-textarea" placeholder="Comentarios" rows={3} />
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

export default PerfilLConfigView