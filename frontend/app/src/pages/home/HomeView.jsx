import MenuCard from '../../components/ui/MenuCard'
import { FiSettings, FiShoppingCart, FiUpload, FiDownload, FiPackage} from 'react-icons/fi'

const cards = [
  { title: 'Configurar pedido',   description: 'Configuración de cintas personalizadas', to: '/banda', icon: <FiPackage /> },
  { title: 'Pedidos realizados',  description: 'Ver historial de pedidos realizados',     to: '/pedidos', icon: <FiShoppingCart /> },
  { title: 'Importar datos',      description: 'Importar datos de productos',             to: '/importer', icon: <FiUpload /> },
  { title: 'Exportar datos',      description: 'Exportar datos de pedidos',               to: '/exporter', icon: <FiDownload /> },
]

function HomeView() {
  return (
    <div className="home-view">
      <h2 className="content-title">Panel de administración</h2>
      <p className="content-subtitle">Sistema de gestión para cintas de transporte</p>
      <div className="cards-grid">
        {cards.map(card => (
          <MenuCard key={card.to} {...card} />
        ))}
      </div>
    </div>
  )
}

export default HomeView