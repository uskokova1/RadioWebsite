import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Login from "./pages/Login.jsx";
import EmailVerify from "./pages/EmailVerify.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import {ToastContainer} from "react-toastify";


import Home from './pages/Home'
import Home2 from './pages/Home2'
import Account from './pages/Account'
import NavBar from './components/NavBar'
import Blog from './pages/Blog'
import BlogGroups from './pages/BlogGroups'
import Events from './pages/Events'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import ShowUsers from "@/pages/ShowUsers.jsx";
import AdminDashboard from "@/pages/AdminDashboard.jsx";
import AdminComments from "@/pages/AdminComments.jsx";
import AdminContacts from "@/pages/AdminContacts.jsx";
import AdminImages from "@/pages/AdminImages.jsx";
import AdminBlogs from "@/pages/AdminBlogs.jsx";
import {TooltipProvider} from "@/components/ui/tooltip.jsx"

const App = () => {

    return (
        <div>
            <TooltipProvider>
            <ToastContainer/>
                {/*<NavBar/>*/}
            <Routes>
                <Route path='/' element={<Home2 />} />
                <Route path='/admin/users' element={<ShowUsers />} />
                <Route path='/admin' element={<AdminDashboard />} />
                <Route path='/login' element={<Login />} />
                <Route path='/email-verify' element={<EmailVerify />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/Blog" element={<Blog />} />
                <Route path="/BlogGroups" element={<BlogGroups />} />
                <Route path="/Events" element={<Events />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/admin/images" element={<AdminImages />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />
                <Route path="/admin/comments" element={<AdminComments />} />
                <Route path="/admin/blogs" element={<AdminBlogs />} />
                <Route path="/Profile" element={<Profile />} />
            </Routes>
            </TooltipProvider>
        </div>
    )
}

export default App;