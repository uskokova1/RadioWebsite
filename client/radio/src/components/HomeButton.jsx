import React, { useState } from 'react';
import { useWindowManager, WindowManager } from '@/context/WindowManager.jsx';
import {ScrollArea} from "@/components/ui/scroll-area.jsx";
import MarkdownView from "react-showdown";

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
                windowName: 'Home',
                spawnx: window.innerWidth/3,
                spawny: window.innerHeight/3,
                group: HOUSE_GROUP,
                content: (
                    <div>
                        <img className='absolute right-0 top-0 scale-50'
                            src='/shirtlogo.png' />
                        <MarkdownView
                            markdown={
                            "#WSIN, the radio station at SCSU!"
                            }
                            className='h-50 text-4xl text-red-500 justify-self-center'>
                        </MarkdownView>
                    </div>
                )
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