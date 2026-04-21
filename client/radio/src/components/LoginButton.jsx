import React from 'react';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Login from "@/pages/Login.jsx";

const LOGIN_GROUP = 5

const LoginButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();

    const handleToggle = () => {
        const groupOpen = windows.some(win => win.group === LOGIN_GROUP);
        if (!groupOpen) {
            addWindow({
                windowName: 'Sign In',
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
        <div
            onClick={handleToggle}
            title="Login"
            className="w-14 h-14 cursor-pointer transition-transform hover:scale-110 shrink-0"
        >
            <video autoPlay muted loop src="/login.webm" className="w-full h-full" />
        </div>
    );
};

export default LoginButton;
