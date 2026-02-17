import {createContext, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) =>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)

    const getUserData = async () => {
        try{
            axios.defaults.withCredentials = true
            const{data} = await axios.get(backendUrl + '/api/user/data')
            data.success ? setUserData(data.userData.name) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value ={
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}