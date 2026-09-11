import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getPerfilesLongitudinales } from '../../../services/api'
import AutocompleteSelect from '../../../components/common/AutocompleteSelect'

const COLORES = [

  { value: 'NEGRO', label: 'Negro' },
  { value: 'BLANCO', label: 'Blanco' },
  { value: 'AZUL', label: 'Azul' },
  { value: 'VERDE', label: 'Verde'}

]

const ACOTADOS = [

  { value: 1, label: 'Canto banda / Canto perfil' },
  { value: 2, label: 'Canto banda / Centro perfil' },
  { value: 3, label: 'Entre centros de perfiles'},
  { value: 4, label: 'Interior / Interior'},
  { value: 5, label: 'Según plano'},
  { value: 6, label: 'Perfiles a los extremos'}

]

function esCotaActiva(acotado, campo) {
  const mapa = {
    1: 'distanciaBordeBanda',
    2: 'distanciaBordeCentro',
    3: 'distancia',
    4: 'distanciaEntreBandas',
  }
  return mapa[acotado] === campo
}

function BloquePerfilL({ label, perfil, setPerfil, perfiles, anchoBanda }) {
  const distanciaBordeCentro = parseFloat(perfil.distanciaBordeCentro)
  const distanciaCentros = parseFloat(perfil.distancia)
  const perfilSeleccionado = perfiles.find(perf => perf.codigo === perfil.codigo)
  const anchoPerfil = parseFloat(perfilSeleccionado?.ancho)

  // --- autocalculo cuando los perfiles van a los extremos ---
  useEffect(() => {
    if (!perfil.extremos) return
    if (!anchoBanda || Number.isNaN(anchoPerfil)) return

    const bordeCentroCalculado = anchoPerfil / 2

    setPerfil(p => {
      const actualizado = { ...p, distanciaBordeCentro: String(bordeCentroCalculado) }

      if (p.cantidad > 1) {
        const distanciaCalculada = ((anchoBanda - anchoPerfil) / (p.cantidad - 1)).toFixed(2)
        actualizado.distancia = distanciaCalculada >= 0 ? String(distanciaCalculada) : ''
      }

      return actualizado
    })
  }, [perfil.extremos, perfil.cantidad, anchoBanda, anchoPerfil])

  const superaBanda =
    Boolean(anchoBanda) &&
    !Number.isNaN(distanciaBordeCentro) &&
    distanciaBordeCentro > anchoBanda / 2

  // Si la distancia entre centros + 2 veces la distancia borde-centro supera el ancho de la banda, muestra alterta
  
  const distanciaExcede =
  Boolean(anchoBanda) &&
  perfil.cantidad > 1 &&
  !Number.isNaN(distanciaCentros) &&
  !Number.isNaN(distanciaBordeCentro) &&
  ((perfil.cantidad - 1) * distanciaCentros + 2 * distanciaBordeCentro) > anchoBanda

  // distancia borde centro siempre hay 2

  const distanciaIncompatible =
    Boolean(anchoBanda) &&
    perfil.cantidad > 1 &&
    !Number.isNaN(distanciaCentros) &&
    !Number.isNaN(anchoPerfil) &&
    distanciaCentros > ((anchoBanda - (perfil.cantidad * anchoPerfil)) + anchoPerfil)

  
  function calcularCascadaAcotado(campoEditado, valorTexto, p) {
    const n = p.cantidad
    const v = parseFloat(valorTexto)

    if (Number.isNaN(v) || !anchoBanda || Number.isNaN(anchoPerfil) || n <= 1) {
      return { [campoEditado]: valorTexto }
    }

    let bordeCentro
    let distanciaEntreCentros

    switch (campoEditado) {
      case 'distanciaBordeCentro':
        bordeCentro = v
        distanciaEntreCentros = (anchoBanda - 2 * v) / (n - 1)
        break
      case 'distanciaBordeBanda':
        bordeCentro = v + anchoPerfil / 2
        distanciaEntreCentros = (anchoBanda - 2 * bordeCentro) / (n - 1)
        break
      case 'distancia':
        distanciaEntreCentros = v
        bordeCentro = (anchoBanda - (n - 1) * v) / 2
        break
      case 'distanciaEntreBandas':
        distanciaEntreCentros = v + anchoPerfil
        bordeCentro = (anchoBanda - (n - 1) * distanciaEntreCentros) / 2
        break
      default:
        return { [campoEditado]: valorTexto }
    }

    const bordeBanda = bordeCentro - anchoPerfil / 2
    const entreBandas = distanciaEntreCentros - anchoPerfil

    return {
      [campoEditado]: valorTexto,
      distanciaBordeCentro: bordeCentro >= 0 ? String(bordeCentro) : '',
      distanciaBordeBanda: String(bordeBanda),
      distancia: distanciaEntreCentros >= 0 ? String(distanciaEntreCentros) : '',
      distanciaEntreBandas: String(entreBandas),
    }
    }

    
  function handleDistanciaBordeCentroChange(value) {
    setPerfil(p => ({ ...p, ...calcularCascadaAcotado('distanciaBordeCentro', value, p) }))
  }

  function handleDistanciaBordeBandaChange(value) {
    setPerfil(p => ({ ...p, ...calcularCascadaAcotado('distanciaBordeBanda', value, p) }))
  }

  function handleDistanciaChange(value) {
    setPerfil(p => ({ ...p, ...calcularCascadaAcotado('distancia', value, p) }))
  }

  function handleDistanciaEntreBandasChange(value) {
    setPerfil(p => ({ ...p, ...calcularCascadaAcotado('distanciaEntreBandas', value, p) }))
  }



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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código de perfil</label>

              <AutocompleteSelect
                opciones = {perfiles}
                valorSeleccionado = {perfiles.find(p => p.codigo === perfil.codigo) ?? null}
                onSeleccionar = {perfil => setPerfil(p => ({ 
                  ...p, 
                  codigo: perfil?.codigo ?? '', 
                  tipo: perfil?.tipo ?? ''
                  }))} 
                  getLabel = {perfil => `${perfil.tipo}`}
                  getKey = {perfil => perfil.codigo}
                  placeholder = "Busqueda por código o tipo de perfil"
                  />
             
            </div>
            <div className="form-group">
              <label className="form-label">Número de perfiles</label>
              <div className="counter">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setPerfil(p => {
                    const nuevaCantidad = Math.max(1, p.cantidad - 1)
                    const cruzaFrontera = (p.cantidad === 1) !== (nuevaCantidad === 1)

                    return cruzaFrontera
                      ? { ...p, cantidad: nuevaCantidad, distancia: '', distanciaBordeCentro: '', distanciaBordeBanda: '', distanciaEntreBandas: '', acotado: '' }
                      : { ...p, cantidad: nuevaCantidad }
                  })}
                >
                  −
                </button>
                <span className="counter-value">{perfil.cantidad}</span>
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => setPerfil(p => {
                    const nuevaCantidad = p.cantidad + 1
                    const cruzaFrontera = (p.cantidad === 1) !== (nuevaCantidad === 1)

                    return cruzaFrontera
                      ? { ...p, cantidad: nuevaCantidad, distancia: '', distanciaBordeCentro: '', distanciaBordeBanda: '', distanciaEntreBandas: '', acotado: '' }
                      : { ...p, cantidad: nuevaCantidad }
                  })}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Seleccione el color del perfil</label>
                <select className="form-select" 
                        value={perfil.color}
                        onChange={e => setPerfil(p => ({ ...p, color: e.target.value }))}>
                  <option value="">- Seleccione un color -</option>
                  {COLORES?.map(color => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>

                
            </div>
          </div>

          {console.log('color del perfil:', perfil.color)}

          {/*PREGUNTA CENTRADO*/}

          {perfil.cantidad == 1 && (
            <div className="form-group">
            <label className="form-label">¿Perfil centrado?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name={`centrado_${label}`}
                  checked={perfil.centrado === true}
                  onChange={() => setPerfil(p => ({ ...p, centrado: true, distanciaBordeCentro: '' }))}
                />
                Sí
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name={`centrado_${label}`}
                  checked={perfil.centrado === false}
                  onChange={() => setPerfil(p => ({ ...p, centrado: false, extremos: false, distanciaBordeCentro: '' }))}
                />
                No
              </label>
            </div>
          </div>
          )}

          {/*ACOTAMIENTO*/}

          {perfil.cantidad > 1 && ( 
            perfil.codigo ? (
              <div className="form-row">
              <div className="form-group">
                <label className="form-label">Seleccione el acotado</label>
                  <select className="form-select" 
                          value={perfil.acotado}
                          onChange={e => setPerfil(p => ({ ...p, acotado: Number(e.target.value) }))}>
                    <option value="">- Seleccione un acotado -</option>
                    {ACOTADOS?.map(acotado => (
                      <option key={acotado.value} value={acotado.value}>{acotado.label}</option>
                    ))}
                  </select>

                  
              </div>
            </div>

            ) : (
              <p style={{ fontSize: 13, color: '#e57373' }}>
                Seleccione primero un tipo de perfil para poder elegir el acotado.
              </p>
            )
            
            
          )}

          <div className="form-row">
            {(perfil.cantidad === 1 || perfil.acotado === 2) && (
              <div className="form-group">
                <label className="form-label">
                  Distancia borde - centro banda (mm)
                  {(perfil.centrado || perfil.extremos) && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>- calculada</span>}
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={perfil.distanciaBordeCentro}
                  readOnly={perfil.centrado}
                  style={perfil.centrado ? { background: '#f5f6f8', color: '#6b7280' } : {}}
                  onChange={e => !perfil.centrado && handleDistanciaBordeCentroChange(e.target.value)}
                />
              </div>
            )}
            

            {perfil.cantidad > 1 && perfil.acotado === 3 && (
              <div className="form-group">
                <label className="form-label">Distancia entre centros (mm)
                  {perfil.extremos && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>- calculada</span>}
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={perfil.distancia}
                  readOnly={perfil.extremos}
                  style={perfil.extremos ? {background: '#f5f6f8', color: '#6b7280' } : {}}
                  onChange={e => !perfil.extremos && handleDistanciaChange(e.target.value)}
                />
              </div>
            )}

            {perfil.cantidad > 1 && perfil.acotado === 1 && (
              <div className="form-group">
                <label className="form-label">Distancia borde - banda (mm)
                  {perfil.extremos && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>- calculada</span>}
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={perfil.distanciaBordeBanda}
                  readOnly={perfil.extremos}
                  style={perfil.extremos ? {background: '#f5f6f8', color: '#6b7280' } : {}}
                  onChange={e => !perfil.extremos && handleDistanciaBordeBandaChange(e.target.value)}
                />
              </div>
            )}

            {perfil.cantidad > 1 && perfil.acotado === 4 && (
              <div className="form-group">
                <label className="form-label">Distancia entre bandas (mm)
                  {perfil.extremos && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>- calculada</span>}
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={perfil.distanciaEntreBandas}
                  readOnly={perfil.extremos}
                  style={perfil.extremos ? {background: '#f5f6f8', color: '#6b7280' } : {}}
                  onChange={e => !perfil.extremos && handleDistanciaEntreBandasChange(e.target.value)}
                />
              </div>
            )}

          </div>

          {/*PREGUNTA DE LOS EXTREMOS*/}
          
          {/*perfil.cantidad > 1 && (
              <div className="form-group">
                <label className="form-label">¿Los perfiles van a los extremos?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`extremos_${label}`}
                      checked={perfil.extremos === true}
                      onChange={() => setPerfil(p => ({ ...p, extremos: true, centrado: true }))}
                    />
                    Sí
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`extremos_${label}`}
                      checked={perfil.extremos === false}
                      onChange={() => setPerfil(p => ({ ...p, extremos: false, distanciaBordeCentro: '', distancia: '', distanciaBordeBanda: '', distanciaEntreBandas: '' }))}
                    />
                    No
                  </label>
                </div>
              </div>
            )*/}

          {superaBanda && (
            <p style={{ fontSize: 13, color: '#e57373' }}>
              La distancia borde-centro supera la mitad del ancho de la banda ({anchoBanda / 2} mm)
            </p>
          )}

          {distanciaIncompatible && (
            <p style={{ fontSize: 13, color: '#e57373' }}>
              La distancia entre centros seleccionada es incompatible: no puede ser superior a {anchoBanda - anchoPerfil} mm
            </p>
          )}

          {perfil.codigo && !anchoBanda && (
            <p style={{ fontSize: 13, color: '#e57373' }}>
              No se encontró el ancho de la banda, asegúrate de haberlo introducido en el paso anterior
            </p>
          )}
        </div>
      )}
    </div>
  )
}

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
    distanciaBordeBanda: '',
    distanciaEntreBandas: '',
    centrado: false,
    extremos: false,
    tipo: '',
    color: '',
    acotado: '',
  })
  const [superior, setSuperior] = useState({
    activo: false,
    codigo: '',
    cantidad: 1,
    distancia: '',
    distanciaBordeCentro: '',
    distanciaBordeBanda: '',
    distanciaEntreBandas: '',
    centrado: false,
    extremos: false,
    tipo: '',
    color: '',
    acotado: '',
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
    if (inferior.extremos) return

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
    if (superior.extremos) return

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

    /*
    if (distanciaIncompatible || distanciaExcede || superaBanda) {
      return alert('Revisa las alertas de configuración, hay parámetros incompatibles')
    }
      */
    
    if (superior.activo && !superior.codigo) {
      return alert('Debes seleccionar un código para el perfil longitudinal superior')
    }

    if (inferior.activo && !inferior.codigo) {
      return alert('Debes seleccionar un código para el perfil longitudinal inferior')
    }

    const ruta = siguienteRuta(state.seleccion, 'perfil-longitudinal')
    navigate(ruta, {
      state: {
        ...state,
        perfilL: {
          inferior,
          superior,
          comentarios,
          tipoPerfilSuperior: superior.tipo,
          tipoPerfilInferior: inferior.tipo,
          colorPerfilSuperior: superior.color,
          colorPerfilInferior: inferior.color,
          acotacionSuperior: superior.acotado,
          acotacionInferior: inferior.acotado,
        }
      }
    })
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
            <BloquePerfilL
              label="Perfil longitudinal en cobertura inferior"
              perfil={inferior}
              setPerfil={setInferior}
              perfiles={perfiles}
              anchoBanda={anchoBanda}
            />
            <BloquePerfilL
              label="Perfil longitudinal en cobertura superior"
              perfil={superior}
              setPerfil={setSuperior}
              perfiles={perfiles}
              anchoBanda={anchoBanda}
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

        

        <div className="config-side-panel">
          <div className="config-side-panel-PL">

          {superior.activo && (
            <div className="config-side-sketch">
              {superior.acotado !== 6 && (
                <p className="config-side-sketch-title">Cobertura superior</p>
              )}

              {superior.acotado === 6 && (
                <p className="config-side-sketch-title">Cobertura superior - EXTREMOS</p>
              )}

              <div className="config-side-img-wrapper">
                <img
                  src={
                    superior.acotado === 6
                      ? '/images/sketch-longitud-CS-extremos.svg'
                      : superior.cantidad > 2
                        ? '/images/sketch-longitud-CS-3.svg'
                        : superior.cantidad > 1
                          ? '/images/sketch-longitud-CS-2.svg'
                          : '/images/sketch-longitud-CS-1.svg'
                      
                  }
                  alt="Esquema perfil longitudinal superior"
                  className="config-side-img"
                />

                {superior.cantidad === 1 && (
                  <span className="config-banda-label config-banda-borde-centro-1">
                    {superior.distanciaBordeCentro || '—'} mm
                  </span>
                )}

                {(superior.cantidad > 1 && superior.acotado !== 6 && superior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-borde-centro-2 ${esCotaActiva(superior.acotado, 'distanciaBordeCentro') ? 'cota-activa' : ''}`}>
                    {superior.distanciaBordeCentro || '—'} mm
                  </span>
                )}

                {(superior.cantidad > 1 && superior.acotado !== 6 && superior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-distancia-centros ${esCotaActiva(superior.acotado, 'distancia') ? 'cota-activa' : ''} `}>
                    {superior.distancia || '—'} mm
                  </span>
                )}

                {(superior.cantidad > 1 && superior.acotado !== 6 && superior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-borde-banda ${esCotaActiva(superior.acotado, 'distanciaBordeBanda') ? 'cota-activa' : ''}`}>
                    {superior.distanciaBordeBanda || '—'} mm
                  </span>
                )}

                {(superior.cantidad > 1 && superior.acotado !== 6 && superior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-entre-bandas ${esCotaActiva(superior.acotado, 'distanciaEntreBandas') ? 'cota-activa' : ''}`}>
                    {superior.distanciaEntreBandas || '—'} mm
                  </span>
                )}

              </div>
            </div>
          )}

          {inferior.activo && (
            <div className="config-side-sketch">

              {inferior.acotado !== 6 && (
                <p className="config-side-sketch-title">Cobertura inferior</p>
              )}

              {inferior.acotado === 6 && (
                <p className="config-side-sketch-title">Cobertura inferior - EXTREMOS</p>
              )}
              
              <div className="config-side-img-wrapper">
                <img
                  src={
                    inferior.acotado === 6
                      ? '/images/sketch-longitud-CS-extremos.svg'
                      : inferior.cantidad > 2
                        ? '/images/sketch-longitud-CS-3.svg'
                        : inferior.cantidad > 1
                          ? '/images/sketch-longitud-CS-2.svg'
                          : '/images/sketch-longitud-CS-1.svg'
                  }
                  alt="Esquema perfil longitudinal inferior"
                  className="config-side-img"
                />

                {inferior.cantidad === 1 && (
                  <span className="config-banda-label config-banda-borde-centro-1">
                    {inferior.distanciaBordeCentro || '—'} mm
                  </span>
                )}

                {(inferior.cantidad > 1 && inferior.acotado !== 6 && inferior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-borde-centro-2 ${esCotaActiva(inferior.acotado, 'distanciaBordeCentro') ? 'cota-activa' : ''}`}>
                    {inferior.distanciaBordeCentro || '—'} mm
                  </span>
                )}

                {(inferior.cantidad > 1 && inferior.acotado !== 6 && inferior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-distancia-centros ${esCotaActiva(inferior.acotado, 'distancia') ? 'cota-activa' : ''} `}>
                    {inferior.distancia || '—'} mm
                  </span>
                )}

                {(inferior.cantidad > 1 && inferior.acotado !== 6 && inferior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-borde-banda ${esCotaActiva(inferior.acotado, 'distanciaBordeBanda') ? 'cota-activa' : ''}`}>
                    {inferior.distanciaBordeBanda || '—'} mm
                  </span>
                )}

                {(inferior.cantidad > 1 && inferior.acotado !== 6 && inferior.acotado !== 5) && (
                  <span className={`config-banda-label config-banda-entre-bandas ${esCotaActiva(inferior.acotado, 'distanciaEntreBandas') ? 'cota-activa' : ''}`}>
                    {inferior.distanciaEntreBandas || '—'} mm
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      </div>
    </div>
  )
}

export default PerfilLConfigView
