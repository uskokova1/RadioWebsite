
import Home from './pages/Home'
import Account from './pages/Account'
import NavBar from './components/NavBar'
import Blog from './pages/Blog'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
    return (
        <div>
            <NavBar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/Home" replace />} />
                    <Route path="/Home" element={<Home />} />
                    <Route path="/Account" element={<Account />} />
                    <Route path="/Blog" element={<Blog />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
