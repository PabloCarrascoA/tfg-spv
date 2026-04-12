import MenuCard from '../../components/ui/MenuCard'

const cards = [
  { title: 'Configurar pedido',   description: 'Configuración de cintas personalizadas', to: '/banda'    },
  { title: 'Pedidos realizados',  description: 'Ver historial de pedidos realizados',     to: '/pedidos'  },
  { title: 'Importar datos',      description: 'Importar datos de productos',             to: '/importer' },
  { title: 'Exportar datos',      description: 'Exportar datos de pedidos',               to: '/exporter' },
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