import {createContext, useEffect, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

export const AppContext = createContext()

export const AppContextProvider = (props) =>{
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)

    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true)
                getUserData()
            }
        }catch(e){
            toast.error(e.message)
        }
    }

    const getUserData = async () => {
        try{
            axios.defaults.withCredentials = true
            const{data} = await axios.get(backendUrl + '/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = async ()=>{
        try {
            axios.defaults.withCredentials = true
            const {data} = await axios.get(backendUrl + '/api/auth/logout')

            data.success && setIsLoggedIn(false)
            data.success && setUserData(false)
        }catch(e){
            console.log(e)
            toast.error(e.message)
        }
    }

    const sendVerificationOtp = async ()=>{
        try{
            const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
            if(data.success){
                navigate('/email-verify')
                toast.success(data.message)
            }else{
                console.log(data)
                toast.error(data.message)
            }
        }catch(e){
            console.log(e)
            toast.error(e.message)
        }
    }

    useEffect(() => {
        axios.defaults.withCredentials = true
        if(!userData) {
            getAuthState()
        }
    }, [])

    const value ={
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
        sendVerificationOtp,
        logout
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}