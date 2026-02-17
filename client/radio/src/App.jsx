import './css/App.css'
import Home from './pages/Home'
import Account from './pages/Account'
import NavBar from './components/NavBar'
import {Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/Home" element={<Home />}/>
          <Route path="/Account" element={<Account />}/>
        </Routes>
      </main>
    </div>
  );
}

export default App;