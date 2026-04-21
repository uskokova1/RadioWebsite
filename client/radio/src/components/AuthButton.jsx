import React, { useContext } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Login from '@/pages/Login.jsx';
import { Button } from '@/components/ui/button.jsx';

const LOGIN_GROUP = 5;

const AuthButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { userData, setUserData, setIsLoggedIn, logout } = useContext(AppContext);

    const openLogin = () => {
        const open = windows.some(w => w.group === LOGIN_GROUP);
        if (open) {
            closeGroup(LOGIN_GROUP);
        } else {
            addWindow({
                windowName: 'Sign In',
                spawnx: 440, spawny: 140,
                group: LOGIN_GROUP,
                content: (
                    <div className="w-[420px]">
                        <Login />
                    </div>
                ),
            });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="fixed bottom-20 right-5 z-[9999]">
            {userData ? (
                <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleLogout}
                    className="shadow-2xl shadow-red-500/30 gap-2 px-5"
                >
                    <LogOut className="size-5" />
                    <span className="font-semibold tracking-wide">
                        Log out
                        {userData.username && (
                            <span className="ml-1 opacity-75 font-normal">
                                ({userData.username})
                            </span>
                        )}
                    </span>
                </Button>
            ) : (
                <Button
                    size="lg"
                    onClick={openLogin}
                    className="shadow-2xl shadow-red-500/30 gap-2 px-5 bg-red-500 hover:bg-red-600 text-white"
                >
                    <LogIn className="size-5" />
                    <span className="font-semibold tracking-wide">Log in</span>
                </Button>
            )}
        </div>
    );
};

export default AuthButton;
