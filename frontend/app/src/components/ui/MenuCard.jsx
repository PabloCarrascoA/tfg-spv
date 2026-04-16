import { Link } from 'react-router-dom'

function MenuCard({ title, description, to, icon }) {
  return (
    <Link to={to} className="menu-card">
      <div className="card-icon">{icon}</div>
      
      <div className="card-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}

export default MenuCard