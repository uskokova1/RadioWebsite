import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Login from "./pages/Login.jsx";
import EmailVerify from "./pages/EmailVerify.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import {ToastContainer} from "react-toastify";


import Home from './pages/Home'
import Account from './pages/Account'
import NavBar from './components/NavBar'
import Blog from './pages/Blog'
import Events from './pages/Events'
import Contact from './pages/Contact'
import Profile from './pages/Profile'


const App = () => {

    return (
        <div>
            <ToastContainer/>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/email-verify' element={<EmailVerify />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/Blog" element={<Blog />} />
                <Route path="/Events" element={<Events />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/Profile" element={<Profile />} />
            </Routes>
        </div>
    )
}

export default App;