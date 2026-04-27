import React, {useContext, useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom";
import {AppContext} from "../context/AppContext.jsx";
import axios from "axios";
import {toast} from "react-toastify";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { User, Mail, Lock } from "lucide-react"
import {useWindowManager} from "@/context/WindowManager.jsx";
import EmailVerify from "@/pages/EmailVerify.jsx";
import ResetPassword from "@/pages/ResetPassword.jsx";

const Login = () => {

    const navigate = useNavigate()

    const {backendUrl, setIsLoggedIn, getUserData, sendVerificationOtp, isLoggedIn} = useContext(AppContext)
    const {addWindow, closeGroup} = useWindowManager()

    const [state, setState] = useState("Login")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if(isLoggedIn) {
            closeGroup(5);
            addWindow({
                spawnx: window.innerWidth / 2, spawny: window.innerHeight / 2,
                windowName: "login",
                group: 5,
                content: (
                    <p className='p-5'>
                        already logged in!
                    </p>
                )
            })
        }
    }, []);

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
                    addWindow({
                        windowName: 'Verify Email',
                        spawnx: 500,
                        spawny: 500,
                            group: 'calendar',
                            content: (
                                    <EmailVerify />
                                )}
                    )
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
                    addWindow({
                        windowName: 'Login',
                        spawnx: 500,
                        spawny: 500,
                        content: (
                            <div className='p-5 bg-zinc-900' > login successful! </div>
                        )}
                    )
                    closeGroup(5)
                }else{
                    toast.error(data.message)
                }
            }

        }catch (err){
            toast.error(err.message)
        }
    }

    return (
        <div className='bg-zinc-950 w-full h-full'>
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
                                    onClick={()=> {
                                        addWindow({
                                            windowName: 'Reset Password',
                                            spawnx: 600, spawny: 500,
                                            group: 5, //hardcoded login group xd
                                            content: (
                                                <ResetPassword />
                                            )
                                        });
                                }}
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
    )
}


export default Login