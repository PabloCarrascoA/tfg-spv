import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeView from './pages/home/HomeView'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/banda" element={<BandaView />} />
          <Route path="/banda/configurar/banda"   element={<BandaConfigView />} />
          <Route path="/banda/configurar/perfil"  element={<PerfilConfigView />} />
          <Route path="/banda/configurar/onda"    element={<OndaConfigView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App