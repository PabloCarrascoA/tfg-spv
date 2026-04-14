import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeView from './pages/home/HomeView'
import BandaView from './pages/bandas/BandaView'
import BandaConfigView from './pages/bandas/configuracion/BandaConfigView'
import PerfilLConfigView from './pages/bandas/configuracion/PerfilLConfigView'
import PerfilTConfigView from './pages/bandas/configuracion/PerfilTConfigView'
import ResumenView from './pages/bandas/ResumenView'



function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/banda" element={<BandaView />} />
          <Route path="/banda/configurar/banda" element={<BandaConfigView />} />
          <Route path="/banda/configurar/perfil-longitudinal" element={<PerfilLConfigView />} />
          <Route path="/banda/configurar/perfil-transversal" element={<PerfilTConfigView />} />
          <Route path="/resumen" element={<ResumenView />}/>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App