import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './assets/App.jsx'
import '../public/output.css'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
