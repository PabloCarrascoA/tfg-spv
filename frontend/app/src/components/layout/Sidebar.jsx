import { NavLink } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiSettings, FiUpload, FiDownload } from 'react-icons/fi'


const links = [
  { to: '/',          label: 'Inicio', icon: <FiHome /> },
  { to: '/pedidos',   label: 'Pedidos realizados', icon: <FiShoppingCart /> },
  { to: '/banda',     label: 'Configurar pedido', icon: <FiSettings /> },
  { to: '/importer',  label: 'Importar datos', icon: <FiUpload /> },
  { to: '/exporter',  label: 'Exportar datos', icon: <FiDownload /> },
]

function Sidebar() {
  return (
    <nav className="sidebar">
      <p className="sidebar-title">Cintas Transportadoras</p>
      <hr className="sidebar-divider" />
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Sidebar