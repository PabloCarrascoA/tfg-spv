import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

function BandaView() {

  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')

  // el estado inicial marca como seleccionado banda y empalme que es obligatorio
  const [seleccion, setSeleccion] = useState(
    COMPONENTES
      .filter(c => c.obligatorio)
      .map(c => c.id)
  )

  function handleToggle(id) {
    setSeleccion(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)   // lo quita si ya estaba
        : [...prev, id]                 // lo añade si no estaba
    )
  }

  function handleContinuar() {
    // pasamos la selección a la siguiente vista con navigate
    navigate('/banda/configurar/banda', { state: { seleccion } })
  }

  return (
    <div className="banda-view">
      <h2 className="content-title">Panel de Configuración</h2>
      <p className="content-subtitle">Cálculo del presupuesto</p>

      <div className="selector-card">
        <p className="selector-label">Introduzca el nombre del cliente</p>
        <input type="text" className="form-input" placeholder="nombre"
               value={nombre} onChange={e => setNombre(e.target.value)} />
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