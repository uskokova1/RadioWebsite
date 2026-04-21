import React, { useContext, useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { LogIn } from 'lucide-react';
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
        <button
            onClick={handleToggle}
            title="Login"
            className="absolute left-5 top-[420px] z-[200] flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <LogIn className="size-6" />
        </button>
    );
};

export default LoginButton;
