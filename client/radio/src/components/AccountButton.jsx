import React, { useContext } from 'react';
import { Settings } from 'lucide-react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Account from '@/pages/Account.jsx';

const ACCOUNT_GROUP = 'account';

const AccountButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { userData } = useContext(AppContext);

    if (!userData) return null;

    const handleToggle = () => {
        const open = windows.some(w => w.group === ACCOUNT_GROUP);
        if (open) {
            closeGroup(ACCOUNT_GROUP);
        } else {
            addWindow({
                windowName: 'Account',
                spawnx: 420, spawny: 140,
                group: ACCOUNT_GROUP,
                content: (
                    <div className="w-[480px] h-[500px]">
                        <Account />
                    </div>
                ),
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Account"
            className="absolute left-5 top-[480px] flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <Settings className="size-6" />
        </button>
    );
};

export default AccountButton;
