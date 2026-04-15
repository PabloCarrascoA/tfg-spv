import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getPerfilesLongitudinales } from '../../../services/api'

function PerfilLConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'perfil-longitudinal')

  // --- datos de la API ---
  const [perfiles, setPerfiles] = useState([])

  // --- estado del formulario ---
  const [inferior, setInferior] = useState({
    activo: false,
    codigo: '',
    cantidad: 1,
    distancia: '',
    distanciaBordeCentro: '',
    margen: '',
    cecntrado: false,
  })
  const [superior, setSuperior] = useState({
    activo: false,
    codigo: '',
    cantidad: 1,
    distancia: '',
    distanciaBordeCentro: '',
    margen: '',
    centrado: false,
  })
  const [comentarios, setComentarios] = useState('')

  // --- cargar perfiles al montar ---
  useEffect(() => {
    getPerfilesLongitudinales()
      .then(data => setPerfiles(data))
      .catch(err => console.error('Error cargando perfiles longitudinales:', err))
  }, [])

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'perfil-longitudinal')
    navigate(ruta, { state })
  }

  function handleAtras() {
    navigate('/banda/configurar/banda', { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Perfil longitudinal</p>

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
                      <select
                        className="form-select"
                        value={inferior.codigo}
                        onChange={e => setInferior(p => ({ ...p, codigo: e.target.value }))}
                      >
                        <option value="">- Seleccione un perfil -</option>
                        {perfiles.map(perfil => (
                          <option key={perfil.codigo} value={perfil.codigo}>
                            {perfil.codigo} - {perfil.tipo}
                          </option>
                        ))}
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

                  <div className="form-group">
                  <label className="form-label">¿Perfil centrado?</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                          type="radio"
                          name="perfil_centrado_inf"  
                          value="1"
                          checked={inferior.centrado === true}   
                          onChange={() => setInferior(p => ({ ...p, centrado: true }))}   
                      />
                      Sí
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                          type="radio"
                          name="perfil_centrado_inf"   
                          value="0"
                          checked={inferior.centrado === false}   
                          onChange={() => setInferior(p => ({ ...p, centrado: false }))} 
                      />
                      No
                      </label>
                  </div>
                  </div>
                  {console.log('inferior.centrado', inferior.centrado)}

                  <div className="form-row">

                    {inferior.cantidad > 1 && (

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

                    )}

                    <div className="form-group">
                      <label className="form-label">Distancia borde - centro (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={inferior.distanciaBordeCentro}
                        onChange={e => setInferior(p => ({ ...p, distanciaBordeCentro: e.target.value }))}
                      />
                    </div>
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
                      <select
                        className="form-select"
                        value={superior.codigo}
                        onChange={e => setSuperior(p => ({ ...p, codigo: e.target.value }))}
                      >
                        <option value="">- Seleccione un perfil -</option>
                        {perfiles.map(perfil => (
                          <option key={perfil.codigo} value={perfil.codigo}>
                            {perfil.codigo} - {perfil.tipo}
                          </option>
                        ))}
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


                <div className="form-group">
                <label className="form-label">¿Perfil centrado?</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="perfil_centrado_sup" 
                        value="1"
                        checked={superior.centrado === true}   
                        onChange={() => setSuperior(p => ({ ...p, centrado: true }))}   
                    />
                    Sí
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        name="perfil_centrado_sup"   
                        value="0"
                        checked={superior.centrado === false}   
                        onChange={() => setSuperior(p => ({ ...p, centrado: false }))}   
                    />
                    No
                    </label>
                </div>
                </div>

                  <div className="form-row">
                    {superior.cantidad > 1 && (
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
                    )}
                    <div className="form-group">
                      <label className="form-label">Distancia borde - centro (mm)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={inferior.distanciaBordeCentro}
                        onChange={e => setSuperior(p => ({ ...p, distanciaBordeCentro: e.target.value }))}
                      />
                    </div>
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
              )}
            </div>

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

        {/* mitad derecha: panel reservado */}
        <div className="config-side-panel" />

      </div>
    </div>
  )
}

export default PerfilLConfigView