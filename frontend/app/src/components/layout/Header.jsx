import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiSettings, FiUpload, FiDownload, FiPackage} from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getLineasCarrito } from '../../services/api'

function Header() {
  const location = useLocation()
  const [cantidadLineas, setCantidadLineas] = useState(0)

  useEffect(() => {
    const fetchLineasCarrito = async () => {
      try {
        const lineas = await getLineasCarrito()
        setCantidadLineas(lineas.length)
      } catch (err) {
        console.error('Error cargando líneas del carrito:', err)
      }
    }

    fetchLineasCarrito()

    window.addEventListener('carrito:actualizado', fetchLineasCarrito)

    return () => {
      window.removeEventListener('carrito:actualizado', fetchLineasCarrito)
    }
  }, [location.pathname])

  return (
    <header className="header">

      <div className="header-left">

        <div className="header-logo">
          <img src="/images/logoSPV.png" alt="Logo SPV" />
        </div>

        <h1 className="header-title">Sucesor de Pérez Verdú</h1>
      </div>

      <div className="header-right">
        <NavLink
          key="/carrito"
          to="/carrito"
          end
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span className="nav-icon">
            <FiShoppingCart />
            {cantidadLineas > 0 && (
              <span className="notification" role="status">{cantidadLineas}</span>
            )}
            
          </span>
          
        </NavLink>
        
      </div>
      

    </header>
  )
}

export default Header