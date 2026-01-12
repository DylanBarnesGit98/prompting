import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TechniquesLab from './TechniquesLab.jsx'
import AdvancedLab from './AdvancedLab.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/techniques" element={<TechniquesLab />} />
        <Route path="/advanced" element={<AdvancedLab />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)