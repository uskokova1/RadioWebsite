import React, {useContext, useState} from 'react'
import {useNavigate} from "react-router-dom";
import {AppContext} from "../context/AppContext.jsx";
import axios from "axios";
import {toast} from "react-toastify";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { User, Mail, Lock } from "lucide-react"

const Login = () => {

    const navigate = useNavigate()

    const {backendUrl, setIsLoggedIn, getUserData, sendVerificationOtp} = useContext(AppContext)

    const [state, setState] = useState("Sign up")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault()

            if(state === 'Sign up'){
                axios.defaults.withCredentials = true
                const {data} = await axios.post(backendUrl + '/api/auth/register',{
                    username: name,
                    email,
                    password
                })

                if(data.success){
                    setIsLoggedIn(true)
                    getUserData()
                    sendVerificationOtp()
                    navigate('/email-verify')
                }else{
                    toast.error(data.message)
                }

            }else{
                axios.defaults.withCredentials = true
                const {data} = await axios.post(backendUrl + '/api/auth/login',{
                    email,
                    password
                })

                if(data.success){
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }
            }

        }catch (err){
            toast.error(err.message)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                <div style={styles.header}>
                    <p className='text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <h2 className='m-auto p-5 text-white text-5xl font-bold'>
                        {state === "Sign up" ? "Create Account" : "Login"}
                    </h2>
                </div>

                <div className="flex justify-center p-10">

                    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">

                        <CardHeader>
                            <CardTitle className="text-center">
                                {state === "Sign up" ? "Create Account" : "Login"}
                            </CardTitle>
                            <CardDescription className="text-center text-zinc-400">
                                {state === "Sign up"
                                    ? "Create your account"
                                    : "Login to your account"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>

                            <form onSubmit={onSubmitHandler} className="space-y-4">

                                {state === "Sign up" && (
                                    <div className="flex items-center gap-2">
                                        <User size={18}/>
                                        <Input
                                            placeholder="Username"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Mail size={18}/>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Lock size={18}/>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <p
                                    onClick={()=> navigate('/reset-password')}
                                    className="text-sm text-blue-400 cursor-pointer"
                                >
                                    Forgot password?
                                </p>

                                <Button type='submit' className="w-full">
                                    {state}
                                </Button>

                            </form>

                            {state === 'Sign up' ? (
                                <p className='text-gray-400 text-center text-xs mt-4'>
                                    Already have an account?
                                    <span
                                        onClick={()=>setState('Login')}
                                        className='text-blue-400 cursor-pointer underline ml-1'
                                    >
                                        Login here
                                    </span>
                                </p>

                            ) : (

                                <p className='text-gray-400 text-center text-xs mt-4'>
                                    Don't have an account?
                                    <span
                                        onClick={()=>setState('Sign up')}
                                        className='text-blue-400 cursor-pointer underline ml-1'
                                    >
                                        Create one here
                                    </span>
                                </p>

                            )}

                        </CardContent>

                    </Card>

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
        textAlign: "center"
    },
}

export default Login