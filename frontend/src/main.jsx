import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Routes ,Route} from 'react-router-dom'
import IndexPage from './components/IndexPage.jsx'
import History from './components/History.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}/>
        <Route path="/login" element={<App />}/>
        <Route path="/index" element={<IndexPage/>}/>
        <Route path="/history" element={<History/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
