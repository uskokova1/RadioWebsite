import React, { useContext } from 'react';
import { UserCircle2 } from 'lucide-react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Profile from '@/pages/Profile.jsx';

const PROFILE_GROUP = 'profile';

const ProfileButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { userData } = useContext(AppContext);

    if (!userData) return null;

    const handleToggle = () => {
        const open = windows.some(w => w.group === PROFILE_GROUP);
        if (open) {
            closeGroup(PROFILE_GROUP);
        } else {
            addWindow({
                windowName: 'Profile',
                spawnx: 360, spawny: 120,
                group: PROFILE_GROUP,
                content: (
                    <div className="w-[520px] h-[520px]">
                        <Profile />
                    </div>
                ),
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Profile"
            className="absolute left-5 top-[420px] flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <UserCircle2 className="size-6" />
        </button>
    );
};

export default ProfileButton;
