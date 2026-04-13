import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomeView from './pages/home/HomeView'
import BandaView from './pages/bandas/BandaView'


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/banda" element={<BandaView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App