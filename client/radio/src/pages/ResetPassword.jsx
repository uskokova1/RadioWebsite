import React, {useContext, useRef, useState} from 'react'
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import {AppContext} from "../context/AppContext.jsx";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"


import { Mail, Lock } from "lucide-react"

const ResetPassword = () => {

    const {backendUrl} = useContext(AppContext);
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otpValue, setOtpValue] = useState(null)
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

    const inputRef = useRef([]);

    const handleInput = (e,i) =>{
        if (e.target.value.length > 0 && i < inputRef.current.length - 1){
            inputRef.current[i+1].focus()
        }
    }

    const handleKeyDown = (e, i) =>{
        if (e.key === 'Backspace' && e.target.value === '' && i > 0){
            inputRef.current[i-1].focus()
        }
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text')
        const pasteArray = paste.split('')
        pasteArray.forEach((ch,i) => {
            if(inputRef.current[i]){
                inputRef.current[i].value = ch
            }
        })
    }

    const onSubmitEmail = async (e) => {
        axios.defaults.withCredentials = true;
        e.preventDefault();

        try{
            const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && setIsEmailSent(true)
        }catch (err){
            toast.error(err.message)
        }
    }

    const onSubmitOTP = async (e) =>{
        e.preventDefault();
        //const otpArray = inputRef.current.map(input => input?.value ?? "");
        //setOtpValue(otpArray.join(''))
        setIsOtpSubmitted(true)
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try{
            const {data} = await axios.post(
                backendUrl + '/api/auth/reset-password',
                {email,otp: otpValue,newPassword: password}
            )

            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && navigate('/login')

        }catch(err){
            toast.error(err.message)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.column}>

                <div style={styles.header}>
                    <p className='text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <h2 className='m-auto p-5 text-white text-5xl font-bold'>
                        Reset Password
                    </h2>
                </div>

                <div className="flex justify-center p-10">

                    {/* EMAIL STEP */}
                    {!isEmailSent &&
                        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">

                            <CardHeader>
                                <CardTitle className="text-center">
                                    Reset Password
                                </CardTitle>

                                <CardDescription className="text-center text-zinc-400">
                                    Enter your registered email
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={onSubmitEmail} className="space-y-4">

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

                                    <Button type='submit' className="w-full">
                                        Submit
                                    </Button>

                                </form>
                            </CardContent>

                        </Card>
                    }

                    {/* OTP STEP */}
                    {!isOtpSubmitted && isEmailSent &&
                        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">

                            <CardHeader>
                                <CardTitle className="text-center">
                                    Enter OTP
                                </CardTitle>
                                <CardDescription className="text-center text-zinc-400">
                                    Enter the 6-digit code sent to your email
                                </CardDescription>
                            </CardHeader>

                            <CardContent>

                                <form onSubmit={onSubmitOTP} className="space-y-4">

                                    <InputOTP
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={setOtpValue}
                                        className="mx-auto"
                                    >
                                        <InputOTPGroup className="flex gap-3 justify-center m-auto ">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <InputOTPSlot
                                                    key={i}
                                                    index={i}
                                                    className="w-12 h-12 text-center p-1 text-lg rounded-2xl last:rounded-2xl first:rounded-2xl bg-zinc-800 border border-zinc-700 text-white"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>

                                    <Button type='submit' className="w-full">
                                        Verify Code
                                    </Button>

                                </form>

                            </CardContent>

                        </Card>
                    }


                    {/* NEW PASSWORD STEP */}
                    {isOtpSubmitted && isEmailSent &&
                        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">

                            <CardHeader>
                                <CardTitle className="text-center">
                                    New Password
                                </CardTitle>

                                <CardDescription className="text-center text-zinc-400">
                                    Enter your new password
                                </CardDescription>
                            </CardHeader>

                            <CardContent>

                                <form onSubmit={onSubmitNewPassword} className="space-y-4">

                                    <div className="flex items-center gap-2">
                                        <Lock size={18}/>
                                        <Input
                                            type="password"
                                            placeholder="New Password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button type='submit' className="w-full">
                                        Submit
                                    </Button>

                                </form>

                            </CardContent>

                        </Card>
                    }

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

export default ResetPassword