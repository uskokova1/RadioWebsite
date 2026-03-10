import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext);

    const [otpValue, setOtpValue] = useState("")

    useEffect(() => {
        if (isLoggedIn && userData && userData.isAccountVerified) {
            //navigate('/')
        }
    }, [isLoggedIn, userData])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp: otpValue })
            if (data.success) {
                toast.success(data.message)
                getUserData()
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <h2 className='m-auto p-5 text-white text-5xl font-bold'>Email Verification</h2>
                </div>

                <div className="flex justify-center p-10">

                    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-center">Verify Email</CardTitle>
                            <CardDescription className="text-center text-zinc-400">
                                Enter the 6-digit code sent to your email
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={onSubmitHandler} className="space-y-6 justify-center">

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

                                <Button type='submit' className="w-full mt-4">
                                    Verify Email
                                </Button>

                            </form>
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

export default EmailVerify