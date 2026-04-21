import React from 'react';
import { LogIn } from 'lucide-react';
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
        <button
            onClick={handleToggle}
            title="Login"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <LogIn className="size-6" />
        </button>
    );
};

export default LoginButton;
