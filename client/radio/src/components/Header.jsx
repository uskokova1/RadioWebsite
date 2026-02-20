import React, {useContext} from 'react'
import {AppContext} from "../context/AppContext.jsx";

const Header = () => {
    const {userData} = useContext(AppContext);

    return (
        <div>
           <h1> header here, {userData.name}</h1>
        </div>
    )
}
export default Header
