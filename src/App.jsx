import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Step1Upload from './pages/Step1Upload'
import Step2Template from './pages/Step2Template'
import Step3Generate from './pages/Step3Generate'
import Processing from './pages/Processing'
import DraftDeckEditor from './pages/DraftDeckEditor'
import SlideEditor from './pages/SlideEditor'
import VisualVariations from './pages/VisualVariations'
import ExportManagement from './pages/ExportManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<Step1Upload />} />
        <Route path="/template" element={<Step2Template />} />
        <Route path="/generate" element={<Step3Generate />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/editor" element={<DraftDeckEditor />} />
        <Route path="/slide/:index" element={<SlideEditor />} />
        <Route path="/variations/:index" element={<VisualVariations />} />
        <Route path="/export" element={<ExportManagement />} />
      </Routes>
    </Router>
  )
}

export default App

