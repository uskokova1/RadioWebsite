import React, {useContext, useRef, useState} from 'react'
import {assets} from "../assets/yt-tut-stuff/assets.js";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import {AppContext} from "../context/AppContext.jsx";

const ResetPassword = () => {

    const {backendUrl} = useContext(AppContext);
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState(0)
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
        const otpArray = inputRef.current.map(e=>e.value);
        setOtp(otpArray.join(''))
        setIsOtpSubmitted(true)
    }
    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try{
            const {data} = await axios.post(backendUrl + '/api/auth/reset-password',
                {email,otp,newPassword: password})
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && navigate('/login')
        }catch(err){
            toast.error(err.message)
        }
    }

    return (
        <div>
            <div className='flex items-center justify-center min-h-screen
        bg-gradient-to-br from-indigo-100 to-white'>
                <img onClick={()=> navigate('/')}
                     src={assets.logo} alt=''
                     className='absolute left-5 sm: left-20 top-5 w-28 sm:w-32 cursor-pointer'/>

                {!isEmailSent &&
                    <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password</h1>
                        <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="" className='w-3 h-3'/> <input type="email" placeholder='Email id'
                            className='bg-transparent outline-none text-white'
                            value={email} onChange={e => setEmail(e.target.value)} required/>
                        </div>
                    <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
                        </form>

                    }



                {!isOtpSubmitted && isEmailSent &&
                <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Password Reset</h1>
                    <p className=' text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email</p>
                    <div className=' flex justify-between mb-8' onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index)=>(
                            <input type="text" maxLength="1" key={index} required
                                   className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                                   ref={e => inputRef.current[index] = e}
                                   onInput={(e)=> handleInput(e,index)}
                                   onKeyDown={(e) => handleKeyDown(e,index)}
                            />
                        ))}
                    </div>
                    <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'> Reset Password </button>
                </form>
                }

                {isOtpSubmitted && isEmailSent &&
                    <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                        <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
                        <p className='text-center mb-6 text-indigo-300'>Enter your new password</p>
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.lock_icon} alt="" className='w-3 h-3'/> <input type="password" placeholder='Password'
                                                                                            className='bg-transparent outline-none text-white'
                                                                                            value={password} onChange={e => setPassword(e.target.value)} required/>
                        </div>
                        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
                    </form>
                }
            </div>
        </div>
    )
}
export default ResetPassword
