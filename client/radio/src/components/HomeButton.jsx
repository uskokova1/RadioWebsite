import React, { useState } from 'react';
import { useWindowManager, WindowManager } from '@/context/WindowManager.jsx';

const HomeButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const HOUSE_GROUP = 3;

    const handleToggle = () => {
        // Check if any House window is open
        const groupOpen = windows.some(win => win.group === HOUSE_GROUP);

        if (groupOpen) {
            // Close all windows in this group
            closeGroup(HOUSE_GROUP);
        } else {
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

        <div>
            <video
                autoPlay={true}
                muted={true}
                loop={true}
                src='/earth.webm'
                onClick={handleToggle}
                className='absolute left-5 top-15 scale-60
                    hover:scale-65 transition-all spring-duration-300 spring-bounce-60'
            />
        </div>
    );
};

export default HomeButton;