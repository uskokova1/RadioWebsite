import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BlogEditor from "./blogEditor.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BlogEditor/>

  </StrictMode>,
)
