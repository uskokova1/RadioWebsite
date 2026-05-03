import React, {useContext, useEffect, useRef, useState} from 'react';

import BlogButton from '@/components/BlogButton.jsx';
import ContactsButton from '@/components/ContactsButton.jsx';
import EventsCalendar from '@/components/EventsCalendar.jsx';
import EventsCalendar2 from '@/components/EventsCalandar2.jsx';
import LoginButton from '@/components/LoginButton.jsx';
import RadioButton from '@/components/RadioButton.jsx';
import AdminButton from '@/components/AdminButton.jsx';
import AuthButton from '@/components/AuthButton.jsx';
import {
    FloatingContact,
    FloatingBlog,
    FloatingLogin,
    FloatingHome,
    FloatingCalander, FloatingRadio
} from '@/components/FloatingIcons.jsx';
import {motion} from "motion/react";
import {RotateCcw} from "lucide-react";

import {useWindowManager, WindowManager} from '@/context/WindowManager.jsx';
import { AppContext } from '@/context/AppContext.jsx';
import Wigglie from "@/components/Wigglie.jsx";

/** Wraps a sidebar button with a fade-in label that appears to its right on hover */
const SidebarItem = ({ label, children }) => (
    <motion.div
        variants={{
            hidden: { x: -100, opacity: 0 },
            visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, mass: 1, damping: 10 } }
        }}
        className="group relative flex items-center">
        {children}
        <span className="pointer-events-none absolute left-[68px] ml-2 -translate-x-1 whitespace-nowrap
                         rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-xs
                         text-zinc-300 opacity-0 transition-all spring-duration-300 spring-bounce-60
                         group-hover:translate-x-0 group-hover:opacity-100">
            {label}
        </span>
    </motion.div>
);

const App = () => {
    const { userData, introPlayedBefore, setIntroPlayedBefore } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';
    const [introFinished, setIntroFinished] = useState(false);
    const intro1 = useRef(null);
    const [firstButton, setFirstButton] = useState(false);

    useEffect(() => {
        if(introPlayedBefore){
            setFirstButton(true);
            setIntroFinished(true);
        }
    },  [introPlayedBefore])

    const bgaudio = useRef(null);
    const bg = useRef(null);

    useEffect(() => {
        if(bgaudio.current){
            bgaudio.current.volume = 0.1;
        }
    }, [introFinished]);


    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <div className='absolute min-h-screen min-w-screen overflow-hidden bg-black
            flex items-center justify-center'>
                {!firstButton && (
                    <Wigglie speed={300} className='flex w-screen h-screen'>
                    <button onClick={()=>{
                        intro1.current.play();
                        intro1.current.hidden = false;
                        intro1.current.volume = 0.1
                        setFirstButton(true)
                    }}
                            style={{
                                boxShadow: "0px 0px 35px 42px #1A1A1A"
                            }}
                            className='special-elite justify-center align-middle mx-auto my-auto
                            hover:scale-105
                            transition-all spring-bounce-60 spring-duration-300 text-xl
                            '>
                        1590AM
                    </button>
                    </Wigglie>
                )}
                {!introFinished && (
                    <div className='bg-black w-full h-full contents'>
                        <video
                            hidden={true}
                            ref={intro1}
                            playsInline
                            onEnded={() => {
                                setIntroFinished(true)
                                setIntroPlayedBefore(true)
                            }}
                            className="absolute inset-0 justify-self-center h-full object-cover z-10 scale-50">
                            <source src="/wsinlogoanim.webm" />
                        </video>
                    </div>
                )}
                {introFinished && (
        <div className='bg-black relative min-h-screen min-w-screen z-90 overflow-hidden'>
            {/* Background video — kept OUTSIDE Wigglie. Wigglie re-seeds its
                SVG displacement filter every ~1s, and re-applying an SVG filter
                to a <video> element forces the browser to re-paint the frame,
                which interrupts playback and looked like the bg was resetting. */}
            <audio ref={bgaudio} src='/finalbackground.webm' type="audio/webm" autoPlay={true}>
            </audio>
            <video
                ref={bg}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover z-0">
                <source src="/finalbackground.webm" type="video/webm" />
            </video>

            <WindowManager />


            {/* Brand chip top-left */}
            <div className="absolute left-5 top-3 flex items-center gap-2 text-zinc-300 select-none pointer-events-none">
                <img src={'/shirtlogo.png'} className='h-20'/>
                {/*<Disc3 className="size-5 text-red-500" />*/}
                {/*<span className="text-xs uppercase tracking-[0.3em] font-semibold">WSIN</span>*/}
            </div>

            {/* ── Left sidebar ── equally spaced, each with a hover label */}
                <motion.div
                    className="absolute left-7 top-[140px] z-[200] flex flex-col items-start gap-5"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.2, // delay between items
                            }
                        }
                    }}
                >
                    <SidebarItem label="Home"><FloatingHome Button={true} /></SidebarItem>
                    <SidebarItem label="Contacts"><ContactsButton /></SidebarItem>
                    <SidebarItem label="Blog"><BlogButton /></SidebarItem>
                    <SidebarItem label="User Login"><LoginButton /></SidebarItem>
                    <SidebarItem label="Radio"><RadioButton /></SidebarItem>
                    <SidebarItem label="Events"><EventsCalendar /></SidebarItem>
                    <SidebarItem label="Admin Dashboard"><AdminButton /></SidebarItem>
                </motion.div>

            {/* ── Freely draggable 3D icons — click to open, drag to reposition ── */}
            <FloatingContact />
            <FloatingBlog />
            <FloatingLogin />
            <FloatingHome />
            <FloatingCalander />
            <FloatingRadio />

            {/* Secondary calendar widget */}
            {/*<EventsCalendar2 />*/}

            {/* Floating auth button bottom-right */}
            <AuthButton />

            {/* Status chip top-right */}
            <div className="absolute top-3 right-5 flex items-center gap-2 text-xs text-zinc-400">
                <span className={`inline-block size-2 rounded-full ${userData ? 'bg-green-500' : 'bg-zinc-600'}`} />
                {userData
                    ? <span><span className="text-zinc-300 font-medium">{userData.username || 'User'}</span>{isAdmin && <span className="ml-1 text-red-400">· admin</span>}</span>
                    : <span>Not signed in</span>}
                <button
                    onClick={() => {
                        localStorage.removeItem('introPlayedBefore');
                        setIntroPlayedBefore(false);
                        setIntroFinished(false);
                        setFirstButton(false);
                    }}
                    className="ml-2 p-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors"
                    title="Reset intro and replay"
                >
                    <RotateCcw className="size-3" />
                </button>
            </div>
        </div>
            ) }
            </div>
        </div>

    );
};

export default App;
