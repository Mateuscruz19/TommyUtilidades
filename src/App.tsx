import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import VideoDownload from './pages/VideoDownload/VideoDownload'
import PdfConverter from './pages/PdfConverter/PdfConverter'
import ImageCompressor from './pages/ImageCompressor/ImageCompressor'
import QrGenerator from './pages/QrGenerator/QrGenerator'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-download" element={<VideoDownload />} />
          <Route path="/pdf-converter" element={<PdfConverter />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/qr-generator" element={<QrGenerator />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

