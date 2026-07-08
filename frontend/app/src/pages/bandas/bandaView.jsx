import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes } from '../../services/api'

const COMPONENTES = [
  {
    id: 'banda',
    titulo: 'Banda cortada y empalme',
    descripcion: 'Cinta transportadora principal',
    imagen: '/images/banda.png',
    obligatorio: true,
  },
  {
    id: 'perfil-longitudinal',
    titulo: 'Perfil longitudinal',
    descripcion: 'Perfiles verticales guía para la cinta',
    imagen: '/images/perfil-longitudinal.png',
    obligatorio: false,
  },
  {
    id: 'perfil-transversal',
    titulo: 'Perfil transversal',
    descripcion: 'Perfiles horizontales guía para la cinta',
    imagen: '/images/perfil-transversal.png',
    obligatorio: false,
  },
  {
    id: 'runer',
    titulo: 'Runer',
    descripcion: 'Rodillos de soporte',
    imagen: '/images/runer.png',
    obligatorio: false,
  },
  {
    id: 'perforaciones',
    titulo: 'Perforaciones',
    descripcion: 'Perforaciones personalizadas',
    imagen: '/images/perforaciones.png',
    obligatorio: false,
  },
  {
    id: 'ondas',
    titulo: 'Ondas',
    descripcion: 'Perfiles ondulados',
    imagen: '/images/ondas.png',
    obligatorio: false,
  },
]

// Componente para el nombre del cliente

function AutocompleteCliente({ cliente, onSeleccionar }) {

  const [clientes, setClientes] = useState([])
  const [texto, setTexto] = useState("")
  const [sugerencias, setSugerencias] = useState([])
  const [abierto, setAbierto] = useState(false)

  const ref = useRef(null)

  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
      }
    }

    document.addEventListener("mousedown", handleClickFuera)

    return () =>
      document.removeEventListener("mousedown", handleClickFuera)

  }, [])

  useEffect(() => {
    if (cliente) {
      setTexto(cliente.nombre)
    }
  }, [cliente])

  function handleInput(e) {

    const value = e.target.value

    setTexto(value)

    onSeleccionar(null)

    if (!value) {
      setSugerencias([])
      setAbierto(false)
      return
    }

    const filtrados = clientes.filter(c =>
      c.nombre.toLowerCase().includes(value.toLowerCase())
    )

    setSugerencias(filtrados)
    setAbierto(filtrados.length > 0)
  }

  function handleSeleccion(cliente) {

    setTexto(cliente.nombre)

    onSeleccionar(cliente)

    setSugerencias([])

    setAbierto(false)
  }

  return (
    <div className="autocomplete-wrapper" ref={ref}>

      <input
        className="form-input"
        type="text"
        placeholder="Nombre del cliente (opcional)"
        value={texto}
        onChange={handleInput}
        onFocus={() => sugerencias.length && setAbierto(true)}
      />

      {abierto && (

        <ul className="autocomplete-lista">

          {sugerencias.map(cliente => (

            <li
              key={cliente.id}
              className="autocomplete-item"
              onMouseDown={() => handleSeleccion(cliente)}
            >
              {cliente.nombre}
            </li>

          ))}

        </ul>

      )}

    </div>
  )
}

function BandaView() {

  const navigate = useNavigate()

  const [cliente, setCliente] = useState(null)

  // el estado inicial marca como seleccionado banda y empalme que es obligatorio
  const [seleccion, setSeleccion] = useState(
    COMPONENTES
      .filter(c => c.obligatorio)
      .map(c => c.id)
  )

  function handleToggle(id) {
    setSeleccion(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)   
        : [...prev, id]                 
    )
  }

  function handleContinuar() {
  console.log('Continuar con la configuración. Selección:', seleccion, 'Cliente:', cliente)
  navigate('/banda/configurar/banda', { 
    state: { 
      seleccion,
      cliente
    } 
  })
}

  return (
    <div className="banda-view">
      <h2 className="content-title">Panel de Configuración</h2>
      <p className="content-subtitle">Cálculo del presupuesto</p>

      <div className="selector-card">
        <p className="selector-label">Introduzca el nombre del cliente</p>
        <AutocompleteCliente cliente={cliente} onSeleccionar={setCliente} />
      </div>

      <div className="selector-card">
        <p className="selector-label">Seleccione los componentes del pedido</p>

        <div className="componentes-lista">
          {COMPONENTES.map(comp => {
            const seleccionado = seleccion.includes(comp.id)
            return (
              <div
                key={comp.id}
                className={`componente-item ${seleccionado ? 'seleccionado' : ''}`}
                onClick={() => !comp.obligatorio && handleToggle(comp.id)}
              >
                <div className="componente-header">
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    disabled={comp.obligatorio}
                    onChange={() => !comp.obligatorio && handleToggle(comp.id)}
                    className="componente-checkbox"
                  />
                  <div>
                    <h3 className="componente-titulo">{comp.titulo}</h3>
                    <p className="componente-descripcion">{comp.descripcion}</p>
                  </div>
                </div>
                <img
                  src={comp.imagen}
                  alt={comp.titulo}
                  className="componente-imagen"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="banda-footer">
        <button
          className="btn-continuar"
          onClick={handleContinuar}
        >
          Continuar con la configuración
        </button>
      </div>
    </div>
  )
}

export default BandaView