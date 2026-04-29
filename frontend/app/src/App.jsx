import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

import HomeView from './pages/home/HomeView'

import BandaView from './pages/bandas/BandaView'
import BandaConfigView from './pages/bandas/configuracion/BandaConfigView'
import PerfilLConfigView from './pages/bandas/configuracion/PerfilLConfigView'
import PerfilTConfigView from './pages/bandas/configuracion/PerfilTConfigView'
import RunerConfigView from './pages/bandas/configuracion/RunerConfigView'
import PerforacionesConfigView from './pages/bandas/configuracion/PerforacionesConfigView'
import OndasConfigView from './pages/bandas/configuracion/OndasConfigView'
import ResumenView from './pages/bandas/ResumenView'

import PedidosView from './pages/pedidos/PedidosView'

import ImporterView from './pages/importer/ImporterView'

import ExporterView from './pages/exporter/ExporterView'

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
          <Route path="/banda/configurar/runer" element={< RunerConfigView/>} />
          <Route path="/banda/configurar/perforaciones" element={<PerforacionesConfigView />} />
          <Route path="/banda/configurar/ondas" element={<OndasConfigView />} />
          <Route path="/resumen" element={<ResumenView />}/>
          <Route path="/pedidos" element={<PedidosView />}/>
          <Route path="/importer" element={<ImporterView />}/>
          <Route path="/exporter" element={<ExporterView />}/>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App