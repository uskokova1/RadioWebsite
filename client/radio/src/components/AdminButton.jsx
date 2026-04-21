import React, { useContext } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

const ADMIN_GROUP = 'admin';

const AdminButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { userData } = useContext(AppContext);

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) return null;

    const handleToggle = () => {
        const open = windows.some(w => w.group === ADMIN_GROUP);
        if (open) {
            closeGroup(ADMIN_GROUP);
        } else {
            addWindow({
                windowName: 'Admin Dashboard',
                spawnx: 320, spawny: 80,
                group: ADMIN_GROUP,
                content: (
                    <div className="w-[640px] h-[560px]">
                        <AdminDashboard />
                    </div>
                ),
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Admin Dashboard"
            className="absolute left-5 top-[720px] flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/50 bg-red-500/10 text-red-400 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-400 hover:bg-red-500/20 hover:text-red-300"
        >
            <ShieldCheck className="size-6" />
        </button>
    );
};

export default AdminButton;
