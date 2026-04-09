import React, { useState } from 'react';
import { House } from 'lucide-react';
import Login from '@/pages/Login.jsx';
import EmailVerify from "@/pages/EmailVerify.jsx";
import BlogButton from "@/components/BlogButton.jsx";
import ContactsButton from "@/components/ContactsButton.jsx";
import { useWindowManager, WindowManager } from '@/context/WindowManager.jsx';
import MarkdownView from "react-showdown";
import BoomBoxButton from "@/components/BoomBoxButton.jsx";

const App = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();

    // Group ID for the "House" windows
    const HOUSE_GROUP = 3;


    const toggleHouseWindows = () => {
        // Check if any House window is open
        const groupOpen = windows.some(win => win.group === HOUSE_GROUP);

        if (groupOpen) {
            // Close all windows in this group
            closeGroup(HOUSE_GROUP);
        } else {
            // Open all windows in this group
            addWindow({
                windowName: 'Login',
                content: <Login />,
                spawnx: 50,
                spawny: 90,
                group: HOUSE_GROUP,
            });
            addWindow({
                windowName: 'EmailVerify',
                content: <EmailVerify />,
                spawnx: 350,
                spawny: 290,
                group: HOUSE_GROUP,
            });
            addWindow({
                windowName: 'Child1',
                content: <div className='text-4xl text-black w-full h-auto'>Child 1 Content</div>,
                spawnx: 150,
                spawny: 590,
                group: HOUSE_GROUP,
            });
        }
    };

    return (
        <div className='polka relative min-h-screen min-w-screen z-90'>
            <WindowManager />

            <House
                onClick={toggleHouseWindows}
                className='absolute left-30 top-10 w-20 h-20 hover:scale-150 transition-all spring-duration-300 spring-bounce-60'
            />
            <BoomBoxButton/>
            <BlogButton />
            <ContactsButton />
        </div>
    );
};

export default App;