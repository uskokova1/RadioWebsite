import React, {useContext} from 'react'
import {assets} from '../assets/yt-tut-stuff/assets.js'
import {useNavigate} from "react-router-dom";
import {AppContext} from "../context/AppContext.jsx"

const NavBar = () => {

    const navigate = useNavigate();
    const {userData, logout,sendVerificationOtp} = useContext(AppContext);
    console.log(userData)

    return (
        <div className='w-full flex justify-between
        items-center
        p-4 sm:0-6 sm:px-24 absolute top-0'>
        <img src={assets.logo} alt="" className='w-28 sm:w-32' />

            {userData ?
                <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
                    {userData.name[0].toUpperCase()}
                    <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
                        <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
                            {!userData.isAccountVerified &&
                            <li onClick={() => sendVerificationOtp()}
                                className='py-1 px-2 hover:bg-gray-200 cursor-pointed'>Verify email</li>
                            }
                            <li onClick={() =>{
                                logout()
                                navigate('/')
                            }} className='py-1 px-2 hover:bg-gray-200 cursor-pointed pr-10'>Logout</li>
                        </ul>
                    </div>
                </div>
            :
                <button onClick={()=>navigate('/login')}
            className='flex items-center
            gap-2 border border-gray-500
            rounded-full px-6 py-2
            text-gray-800 hover:bg-gray-100
            transition-all'>Login <img src={assets.arrow_icon}/> </button>
                }
        </div>
    )
}
export default NavBar
