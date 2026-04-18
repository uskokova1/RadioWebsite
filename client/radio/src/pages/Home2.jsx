import React, {useRef, useState} from 'react';
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
    const [introFinished2, setIntroFinished2] = useState(false);

    const intro1 = useRef(null);
    const [firstButton, setFirstButton] = useState(false);
    // Group ID for the "House" windows
    const HOUSE_GROUP = 3;


    return (
        <div className="absolute">
            <div className='absolute min-h-screen min-w-screen overflow-hidden bg-black
            flex items-center justify-center'>
                {!firstButton && (
                    <button onClick={()=>{
                        intro1.current.play();
                        intro1.current.hidden = false;
                        intro1.current.volume = 0.1
                        setFirstButton(true)
                    }}
                            className='absolute mx-auto my-auto
                            hover:scale-105
                            transition-all spring-bounce-60 spring-duration-300
                            bg-zinc-900 p-5 rounded-3xl'>
                        1590AM
                    </button>
                )}
                {!introFinished && (
                    <div className='bg-black w-full h-full'>
                    <video
                        hidden={true}
                        ref={intro1}
                        playsInline
                        onEnded={() => setIntroFinished(true)}
                        className="absolute inset-0 justify-self-center h-full object-cover z-10 scale-50">
                        <source src="/wsinlogoanim.webm" />
                    </video>
                    </div>
                )}
                {introFinished && !introFinished2 && (
                    <div className='bg-black w-full h-full'>
                        <video
                            autoPlay={true}
                            playsInline
                            onEnded={() => setIntroFinished2(true)}
                            className="absolute -top-35 left-90 inset-0 justify-self-center h-full object-cover z-0 scale-80 ">
                            <source src="/wsinlightanim.webm" />
                        </video>
                        <video
                            autoPlay={true}
                            playsInline
                            className="absolute top-60 -left-150 inset-0 justify-self-center h-full object-cover z-0 scale-60 ">
                            <source src="/boomboxintro.webm" />
                        </video>
                    </div>
                )}
            </div>
            {introFinished2 && (
                <div
                    className='absolute min-h-screen min-w-screen overflow-hidden'>
                    <video
                        autoPlay={true}
                        loop={true}
                        playsInline
                        onEnded={() => setIntroFinished2(true)}
                        className="absolute -top-35 left-90 inset-0 justify-self-center h-full object-cover z-0 scale-80 ">
                        <source src="/wsinlightanimLOOP.webm" />
                    </video>
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