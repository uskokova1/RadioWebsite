import React, { useState } from 'react';
import { House } from 'lucide-react';
import Login from '@/pages/Login.jsx';
import EmailVerify from "@/pages/EmailVerify.jsx";
import BlogButton from "@/components/BlogButton.jsx";
import ContactsButton from "@/components/ContactsButton.jsx";
import EventsCalendar from "@/components/EventsCalendar.jsx";
import EventsCalendar2 from "@/components/EventsCalandar2.jsx"
import { useWindowManager, WindowManager } from '@/context/WindowManager.jsx';
import MarkdownView from "react-showdown";
import BoomBoxButton from "@/components/BoomBoxButton.jsx";
import LoginButton from "@/components/LoginButton.jsx";
import HomeButton from "@/components/HomeButton.jsx";


const App = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const [introFinished, setIntroFinished] = useState(false);
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
        <div className="absolute">
            <div className='absolute min-h-screen min-w-screen overflow-hidden bg-[#0C0C0D]'>
                {/* First you load the static image that will stay behind the video */}

                {/* Below is the code to play the video right away then disapear */}
                {!introFinished&& (
                    <video
                        autoPlay
                        muted
                        playsInline
                        onEnded={() => setIntroFinished(true)}
                        className="absolute inset-0 justify-self-center h-full object-cover z-10">
                        <source src="/intro.mp4" type="video/mp4" />
                    </video>
                )}
            </div>
            {introFinished && (
                <div
                    className='absolute min-h-screen min-w-screen overflow-hidden'>
                    <img
                        src="/MainBackground.png"
                        alt=""
                        className="absolute inset-0 h-full justify-self-center cover z-0 pointer-events-none"
                    />
                    <HomeButton />
                    <LoginButton />
                    <WindowManager />

                    <EventsCalendar2 />

                    {/*<House*/}
                    {/*    onClick={toggleHouseWindows}*/}
                    {/*    className='absolute left-5 top-15 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'*/}
                    {/*/>*/}
                    <BlogButton />
                    <BoomBoxButton/>
                    <ContactsButton />
                    {/*<EventsCalendar />*/}
                </div>
            )}
        </div>
    );
};

export default App;