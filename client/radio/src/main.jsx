import { createRoot } from 'react-dom/client'
import './index.css'
import App from '../public/App.jsx'
import { BrowserRouter } from "react-router-dom";
import {AppContextProvider} from "./context/AppContext.jsx";
import { WindowManagerProvider } from '@/context/WindowManager.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <WindowManagerProvider>
      <AppContextProvider>
          <App/>
      </AppContextProvider>
      </WindowManagerProvider>
  </BrowserRouter>,
)
