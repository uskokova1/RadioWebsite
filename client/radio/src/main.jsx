import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import Account from './pages/Account'

import Home from './pages/Home';

import App from './App.jsx'
import BlogEditor from "./obsolete/blogEditor.jsx";
import Paragraph from "./obsolete/paragraph.jsx";


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
