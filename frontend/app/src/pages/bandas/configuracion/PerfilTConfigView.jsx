import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { siguienteRuta, infoPaso } from '../BandaWizard'
import { getPerfilesTransversales } from '../../../services/api'
import { getPerfilesTransversalesTresbolillo } from '../../../services/api'
import AutocompleteSelect from '../../../components/common/AutocompleteSelect'

const COLORES = [
  { value: 'NEGRO', label: 'Negro' },
  { value: 'BLANCO', label: 'Blanco' },
  { value: 'AZUL', label: 'Azul' },
  { value: 'VERDE', label: 'Verde'}
]

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
  const [centrado, setCentrado]         = useState(true)
  const [ancho1, setAncho1]             = useState('')
  const [ancho2, setAncho2]             = useState('')

  // TRESBOLILLO -> 2 HILERAS DE MOMENTO
  const [tresbolillo, setTresbolillo]   = useState(false)
  const [hilerasT, setHilerasT]         = useState(1)

  const [codigoPerfilTH1, setCodigoPerfilTH1] = useState('')
  const [anchoPerfH1, setAnchoPerfH1]   = useState('')
  const [pasoH1, setPasoH1]             = useState('')
  const [margenIzqH1, setMargenIzqH1]   = useState('')
  const [margenDerH1, setMargenDerH1]   = useState('')
  const [nPerfilesH1, setNPerfilesH1] = useState(1)
  const [tipoPerfilTH1, setTipoPerfilTH1] = useState('')
  const [colorH1, setColorH1] = useState('')


  const [codigoPerfilTH2, setCodigoPerfilTH2] = useState('')
  const [anchoPerfH2, setAnchoPerfH2]   = useState('')
  const [pasoH2, setPasoH2]             = useState('')
  const [margenIzqH2, setMargenIzqH2]   = useState('')
  const [margenDerH2, setMargenDerH2]   = useState('')
  const [nPerfilesH2, setNPerfilesH2] = useState(1)
  const [tipoPerfilTH2, setTipoPerfilTH2] = useState('')
  const [colorH2, setColorH2] = useState('')


  const [comentarios, setComentarios]   = useState('')

  const [color, setColor] = useState('')
  const [tipoPerfilT, setTipoPerfil] = useState('')  

  // --- datos de la API ---

  const [perfilesT, setPerfilesT] = useState([])

  function handleCodigoPerfilChange(e) {
    const nuevoCodigo = e.target.value
    const perfilSeleccionado = perfilesT.find(perfil => perfil.codigo === nuevoCodigo)

    setCodigoPerfil(nuevoCodigo)
    setColor(perfilSeleccionado?.color ?? '')
    setTipoPerfil(perfilSeleccionado?.tipo ?? '')
    console.log('Color del perfil seleccionado:', perfilSeleccionado?.color)
    console.log('Tipo del perfil seleccionado:', perfilSeleccionado?.tipo)
  }

  // CARGAR PERFILEST DE LA BASE DE DATOS

  useEffect(() => {
    getPerfilesTransversales()
      .then(data => setPerfilesT(data))
      .catch(err => console.error('Error cargando perfiles transversales:', err))
  }, [])


  const [perfilesTTresbolillo, setPerfilesTTresbolillo] = useState([])

  useEffect(() => {
    getPerfilesTransversalesTresbolillo()
      .then(data => setPerfilesTTresbolillo(data))
      .catch(err => console.error('Error cargando perfiles transversales tresbolillo:', err))
  }, [])

  // ---------------- MANEJO DE PERRFILES IDÉNTICOS Y NO IDÉNTICOS (PERFILET NORMAL) ----- 

  // cuando es idéntico el usuario controla luz, se calculan ancho1 y ancho2

    useEffect(() => {
    if (!identico) return
    if (!ancho || !luz) return

    const anchoCalculado = (parseFloat(ancho) - (parseFloat(luz) * (hileras - 1))) / hileras
    if (anchoCalculado > 0) {
        setAncho1(String(anchoCalculado.toFixed(2)))
        setAncho2(String(anchoCalculado.toFixed(2)))
    }
    }, [luz, ancho, identico])

    // cuando no es idéntico el usuario controla ancho1 y ancho2, se calcula luz

    useEffect(() => {
    if (identico) return
    if (centrado !== true) return
    if (!ancho || !ancho1 || !ancho2) return

    const luzCalculada = parseFloat(ancho) - parseFloat(ancho1) - parseFloat(ancho2)
    if (luzCalculada >= 0) {
        setLuz(String(luzCalculada))
    }
    }, [ancho1, ancho2, ancho, identico, centrado])

    // -----------------------------------------------------------------------------------

    const editando = useRef(null)
    const anchoBanda = parseFloat(state.banda?.ancho) || null

    useEffect(() => {
      if (editando.current === 'margen') return
      if (!anchoBanda || !ancho) return

      const margenCalculado = (anchoBanda - parseFloat(ancho)) / 2
      // if (margenCalculado >= 0) {
        editando.current = 'ancho'
        setMargen(String(margenCalculado))
        setTimeout(() => { editando.current = null }, 0)
      // }
    }, [anchoBanda, ancho])

    useEffect(() => {
      if (editando.current === 'ancho') return
      if (!anchoBanda || !margen) return

      const anchoCalculado = (anchoBanda - 2 * parseFloat(margen))

      // if (anchoCalculado >= 0) {
        editando.current = 'margen'
        setAncho(String(anchoCalculado))
        setTimeout(() => {editando.current = null}, 0)
      // }
    }, [anchoBanda, margen])

    useEffect(() => {
      const largo = parseFloat(state.banda?.longitud)
      if (!largo || cantidad <= 1) {
        setDistancia('')  // reset
        return
      }

      const paso = largo / cantidad
      setDistancia(paso.toFixed(2))  
    }, [cantidad, state.banda?.longitud])

    // RESET DE LOS ANCHOS Y LA LUZ SI SE CAMBIA EL Nº DE HILERAS (PERFILT NORMAL) 

    useEffect(() => {
      if (hileras > 2) {
        setIdentico(true)
      }

      setAncho1('')
      setAncho2('')
      setLuz('')

    }, [hileras])

  
    useEffect(() => {
      setCentrado(null)
    }, [hileras, identico])

    // RESET DE LOS VALORES GLOBALES SI SE CAMBIA DE TRESBOLILLO A NORMAL

    useEffect(() => {
      if (tresbolillo === true) {
        setAncho('')
        setCantidad(1)
        setMargen('')
        setHileras(1)
        setIdentico(true)
        setCentrado(null)
        setAncho1('')
        setAncho2('')
        setLuz('')
      } else if (tresbolillo === false) {
        setCodigoPerfilTH1('')
        setTipoPerfilTH1('')
        setColorH1('')
        setAnchoPerfH1('')
        setPasoH1('')
        setMargenIzqH1('')
        setMargenDerH1('')
        setCodigoPerfilTH2('')
        setTipoPerfilTH2('')
        setColorH2('')
        setAnchoPerfH2('')
        setPasoH2('')
        setMargenIzqH2('')
        setMargenDerH2('')
      }
    }, [tresbolillo])

    // RESET DE LOS VALORES SI SE CAMBIA EL Nº DE HILERAS (PERFILT TRESBOLILLO)

    useEffect(() => {
      if (hilerasT === 1) {
        setNPerfilesH2(1)
        setCodigoPerfilTH2('')
        setTipoPerfilTH2('')
        setColorH2('')
        setAnchoPerfH2('')
        setPasoH2('')
        setMargenIzqH2('')
        setMargenDerH2('')
      }
    }, [hilerasT])

    // CÁLCULO AUTOMÁTICO DE LOS PASOS ENTRE PERFILES (PERFILT TRESBOLILLO) 

    useEffect(() => {
      const largo = parseFloat(state.banda?.longitud)
      if (!largo || nPerfilesH1 <= 1) {
        setPasoH1('')
        return
      }
      setPasoH1((largo / nPerfilesH1).toFixed(2))
    }, [nPerfilesH1, state.banda?.longitud])

    useEffect(() => {
      const largo = parseFloat(state.banda?.longitud)
      if (!largo || nPerfilesH2 <= 1) {
        setPasoH2('')
        return
      }
      setPasoH2((largo / nPerfilesH2).toFixed(2))
    }, [nPerfilesH2, state.banda?.longitud])

    // CÁLCULO AUTOMÁTICO DE LOS MÁRGENES LATERALES SEGÚN EL ANCHO (PERFILT TRESBOLILLO)

    function calcularMargenOpuesto(valorEditado, anchoPerfil) {
      const v = parseFloat(valorEditado)
      const ap = parseFloat(anchoPerfil)

      if (Number.isNaN(v) || Number.isNaN(ap) || !anchoBanda) return ''

      const opuesto = anchoBanda - ap - v
      return opuesto >= 0 ? String(opuesto) : ''
    }

    function handleMargenIzqH1Change(value) {
      setMargenIzqH1(value)
      setMargenDerH1(calcularMargenOpuesto(value, anchoPerfH1))
    }

    function handleMargenDerH1Change(value) {
      setMargenDerH1(value)
      setMargenIzqH1(calcularMargenOpuesto(value, anchoPerfH1))
    }

    function handleMargenIzqH2Change(value) {
      setMargenIzqH2(value)
      setMargenDerH2(calcularMargenOpuesto(value, anchoPerfH2))
    }

    function handleMargenDerH2Change(value) {
      setMargenDerH2(value)
      setMargenIzqH2(calcularMargenOpuesto(value, anchoPerfH2))
    }


    // RESET DE MÁRGENES AL CAMBIAR EL ANCHO DEL PERFIL (PERFILT TRESBOLILLO)

    useEffect(() => {
      setMargenIzqH1('')
      setMargenDerH1('')
    }, [anchoPerfH1])

    useEffect(() => {
      setMargenIzqH2('')
      setMargenDerH2('')
    }, [anchoPerfH2])



  function handleSiguiente() {

    if (!codigoPerfil && tresbolillo === false) {
      return alert('Asegúrese de haber seleccionado un perfil')
    }

    if (!color && tresbolillo === false) {
      return alert('¡Acuérdese de elegir un color para el perfil!')
    }

    if (tresbolillo === true && hilerasT === 1 && !codigoPerfilTH1) {
      return alert('Asegúrese de haber seleccionado un perfil para la Hilera 1')
    }

    if (tresbolillo === true && hilerasT > 1 && (!codigoPerfilTH1 || !codigoPerfilTH2)) {
      return alert('Asegúrese de haber seleccionado un perfil para la Hilera 1 y la Hilera 2')
    }

    if (tresbolillo === true && hilerasT === 1 && !colorH1) {
      return alert('Asegúrese de haber seleccionado un color para los perfiles de la Hilera 1')
    }

    if (tresbolillo === true && hilerasT > 1 && (!colorH1 || !colorH2)) {
      return alert('Asegúrese de haber seleccionado un color para los perfiles de la Hilera 1 y la Hilera 2')
    }


    // setDistancia(distancia.toFixed(2))

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
            centrado,
            ancho1,
            ancho2,
            luz,
            tresbolillo,
            codigoPerfilTH1,
            tipoPerfilTH1,
            colorH1,
            codigoPerfilTH2,
            tipoPerfilTH2,
            colorH2,
            hilerasT,
            anchoPerfH1,
            pasoH1,
            margenIzqH1,
            margenDerH1,
            nPerfilesH1,
            anchoPerfH2,
            pasoH2,
            margenIzqH2,
            margenDerH2,
            nPerfilesH2,
            comentarios,
            color,
            tipoPerfilT
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
      <div className="config-row config-panel-pefilesT">

        <div className="config-form-panel">
          <h2 className="content-title">Panel de Configuración</h2>
          <p className="content-subtitle">Paso {actual} de {total}</p>
          <p className="config-step-label">{actual}. Perfil transversal</p>

          <div className="config-form">

          {/* 
          {!color && (
            <p style={{ fontSize: 13, color: '#e57373' }}>
              Selecciona primero un color para continuar con la configuración.
            </p>
          )}
          
          */}
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">¿Los perfiles van al tresbolillo?</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="tresbolillo" checked={tresbolillo === true}
                          onChange={() => setTresbolillo(true)} />
                        Sí
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="tresbolillo" checked={tresbolillo === false}
                          onChange={() => setTresbolillo(false)} />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {tresbolillo === false && (
                  <>

                    <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Código de perfil</label>
                          <AutocompleteSelect
                            opciones = {perfilesT}
                            valorSeleccionado = {perfilesT.find(p => p.codigo === codigoPerfil) ?? null}
                            onSeleccionar = {perfil => {
                              setCodigoPerfil(perfil?.codigo ?? '')
                              setTipoPerfil(perfil?.tipo ?? '')
                            }}
                            getLabel = {perfil => `${perfil.tipo}`}
                            getKey = {perfil => perfil.codigo}
                            placeholder = "Busqueda por código o tipo de perfil"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Número de perfiles</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="1"
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                          />
                          {/* VERSIÓN CON CONTADOR
                            <div className="counter">
                            <button className="counter-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                            <span className="counter-value">{cantidad}</span>
                            <button className="counter-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                          </div>
                          */}
                          
                        </div>

                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Seleccione el color del perfil</label>
                            <select className="form-select" 
                                    value={color}
                                    onChange={e => setColor(e.target.value)}>
                              <option value="">- Seleccione un color -</option>
                              {COLORES?.map(color => (
                                <option key={color.value} value={color.value}>{color.label}</option>
                              ))}
                            </select>

                          
                      </div>
                    </div>

                    {cantidad > 1 && (
                      <div className="form-group">
                        <label className="form-label">Paso entre perfiles (mm)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={distancia}
                          readOnly
                          style={{ background: '#f5f6f8', color: '#6b7280' }}
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

                    {parseFloat(ancho) > 1600 && (
                      <p style={{ fontSize: 13, color: '#e57373' }}>
                        El ancho de perfil no puede superar los 1600 mm
                      </p>
                    )}

                    {parseFloat(ancho) > anchoBanda && (
                      <p style={{ fontSize: 13, color: '#e57373' }}>
                        El ancho de perfil no puede ser mayor que el ancho de la banda ({anchoBanda} mm)
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

                    {hileras > 2 && (
                      <p style={{ fontSize: 13, color: '#4a6f8a', textDecoration: 'underline' }}>
                        Para más de 2 hileras se asume que los perfiles resultantes son indénticos.
                      </p>
                    )}

                    {hileras == 2 && ancho && (
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
                    )}

                    {hileras > 1 && ancho && identico && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Luz interior (mm)</label>
                          <input type="number" className="form-input" placeholder="0"
                            value={luz} onChange={e => setLuz(e.target.value)} />
                        </div>
                        {luz && (parseFloat(luz) < parseFloat(ancho)) && (luz < (ancho / (hileras - 1))) && (
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Ancho perfil {hileras < 3 && <span>1</span>} (mm) — calculado</label>
                              <input type="number" className="form-input" value={ancho1} readOnly
                                style={{ background: '#f5f6f8', color: '#6b7280' }} />
                            </div>
                            {hileras < 3 && (
                              <div className="form-group">
                                <label className="form-label">Ancho perfil 2 (mm) — calculado</label>
                                <input type="number" className="form-input" value={ancho2} readOnly
                                  style={{ background: '#f5f6f8', color: '#6b7280' }} />
                              </div>
                            )}
                          </div>
                        )}

                        {parseFloat(luz) >= parseFloat(ancho) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho de la luz excede o es igual al ancho total del perfil
                          </p>
                        )}

                        {luz >= (ancho / (hileras - 1)) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho de la luz introducido es demasiado grande, no es compatible con el número actual de hileras
                          </p>
                        )}
                      </>
                    )}

                    {hileras > 1 && ancho && !identico && (
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

                        {((parseFloat(ancho1) > parseFloat(ancho)) || (parseFloat(ancho2) > parseFloat(ancho))) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho de los perfiles excede el ancho total del perfil
                          </p>
                        )}

                        {((parseFloat(ancho1) + parseFloat(ancho2)) > (parseFloat(anchoBanda) - 2 * (parseFloat(margen)))) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            La suma del ancho de los perfiles excede el ancho total del perfil más sus márgenes laterales.
                          </p>
                        )}

                        {((parseFloat(ancho1) + parseFloat(ancho2)) === parseFloat(ancho)) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            La suma del ancho de los perfiles no da margen para añadir la interrupción.
                          </p>
                        )}

                        {ancho1 && ancho2 &&
                          (parseFloat(ancho1) < parseFloat(ancho)) &&
                          (parseFloat(ancho2) < parseFloat(ancho)) &&
                          ((parseFloat(ancho1) + parseFloat(ancho2)) < parseFloat(ancho)) && (
                          <>
                            <div className="form-row">
                              <div className="form-group">
                                <label className="form-label">¿Los perfiles van centrados?</label>
                                <div className="radio-group">
                                  <label className="radio-label">
                                    <input type="radio" name="centrado" checked={centrado === true}
                                      onChange={() => setCentrado(true)} />
                                    Sí
                                  </label>
                                  <label className="radio-label">
                                    <input type="radio" name="centrado" checked={centrado === false}
                                      onChange={() => { setCentrado(false); setLuz('') }} />
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>

                            {centrado === true && (parseFloat(luz) < parseFloat(ancho)) && (
                              <div className="form-group">
                                <label className="form-label">Luz interior (mm) — calculada</label>
                                <input type="number" className="form-input" value={luz} readOnly
                                  style={{ background: '#f5f6f8', color: '#6b7280' }} />
                              </div>
                            )}

                            {centrado === false && (
                              <div className="form-group">
                                <label className="form-label">Luz interior (mm)</label>
                                <input type="number" className="form-input" placeholder="0"
                                  value={luz} onChange={e => setLuz(e.target.value)} />
                              </div>
                            )}

                            {(parseFloat(luz) > (parseFloat(anchoBanda) - 2 * parseFloat(margen) - parseFloat(ancho1) - parseFloat(ancho2))) && (
                              <p style={{ fontSize: 13, color: '#e57373' }}>
                                La luz introducida es mayor a la suma de los perfiles y márgenes.
                              </p>
                            )}

                            {(parseFloat(luz) > parseFloat(ancho)) && (
                              <p style={{ fontSize: 13, color: '#e57373' }}>
                                La luz introducida es mayor al ancho total de la banda.
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
                  </>
                )}

                {tresbolillo === true && (
                  <>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Número de hileras</label>
                        <div className="counter">
                          <button className="counter-btn" onClick={() => setHilerasT(h => Math.max(1, h - 1))}>−</button>
                          <span className="counter-value">{hilerasT}</span>
                          <button className="counter-btn" onClick={() => setHilerasT(h => Math.min(2, h + 1))}>+</button>
                        </div>
                      </div>
                    </div>

                    {hilerasT >= 1 && (
                      <>
                        <p className="config-step-label-t">Hilera 1</p>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Código de perfil</label>
                            <AutocompleteSelect
                              opciones={perfilesTTresbolillo}
                              valorSeleccionado={perfilesTTresbolillo.find(p => p.codigo === codigoPerfilTH1) ?? null}
                              onSeleccionar={perfil => {
                                setCodigoPerfilTH1(perfil?.codigo ?? '')
                                setTipoPerfilTH1(perfil?.tipo ?? '')
                              }}
                              getLabel={perfil => `${perfil.tipo}`}
                              getKey={perfil => perfil.codigo}
                              placeholder="Busqueda por código o tipo de perfil"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Seleccione el color del perfil</label>
                            <select className="form-select"
                                    value={colorH1}
                                    onChange={e => setColorH1(e.target.value)}>
                              <option value="">- Seleccione un color -</option>
                              {COLORES?.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Número de perfiles</label>
                            <div className="counter">
                              <button className="counter-btn" onClick={() => setNPerfilesH1(n => Math.max(1, n - 1))}>−</button>
                              <span className="counter-value">{nPerfilesH1}</span>
                              <button className="counter-btn" onClick={() => setNPerfilesH1(n => n + 1)}>+</button>
                            </div>
                          </div>
                        </div>

                        {nPerfilesH1 > 1 && (
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Paso entre perfiles (mm)</label>
                              <input
                                type="number"
                                className="form-input"
                                value={pasoH1}
                                readOnly
                                style={{ background: '#f5f6f8', color: '#6b7280' }}
                              />
                            </div>
                          </div>
                          
                        )}

                        <div className="form-row">
                          <div className="form-group">
                              <label className="form-label">Ancho del perfil (mm)</label>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                value={anchoPerfH1}
                                onChange={e => setAnchoPerfH1(e.target.value)}
                              />
                          </div>
                        </div>

                        {parseFloat(anchoPerfH1) > parseFloat(anchoBanda) && (
                          
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho del perfil introducido excede el ancho total de la banda
                          </p>
                        )}
                        

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Margen izquierdo (mm)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0"
                              value={margenIzqH1}
                              onChange={e => handleMargenIzqH1Change(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Margen derecho (mm)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0"
                              value={margenDerH1}
                              onChange={e => handleMargenDerH1Change(e.target.value)}
                            />
                          </div>
                        </div>

                        {(
                          anchoPerfH1 !== '' && anchoBanda &&
                          (
                            (margenIzqH1 !== '' && parseFloat(anchoPerfH1) + parseFloat(margenIzqH1) > parseFloat(anchoBanda)) ||
                            (margenDerH1 !== '' && parseFloat(anchoPerfH1) + parseFloat(margenDerH1) > parseFloat(anchoBanda))
                          )
                        ) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            La suma del ancho del perfil más el margen introducido es superior al ancho total de la banda
                          </p>
                        )}

                        
                      </>
                    )}

                    {hilerasT === 2 && (
                      <>
                        <p className="config-step-label-t">Hilera 2</p>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Código de perfil</label>
                              <AutocompleteSelect
                                opciones={perfilesTTresbolillo}
                                valorSeleccionado={perfilesTTresbolillo.find(p => p.codigo === codigoPerfilTH2) ?? null}
                                onSeleccionar={perfil => {
                                  setCodigoPerfilTH2(perfil?.codigo ?? '')
                                  setTipoPerfilTH2(perfil?.tipo ?? '')
                                }}
                                getLabel={perfil => `${perfil.tipo}`}
                                getKey={perfil => perfil.codigo}
                                placeholder="Busqueda por código o tipo de perfil"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Seleccione el color del perfil</label>
                              <select className="form-select"
                                      value={colorH2}
                                      onChange={e => setColorH2(e.target.value)}>
                                <option value="">- Seleccione un color -</option>
                                {COLORES?.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Número de perfiles</label>
                            <div className="counter">
                              <button className="counter-btn" onClick={() => setNPerfilesH2(n => Math.max(1, n - 1))}>−</button>
                              <span className="counter-value">{nPerfilesH2}</span>
                              <button className="counter-btn" onClick={() => setNPerfilesH2(n => n + 1)}>+</button>
                            </div>
                          </div>
                        </div>

                        {nPerfilesH2 > 1 && (
                          <div className="form-group">
                            <label className="form-label">Paso entre perfiles (mm)</label>
                            <input
                              type="number"
                              className="form-input"
                              value={pasoH2}
                              readOnly
                              style={{ background: '#f5f6f8', color: '#6b7280' }}
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label">Ancho del perfil (mm)</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={anchoPerfH2}
                            onChange={e => setAnchoPerfH2(e.target.value)}
                          />
                        </div>

                        {parseFloat(anchoPerfH2) > parseFloat(anchoBanda) && (
                          
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            El ancho del perfil introducido excede el ancho total de la banda
                          </p>
                        )}

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Margen izquierdo (mm)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0"
                              value={margenIzqH2}
                              onChange={e => handleMargenIzqH2Change(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Margen derecho (mm)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0"
                              value={margenDerH2}
                              onChange={e => handleMargenDerH2Change(e.target.value)}
                            />
                          </div>
                        </div>

                        {(
                          anchoPerfH2 !== '' && anchoBanda &&
                          (
                            (margenIzqH2 !== '' && parseFloat(anchoPerfH2) + parseFloat(margenIzqH2) > parseFloat(anchoBanda)) ||
                            (margenDerH2 !== '' && parseFloat(anchoPerfH2) + parseFloat(margenDerH2) > parseFloat(anchoBanda))
                          )
                        ) && (
                          <p style={{ fontSize: 13, color: '#e57373' }}>
                            La suma del ancho del perfil más el margen introducido es superior al ancho total de la banda
                          </p>
                        )}

                      </>
                    )}

                 </>
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
              </>
          

          </div>

          <div className="config-footer">
            <button className="btn-atras" onClick={handleAtras}>‹ Atrás</button>
            <button className="btn-continuar" onClick={handleSiguiente}>Siguiente ›</button>
          </div>
        </div>

        <div className="config-side-panel">

          {tresbolillo === true && hilerasT > 1 ? (
            <div className="config-side-img-wrapper-perfilT config-perfilT-tresbolillo-wrapper-2">
              <img
                src="/images/sketch-perfilT-tresbolillo.svg"
                alt="Esquema de perfil transversal al tresbolillo"
                className="config-side-img"
              />
              
              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-pasoH1">
                {pasoH1 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenDerH1">
                {margenDerH1 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenIzqH1">
                {margenIzqH1|| '—'} mm
              </span>


              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-pasoH2">
                {pasoH2 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenDerH2">
                {margenDerH2 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenIzqH2">
                {margenIzqH2|| '—'} mm
              </span>

            </div>
          ) : (

          tresbolillo === true && hilerasT === 1 ? (
            <div className="config-side-img-wrapper-perfilT config-perfilT-tresbolillo-wrapper-1">
              <img
                src="/images/sketch-perfilT-tresbolillo-1.svg"
                alt="Esquema de perfil transversal al tresbolillo con una hilera"
                className="config-side-img"
              />

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-pasoH1">
                {pasoH1 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenDerH1">
                {margenDerH1 || '—'} mm
              </span>

              <span className="config-perfilT-tresbolillo-label config-perfilT-tresbolillo-margenIzqH1">
                {margenIzqH1|| '—'} mm
              </span>
            </div>

          ) : (hileras <= 1 ? (

            <div className="config-side-img-wrapper-perfilT config-perfilT1-wrapper">
              <img
                src="/images/sketch-perfilT-1.svg"
                alt="Esquema de perfil transversal"
                className="config-side-img"
              />
              <span className="config-perfilT1-label config-perfilT1-paso">
                {distancia || '—'} mm
              </span>
              <span className="config-perfilT1-label config-perfilT1-ancho">
                {ancho || '—'} mm
              </span>
              <span className="config-perfilT1-label config-perfilT1-margen">
                {margen || '—'} mm
              </span>
            </div>

          ) : (

            <div className="config-side-img-wrapper-perfilT config-perfilT2-wrapper">
              <img
                src="/images/sketch-perfilT-2.svg"
                alt="Esquema de perfil transversal con hileras"
                className="config-side-img"
              />
              <span className="config-perfilT2-label config-perfilT2-paso">
                {distancia || '—'} mm
              </span>
              <span className="config-perfilT2-label config-perfilT2-ancho">
                {ancho || '—'} mm
              </span>
              <span className="config-perfilT2-label config-perfilT2-margen">
                {margen || '—'} mm
              </span>
              <span className="config-perfilT2-label config-perfilT2-luz">
                {luz || '—'} mm
              </span>
              <span className="config-perfilT2-label config-perfilT2-ancho1">
                {ancho1 || '—'} mm
              </span>
              <span className="config-perfilT2-label config-perfilT2-ancho2">
                {ancho2 || '—'} mm
              </span>
            </div>
            
          )
        )
          )
            }

        </div>

      </div>
    </div>
  )
}

export default PerfilTConfigView
