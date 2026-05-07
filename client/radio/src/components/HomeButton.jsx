import React, { useEffect, useRef } from 'react';
import { Home, Instagram } from 'lucide-react';
import { useWindowManager } from '@/context/WindowManager.jsx';

const HOME_GROUP = 6;

const HomeButton = ({ headless = false, toggle }) => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const firstRun = useRef(true);

    const handleToggle = () => {
        if (windows.some(w => w.group === HOME_GROUP)) {
            closeGroup(HOME_GROUP);
        } else {
            addWindow({
                windowName: 'Home', spawnx: window.innerWidth/2.3, spawny: window.innerHeight/5, group: HOME_GROUP,
                content: (
                    <p className='prose prose-invert m-5 group-prose-strong:text-red-500 w-100'>
                        🎶 Love music? We play all genres and are always looking for new recommendations to add to our rotation.
                        <br/>
                        🎙 Want to get involved? Record your own podcast or curate a custom playlist to air during select times.
                        <br/>
                        📡 Looking for a space to share your voice? WSIN is more than a station—it's a platform for creativity, conversation, and community.
                        <br/>
                        Whether you're here to listen, create, or connect, WSIN is your place to turn it up and be heard!
                    </p>
                )
            });
            addWindow({
                windowName: 'More', spawnx: window.innerWidth/2, spawny: window.innerHeight*2/3, group: HOME_GROUP,
                content: (
                    <div className='mx-auto w-full justify-evenly align-middle p-2'>
                        <a className='flex-row my-2 prose prose-invert flex text-2xl text-blue-400 underline '
                           href="https://owlconnect.southernct.edu/organization/wsinradio">
                            owlconnect
                        </a>
                        <a className='flex-row my-2 prose prose-invert flex text-2xl text-blue-400 underline '
                           href="https://radio.garden/listen/wsin-1590-am/UXQb3kOs">
                            radio.garden
                        </a>
                        <a className='text-2xl my-2 text-blue-400 underline flex'
                            href='https://www.instagram.com/wsinradio/'>
                            Instagram
                            <Instagram className='flex-row translate-y-2 flex text-2xl ' />
                        </a>
                    </div>
                )
            });
            addWindow({
                windowName: 'About', spawnx: window.innerWidth/5, spawny: window.innerHeight/5, group: HOME_GROUP,
                content: (
                    <div className='w-100 text-xl items-center justify-center'>
                        <img className='w-100' src='/homepicture.jpg' />
                        <div className='prose prose-invert m-5 group-prose-strong:text-red-500'>
                            <p className='text-2xl text-center'>Welcome to <b>WSIN!</b> </p>
                            Southern Connecticut State University's
                            student-run radio station, broadcasting straight from Room 210 in the
                            Adanti Student Center! We bring you a <b>diverse mix of music, podcasts,
                            and student-led content,</b> making sure there's always something fresh to tune into.
                        </div>
                    </div>
                ),
            });
        }
    };

    useEffect(() => {
        if (firstRun.current) { firstRun.current = false; return; }
        handleToggle();
    }, [toggle]);

    return (
        <>
            {!headless && (
                <button
                    onClick={handleToggle}
                    title="Home"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
                >
                    <Home className="size-6"/>
                </button>
            )}
        </>
    );
};

export default HomeButton;
