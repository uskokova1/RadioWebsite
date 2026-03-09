import React, {useState, useContext, useEffect} from 'react'
import {AppContext} from '@/context/AppContext.jsx';
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import axios from "axios";
import { ArrowLeft } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"

const ShowUsers = () => {
    const {backendUrl, userData, getUserData} = useContext(AppContext)
    const [allUsers, setAllUsers] = useState([]);

    const navigate = useNavigate()

    useEffect(() => {
        if(!userData){
            getUserData()
        }
    }, [])

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/')
            toast.error('Not an admin')
        }else{
            getUsers()
        }
    }, [userData])

    const getUsers = async () => {
        axios.defaults.withCredentials = true
        try{
            const {data} = await axios.get(backendUrl+'/api/user/all')
            setAllUsers(data)
        }catch(err){
            console.log(err)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')}
                            className='flex left-0 rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft />
                        Back</button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>All Users</h2>
                    <div style={styles.titleLine} />
                </div>

                <div className="p-8 space-y-4">
                    {Array.from({ length: Math.ceil(allUsers.length / 3) }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-4">
                            {allUsers.slice(rowIndex * 3, rowIndex * 3 + 3).map((user, index) => (
                                <Card
                                    key={index}
                                    className="flex-1 bg-zinc-900 border-zinc-800 text-white
          transition-all duration-300 ease-in-out
          hover:flex-[1.1] cursor-pointer"
                                >
                                    <CardHeader className='flex-col justify-center'>
                                        <CardTitle className='m-auto'>{user.username}</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {user.email}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex justify-center'>
                                        <p className="text-sm m-auto">
                                            Role: <span className="font-semibold">{user.role}</span>
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        justifyContent: "center",
    },
    column: {
        width: "100%",
        maxWidth: "760px",
        minHeight: "100vh",
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a",
        borderRight: "1px solid #2a2a2a",
    },
    header: {
        background: "#322d2d",
        padding: "40px 32px 28px",
        borderBottom: "1px solid #3a3a3a",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
    },
}

export default ShowUsers