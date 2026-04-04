import React, {useContext, useEffect} from 'react'
import {AppContext} from '@/context/AppContext.jsx'
import {useNavigate} from "react-router-dom"
import {toast} from "react-toastify"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const AdminDashboard = () => {
    const {userData, getUserData} = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => { if(!userData) getUserData(); }, [])

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/')
            toast.error('Not an admin')
        }
    }, [userData])

    const cards = [
        { title: 'User Management',     desc: 'View and manage all users',          path: '/admin/users'    },
        { title: 'Event Management',    desc: 'Create and edit events',             path: '/events'         },
        { title: 'Blog Management',     desc: 'Manage blog groups and posts',         path: '/admin/blogs'    },
        { title: 'Comment Moderation',  desc: 'Review and remove comments',         path: '/admin/comments' },
        { title: 'Manage Contacts',     desc: 'Add, edit, and remove contacts',     path: '/admin/contacts' },
        { title: 'Image Manager',       desc: 'Upload and delete images',           path: '/admin/images'   },
    ];

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>Admin Panel</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
                    {cards.map(card => (
                        <Card
                            key={card.path}
                            onClick={() => navigate(card.path)}
                            className="bg-zinc-900 border-zinc-800 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:border-red-500"
                        >
                            <CardHeader>
                                <CardTitle>{card.title}</CardTitle>
                                <CardDescription className="text-zinc-400">{card.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

const styles = {
    page:   { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column: { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header: { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", justifyContent: "center", display: "flex", flexDirection: "column" },
}

export default AdminDashboard