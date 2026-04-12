import Header from './Header'
import Sidebar from './Sidebar'

function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout