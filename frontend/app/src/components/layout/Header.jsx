import { NavLink } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiSettings, FiUpload, FiDownload, FiPackage} from 'react-icons/fi'

function Header() {
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
          <span className="nav-icon"><FiShoppingCart /></span>
          
        </NavLink>
      </div>
      

    </header>
  )
}

export default Header