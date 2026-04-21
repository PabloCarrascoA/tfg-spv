import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getPerfilesLongitudinales } from '../../../services/api'

function PerfilLConfigView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const { actual, total } = infoPaso(state.seleccion, 'perfil-longitudinal')

  const anchoBanda = parseFloat(state.banda?.ancho) || null

  const [perfiles, setPerfiles] = useState([])

  const [inferior, setInferior] = useState({
    activo: false,
    codigo: '',
    cantidad: 1,
    distancia: '',
    distanciaBordeCentro: '',
    centrado: false,
  })
  const [superior, setSuperior] = useState({
    activo: false,
    codigo: '',
    cantidad: 1,
    distancia: '',
    distanciaBordeCentro: '',
    centrado: false,
  })
  const [comentarios, setComentarios] = useState('')

  useEffect(() => {
    getPerfilesLongitudinales()
      .then(data => setPerfiles(data))
      .catch(err => console.error('Error cargando perfiles longitudinales:', err))
  }, [])

  // --- autocalculo distanciaBordeCentro inferior ---

  useEffect(() => {
    if (!inferior.activo || !anchoBanda) return

    if (inferior.centrado) {
      if (inferior.cantidad === 1) {
        // un perfil centrado → mitad del ancho
        setInferior(p => ({ ...p, distanciaBordeCentro: String(anchoBanda / 2) }))
      } else {
        // varios perfiles centrados → depende de distancia entre centros
        if (!inferior.distancia) return
        const bordeCentro = (anchoBanda - (inferior.cantidad - 1) * parseFloat(inferior.distancia)) / 2
        setInferior(p => ({ ...p, distanciaBordeCentro: bordeCentro >= 0 ? String(bordeCentro) : '' }))
      }
    }
  }, [inferior.centrado, inferior.cantidad, inferior.distancia, anchoBanda, inferior.activo])

  // --- autocalculo distanciaBordeCentro superior ---

  useEffect(() => {
    if (!superior.activo || !anchoBanda) return

    if (superior.centrado) {
      if (superior.cantidad === 1) {
        setSuperior(p => ({ ...p, distanciaBordeCentro: String(anchoBanda / 2) }))
      } else {
        if (!superior.distancia) return
        const bordeCentro = (anchoBanda - (superior.cantidad - 1) * parseFloat(superior.distancia)) / 2
        setSuperior(p => ({ ...p, distanciaBordeCentro: bordeCentro >= 0 ? String(bordeCentro) : '' }))
      }
    }
  }, [superior.centrado, superior.cantidad, superior.distancia, anchoBanda, superior.activo])

  function handleSiguiente() {
    const ruta = siguienteRuta(state.seleccion, 'perfil-longitudinal')
    navigate(ruta, {
      state: {
        ...state,
        perfilL: { inferior, superior, comentarios }
      }
    })
  }

  function handleAtras() {
    navigate('/banda/configurar/banda', { state })
  }

  function BloquePerfilL({ label, perfil, setPerfil }) {
    const superaBanda = anchoBanda && parseFloat(perfil.distanciaBordeCentro) > anchoBanda / 2

    const distanciaExcede = anchoBanda && perfil.cantidad > 1 &&
      ((perfil.cantidad - 1) * parseFloat(perfil.distancia) + 2 * parseFloat(perfil.distanciaBordeCentro)) > anchoBanda

    return (
      <div className="perfil-bloque">
        <label className="perfil-check-label">
          <input
            type="checkbox"
            className="componente-checkbox"
            checked={perfil.activo}
            onChange={e => setPerfil(p => ({ ...p, activo: e.target.checked }))}
          />
          {label}
        </label>

        {perfil.activo && (
          <div className="perfil-fields">

            {/* código + cantidad */}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código de perfil</label>
                <select
                  className="form-select"
                  value={perfil.codigo}
                  onChange={e => setPerfil(p => ({ ...p, codigo: e.target.value }))}
                >
                  <option value="">- Seleccione un perfil -</option>
                  {perfiles.map(perf => (
                    <option key={perf.codigo} value={perf.codigo}>
                      {perf.codigo} - {perf.tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número de perfiles</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setPerfil(p => ({ ...p, cantidad: Math.max(1, p.cantidad - 1), distancia: '' }))}>−</button>
                  <span className="counter-value">{perfil.cantidad}</span>
                  <button className="counter-btn" onClick={() => setPerfil(p => ({ ...p, cantidad: p.cantidad + 1, distancia: '' }))}>+</button>
                </div>
              </div>
            </div>

            {/* centrado */}

            <div className="form-group">
              <label className="form-label">¿Perfil centrado?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name={`centrado_${label}`} checked={perfil.centrado === true}
                    onChange={() => setPerfil(p => ({ ...p, centrado: true, distanciaBordeCentro: '' }))} />
                  Sí
                </label>
                <label className="radio-label">
                  <input type="radio" name={`centrado_${label}`} checked={perfil.centrado === false}
                    onChange={() => setPerfil(p => ({ ...p, centrado: false, distanciaBordeCentro: '' }))} />
                  No
                </label>
              </div>
            </div>


            <div className='form-row'>

                <div className="form-group">
                <label className="form-label">
                    Distancia borde – centro (mm)
                    {perfil.centrado && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>— calculada</span>}
                </label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={perfil.distanciaBordeCentro}
                    readOnly={perfil.centrado}
                    style={perfil.centrado ? { background: '#f5f6f8', color: '#6b7280' } : {}}
                    onChange={e => !perfil.centrado && setPerfil(p => ({ ...p, distanciaBordeCentro: e.target.value }))}
                />
                </div>

                {perfil.cantidad > 1 && (

                    <div className="form-group">
                        <label className="form-label">Distancia entre centros (mm)</label>
                        <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={perfil.distancia}
                        onChange={e => setPerfil(p => ({ ...p, distancia: e.target.value }))}
                        />
                    </div>
                    )}
            </div>
            
            {/* Alertas */}

            {superaBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                La distancia borde–centro supera la mitad del ancho de la banda ({anchoBanda / 2} mm)
              </p>
            )}

            {distanciaExcede && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                La distribución de perfiles supera el ancho de la banda ({anchoBanda} mm)
              </p>
            )}

            {superior.codigo && !anchoBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                No se encontró el ancho de la banda — asegúrate de haberlo introducido en el paso anterior
              </p>
            )}

            {inferior.codigo && !anchoBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                No se encontró el ancho de la banda — asegúrate de haberlo introducido en el paso anterior
              </p>
            )}

          </div>
        )}
      </div>
    )
  }

  return (
    <div className="config-view">
      <div className="config-row">
        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Perfil longitudinal</p>

          <div className="config-form">
            <BloquePerfilL
              label="Perfil longitudinal en cobertura inferior"
              perfil={inferior}
              setPerfil={setInferior}
            />
            <BloquePerfilL
              label="Perfil longitudinal en cobertura superior"
              perfil={superior}
              setPerfil={setSuperior}
            />

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

export default PerfilLConfigView