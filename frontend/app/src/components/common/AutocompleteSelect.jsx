import { useState, useEffect, useRef } from 'react'

function AutocompleteSelect({
  opciones,
  valorSeleccionado,
  onSeleccionar,
  getLabel,
  getKey,
  placeholder = 'Buscar...',
}) {
  const [texto, setTexto] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [abierto, setAbierto] = useState(false)

  const ref = useRef(null)

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
      }
    }

    document.addEventListener('mousedown', handleClickFuera)

    return () =>
      document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  useEffect(() => {
    if (valorSeleccionado) {
      setTexto(getLabel(valorSeleccionado))
    } else {
      setTexto('')
    }
  }, [valorSeleccionado])

  function handleInput(e) {
    const value = e.target.value

    setTexto(value)

    onSeleccionar(null)

    if (!value) {
      setSugerencias(opciones)
      setAbierto(opciones.length > 0)
      return
    }

    const filtradas = opciones.filter(op =>
      getLabel(op).toLowerCase().includes(value.toLowerCase())
    )

    setSugerencias(filtradas)
    setAbierto(filtradas.length > 0)
  }

  function handleSeleccion(opcion) {
    setTexto(getLabel(opcion))
    onSeleccionar(opcion)
    setSugerencias([])
    setAbierto(false)
  }

  return (
    <div className="autocomplete-wrapper" ref={ref}>
      <input
        className="form-input"
        type="text"
        placeholder={placeholder}
        value={texto}
        onChange={handleInput}
        onFocus={() => {
            if (!texto) {
                setSugerencias(opciones)
                setAbierto(opciones.length > 0)
            } else if (sugerencias.length) {
                setAbierto(true)
            }
                
        }

        }
      />

      {abierto && (
        <ul className="autocomplete-lista">
          {sugerencias.map(opcion => (
            <li
              key={getKey(opcion)}
              className="autocomplete-item"
              onMouseDown={() => handleSeleccion(opcion)}
            >
              {getLabel(opcion)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AutocompleteSelect