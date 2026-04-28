import { useState, useEffect, useRef } from 'react'
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
  const [identico, setIdentico]         = useState(true)
  const [ancho1, setAncho1]             = useState('')
  const [ancho2, setAncho2]             = useState('')
  const [comentarios, setComentarios]   = useState('')

  // --- datos de la API ---

  const [perfilesT, setPerfilesT] = useState([])

  // --- cargar perfiles transversales al montar ---

  useEffect(() => {
    getPerfilesTransversales()
      .then(data => setPerfilesT(data))
      .catch(err => console.error('Error cargando perfiles transversales:', err))
  }, [])

  // cuando es idéntico: el usuario controla `luz`, se calculan ancho1 y ancho2

    useEffect(() => {
    if (!identico) return
    if (!ancho || !luz) return

    const anchoCalculado = (parseFloat(ancho) - parseFloat(luz)) / 2
    if (anchoCalculado > 0) {
        setAncho1(String(anchoCalculado))
        setAncho2(String(anchoCalculado))
    }
    }, [luz, ancho, identico])

    // cuando no es idéntico: el usuario controla ancho1 y ancho2, se calcula luz

    useEffect(() => {
    if (identico) return
    if (!ancho || !ancho1 || !ancho2) return

    const luzCalculada = parseFloat(ancho) - parseFloat(ancho1) - parseFloat(ancho2)
    if (luzCalculada >= 0) {
        setLuz(String(luzCalculada))
    }
    }, [ancho1, ancho2, ancho, identico])

    const editando = useRef(null)
    const anchoBanda = parseFloat(state.banda?.ancho) || null

    useEffect(() => {
      if (editando.current === 'margen') return
      if (!anchoBanda || !ancho) return

      const margenCalculado = (anchoBanda - parseFloat(ancho)) / 2
      if (margenCalculado >= 0) {
        editando.current = 'ancho'
        setMargen(String(margenCalculado))
        setTimeout(() => { editando.current = null }, 0)
      }
    }, [anchoBanda, ancho])

    useEffect(() => {
      if (editando.current === 'ancho') return
      if (!anchoBanda || !margen) return

      const anchoCalculado = (anchoBanda - 2 * parseFloat(margen))

      if (anchoCalculado >= 0) {
        editando.current = 'margen'
        setAncho(String(anchoCalculado))
        setTimeout(() => {editando.current = null}, 0)
      }
    }, [anchoBanda, margen])


  function handleSiguiente() {

    if (!codigoPerfil) {
      return alert('Asegúrese de haber seleccionado un código de perfil')
    }

    const ruta = siguienteRuta(state.seleccion, 'perfil-transversal')
    navigate(ruta, {
        state: {
        ...state,
        perfilT: {
            codigoPerfil,
            cantidad,
            distancia,
            ancho,
            margen,
            hileras,
            identico,
            ancho1,
            ancho2,
            luz,
            comentarios,
        }
        }
    })
    }

  function handleAtras() {
    const ruta = siguienteRuta(state.seleccion, 'banda')
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
              <label className="form-label">Paso entre perfiles (mm)</label>
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

            {ancho && anchoBanda && parseFloat(ancho) > anchoBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                El ancho del perfil no puede superar el ancho de la banda ({anchoBanda} mm)
              </p>
            )}

            {margen && anchoBanda && 2 * (parseFloat(margen)) > anchoBanda && (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                La suma de ambos márgenes laterales no puede superar el ancho de la banda ({anchoBanda} mm)
              </p>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de hileras</label>
                <div className="counter">
                  <button className="counter-btn" onClick={() => setHileras(h => Math.max(1, h - 1))}>−</button>
                  <span className="counter-value">{hileras}</span>
                  <button className="counter-btn" onClick={() => setHileras(h => h + 1)}>+</button>
                </div>
              </div>

            </div>

            {hileras > 1 && ancho &&(
                <>
                    <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">¿Son los perfiles idénticos?</label>
                        <div className="radio-group">
                        <label className="radio-label">
                            <input type="radio" name="identico" checked={identico === true}
                            onChange={() => { setIdentico(true); setAncho1(''); setAncho2(''); setLuz('') }} />
                            Sí
                        </label>
                        <label className="radio-label">
                            <input type="radio" name="identico" checked={identico === false}
                            onChange={() => { setIdentico(false); setAncho1(''); setAncho2(''); setLuz('') }} />
                            No
                        </label>
                        </div>
                    </div>
                    </div>

                    {identico ? (

                    // idéntico: usuario introduce luz, anchos se calculan solos
                    <>
                        <div className="form-group">
                        <label className="form-label">Luz interior (mm)</label>
                        <input type="number" className="form-input" placeholder="0"
                            value={luz} onChange={e => setLuz(e.target.value)} />
                        </div>
                        {luz && (parseFloat(luz) < parseFloat(ancho)) && (
                        <div className="form-row">
                            <div className="form-group">
                            <label className="form-label">Ancho perfil 1 (mm) — calculado</label>
                            <input type="number" className="form-input" value={ancho1} readOnly
                                style={{ background: '#f5f6f8', color: '#6b7280' }} />
                                {console.log('ancho1 calculado:', ancho1)}
                            </div>
                            <div className="form-group">
                            <label className="form-label">Ancho perfil 2 (mm) — calculado</label>
                            <input type="number" className="form-input" value={ancho2} readOnly
                                style={{ background: '#f5f6f8', color: '#6b7280' }} />
                            </div>
                        </div>
                        )}

                        {hileras > 1 && (parseFloat(luz) >= parseFloat(ancho)) && (
                            console.log('luz:', luz, 'ancho:', ancho),
                        <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho de la luz excede o es igual al ancho total del perfil
                        </p>
                        )}

                    </>
                    ) : (
                    // no idéntico: usuario introduce ancho1 y ancho2, luz se calcula sola
                    <>
                        <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ancho perfil 1 (mm)</label>
                            <input type="number" className="form-input" placeholder="0"
                            value={ancho1} onChange={e => setAncho1(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ancho perfil 2 (mm)</label>
                            <input type="number" className="form-input" placeholder="0"
                            value={ancho2} onChange={e => setAncho2(e.target.value)} />
                        </div>
                        </div>
                        {ancho1 && ancho2 && ((parseFloat(ancho1) < parseFloat(ancho)) && (parseFloat(ancho2) < parseFloat(ancho))) && ((parseFloat(ancho1) + parseFloat(ancho2)) < parseFloat(ancho)) &&  (

                        <div className="form-group">
                            <label className="form-label">Luz interior (mm) — calculada</label>
                            <input type="number" className="form-input" value={luz} readOnly
                            style={{ background: '#f5f6f8', color: '#6b7280' }} />
                        </div>
                        
                        )}

                        {hileras > 1 && ((parseFloat(ancho1) > parseFloat(ancho)) || (parseFloat(ancho2) > parseFloat(ancho))) && (
                            console.log('luz:', luz, 'ancho:', ancho),
                        <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho de los perfiles excede el ancho total del perfil
                        </p>
                        )}

                        {hileras > 1 && ((parseFloat(ancho1) + parseFloat(ancho2)) > ancho) && (
                            console.log('luz:', luz, 'ancho:', ancho),
                        <p style={{ fontSize: 13, color: '#e57373' }}>
                            La suma del ancho de los perfiles excede el ancho total del perfil
                        </p>
                        )}
                        
                    </>
                    )}
                </>
                )}

                {hileras > 1 && !ancho && (
                    <p style={{ fontSize: 13, color: '#e57373' }}>
                        Introduce primero el ancho del perfil para calcular las hileras
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

        <div className="config-side-panel" />

      </div>
    </div>
  )
}

export default PerfilTConfigView