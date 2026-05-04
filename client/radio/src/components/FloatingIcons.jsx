import React, { useState, useRef, useEffect } from 'react';
import { Home } from 'lucide-react';
import { motion } from 'motion/react';

import { useWindowManager } from '@/context/WindowManager.jsx';
import ContactsButton from '@/components/ContactsButton.jsx';
import BlogButton from '@/components/BlogButton.jsx';
import LoginButton from '@/components/LoginButton.jsx';
import AdminButton from '@/components/AdminButton.jsx';
import HomeButton from '@/components/HomeButton.jsx';
import EventsCalendar from "@/components/EventsCalendar.jsx";
import RadioButton from "@/components/RadioButton.jsx";

// ─── Drag engine ─────────────────────────────────────────────────────────────
// Click = no drag  (mousedown + mouseup with <5px movement) → calls onActivate
// Drag  = move freely around the screen
function DraggableIcon({ src, title, initialX, initialY, onActivate }) {
    const [pos, setPos]   = useState({ x: initialX, y: initialY });

    const dragging        = useRef(false);
    const origin          = useRef({ x: 0, y: 0 });
    const startPos        = useRef({ x: 0, y: 0 });
    const moved           = useRef(false);
    // Keep a ref so the window-event handlers always see the latest toggle fn
    const activateRef     = useRef(onActivate);
    activateRef.current   = onActivate;

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return;
            const dx = e.clientX - origin.current.x;
            const dy = e.clientY - origin.current.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
            setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy });
        };
        const onUp = () => {
            if (dragging.current && !moved.current) activateRef.current();
            dragging.current = false;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        };
    }, []);

    const onMouseDown = (e) => {
        dragging.current  = true;
        moved.current     = false;
        origin.current    = { x: e.clientX, y: e.clientY };
        startPos.current  = { ...pos };
        e.preventDefault();
    };

    return (
        <div
            onMouseDown={onMouseDown}
            title={title}
            style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 5 }}
            className="w-44 h-44 select-none cursor-grab active:cursor-grabbing drop-shadow-2xl
                       transition-filter hover:drop-shadow-[0_0_42px_rgba(244,63,94,0.5)]"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, mass: 1, damping:5}}
            >
                <video autoPlay
                       muted
                       loop
                       src={src}
                       className="w-full h-full hover:scale-116
                       transition-transform spring-duration-300 spring-bounce-60"
                       draggable={false} />
            </motion.div>
        </div>
    );
}

// ─── Floating Contact ─────────────────────────────────────────────────────────
export function FloatingContact() {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            <ContactsButton headless={true} toggle={openAlready} />
            <DraggableIcon
                src="/contact.webm"
                title="Contacts — drag me!"
                initialX={window.innerWidth/2}
                initialY={window.innerHeight/7 * 5}
                onActivate={() => setOpenAlready(prev => !prev)}
            />
        </>
    );
}

// ─── Floating Blog ────────────────────────────────────────────────────────────
export function FloatingBlog() {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            <BlogButton headless={true} toggle={openAlready} />
            <DraggableIcon
                src="/clipboard.webm"
                title="Blog — drag me!"
                initialX={window.innerWidth/6}
                initialY={window.innerHeight/7 * 5}
                onActivate={() => setOpenAlready(prev => !prev)}
            />
        </>
    );
}

// ─── Floating Login ───────────────────────────────────────────────────────────
export function FloatingLogin() {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            <LoginButton headless={true} toggle={openAlready} />
            <DraggableIcon
                src="/login.webm"
                title="Login — drag me!"
                initialX={window.innerWidth/8 * 6}
                initialY={window.innerHeight/5 * 3}
                onActivate={() => setOpenAlready(prev => !prev)}
            />
        </>
    );
}

// ─── Floating Home ───────────────────────────────────────────────────────────
export function FloatingHome({Button=false}) {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            {!Button && <HomeButton headless={true} toggle={openAlready} />}
            {!Button ?
                <DraggableIcon
                    src="/earth.webm"
                    title="Home — drag me!"
                    initialX={window.innerWidth / 7}
                    initialY={window.innerHeight / 7}
                    onActivate={() => setOpenAlready(prev => !prev)}
                /> :
                <button
                    onClick={() => setOpenAlready(prev => !prev)}
                    title="Home"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
                >
                    <Home className="size-6"/>
                </button>
            }
        </>
    );
}

// ─── Floating Calendar ──────────────────────────────────────────────────────
export function FloatingCalander() {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            <EventsCalendar headless={true} toggle={openAlready} />
            <DraggableIcon
                src="/calander.webm"
                title="Events — drag me!"
                initialX={window.innerWidth/4 * 3}
                initialY={window.innerHeight/7 * 3}
                onActivate={() => setOpenAlready(prev => !prev)}
            />
        </>
    );
}

// ─── Floating Radio ─────────────────────────────────────────────────────────
export function FloatingRadio() {
    const [openAlready, setOpenAlready] = useState(false);

    return (
        <>
            <RadioButton headless={true} toggle={openAlready} />
            <DraggableIcon
                src="/radio.webm"
                title="Radio — drag me!"
                initialX={window.innerWidth/4 * 1}
                initialY={window.innerHeight/7 * 3}
                onActivate={() => setOpenAlready(prev => !prev)}
            />
        </>
    );
}