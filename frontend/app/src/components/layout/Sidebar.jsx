import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Inicio' },
  { to: '/pedidos',   label: 'Pedidos realizados' },
  { to: '/banda',     label: 'Configurar pedido' },
  { to: '/importer',  label: 'Importar datos' },
  { to: '/exporter',  label: 'Exportar datos' },
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
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Sidebar