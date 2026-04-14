import React, { useContext, useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext.jsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import Login from "@/pages/Login.jsx";

const LOGIN_GROUP = 5

const LoginButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { backendUrl } = useContext(AppContext);

    const handleToggle = () => {
        const groupOpen = windows.some(win => win.group === LOGIN_GROUP);
        if (!groupOpen) {
            addWindow({
                windowName: 'Blog Groups',
                spawnx: 300, spawny: 200,
                group: LOGIN_GROUP,
                content: (
                    <Login />
                )
            });
        } else {
            closeGroup(LOGIN_GROUP);
        }
    };

    return (
        <div>
            <video
                autoPlay={true}
                muted={true}
                loop={true}
                src='/login.webm'
                onClick={handleToggle}
                className='absolute left-5 top-105 scale-60
                hover:scale-65 transition-all spring-duration-300 spring-bounce-60'
            />
        </div>
    );
};

export default LoginButton;
