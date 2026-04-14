import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getPerfilesTransversales } from '../../../services/api'

function PerfilTConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'perfil-transversal')

  const [cantidad, setCantidad]         = useState(1)
  const [hileras, setHileras]           = useState(1)
  const [codigoPerfil, setCodigoPerfil] = useState('')
  const [distancia, setDistancia]       = useState('')
  const [ancho, setAncho]               = useState('')
  const [margen, setMargen]             = useState('')
  const [luz, setLuz]                   = useState('')
  const [comentarios, setComentarios]   = useState('')

  // --- datos de la API ---

  const [perfilesT, setPerfilesT] = useState([])

  // --- cargar perfiles transversales al montar ---

  useEffect(() => {
    getPerfilesTransversales()
      .then(data => setPerfilesT(data))
      .catch(err => console.error('Error cargando perfiles transversales:', err))
  }, [])

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'perfil-transversal')
    navigate(ruta, { state })
  }

  function handleAtras() {
    const ruta = siguienteRuta(state.seleccion, 'banda') // vuelve al paso anterior seleccionado
    navigate(ruta.replace('configurar', 'configurar'), { state })
  }

  return (
    <div className="config-view">
      <div className="config-row">

        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Perfil transversal</p>

          <div className="config-form">

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de perfil</label>
                <select 
                    className="form-select"
                    value={codigoPerfil}
                    onChange={e => setCodigoPerfil(e.target.value)}
                >
                  <option value="">- Seleccione un perfil -</option>
                  {perfilesT.map(perfil => (
                    <option key={perfil.codigo} value={perfil.codigo}>
                      {perfil.codigo} - {perfil.tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número de perfiles</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                  <span className="counter-value">{cantidad}</span>
                  <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                </div>
              </div>
            </div>

            {cantidad > 1 && (
            <div className="form-group">
              <label className="form-label">Distancia de paso (mm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={distancia}
                onChange={e => setDistancia(e.target.value)}
              />
            </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ancho del perfil (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={ancho}
                  onChange={e => setAncho(e.target.value)}
                />
              </div>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de hileras</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setHileras(h => Math.max(1, h - 1))}>−</button>
                  <span className="counter-value">{hileras}</span>
                  <button className="counter-btn" onClick={() => setHileras(h => h + 1)}>+</button>
                </div>
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

export default PerfilTConfigView