import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from "react-toastify";

import NavBar from './components/NavBar'

import Home          from './pages/Home'
import Login         from "./pages/Login.jsx";
import EmailVerify   from "./pages/EmailVerify.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Account       from './pages/Account'
import Blog          from './pages/Blog'
import Events        from './pages/Events'
import Contact       from './pages/Contact'
import Profile       from './pages/Profile'

import AdminDashboard from "@/pages/AdminDashboard.jsx";
import ShowUsers      from "@/pages/ShowUsers.jsx";
import AdminComments  from "@/pages/AdminComments.jsx";
import AdminContacts  from "@/pages/AdminContacts.jsx";
import AdminEvents    from "@/pages/AdminEvents.jsx";
import AdminBlog      from "@/pages/AdminBlog.jsx";

const App = () => {
    return (
        <div>
            <ToastContainer />
            <NavBar />
            <Routes>
                {/* public */}
                <Route path='/'               element={<Home />}         />
                <Route path='/Home'           element={<Home />}         />
                <Route path='/login'          element={<Login />}        />
                <Route path='/email-verify'   element={<EmailVerify />}  />
                <Route path='/reset-password' element={<ResetPassword />}/>
                <Route path='/Account'        element={<Account />}      />
                <Route path='/Blog'           element={<Blog />}         />
                <Route path='/Events'         element={<Events />}       />
                <Route path='/Contact'        element={<Contact />}      />
                <Route path='/Profile'        element={<Profile />}      />

                {/* admin */}
                <Route path='/admin'          element={<AdminDashboard />} />
                <Route path='/admin/users'    element={<ShowUsers />}      />
                <Route path='/admin/comments' element={<AdminComments />}  />
                <Route path='/admin/contacts' element={<AdminContacts />}  />
                <Route path='/admin/events'   element={<AdminEvents />}    />
                <Route path='/admin/blog'     element={<AdminBlog />}      />
            </Routes>
        </div>
    )
}

export default App;