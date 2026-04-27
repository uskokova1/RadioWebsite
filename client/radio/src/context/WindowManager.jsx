import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Moveable from 'react-moveable';
import { motion, AnimatePresence } from 'motion/react';
import { SquareX } from 'lucide-react';
import useSound from 'use-sound';

import closeSfx from '/flora bubble pop low.ogg'
import openSfx from '/flora bubble pop high.ogg'

// --- CONTEXT SETUP ---
const WindowManagerContext = createContext();

export const useWindowManager = () => useContext(WindowManagerContext);

export const WindowManagerProvider = ({ children }) => {
    const [playOpen] = useSound(openSfx, { volume: 0.5 });

    const [windows, setWindows] = useState([]);
    const [groups, setGroups] = useState([]);
    // Ever-increasing counter so windows always stack above floating 3-D icons (z: 5)
    const zCounter = useRef(10);

    useEffect(() => {
        playOpen();
    }, [groups])

    const addWindow = (windowProps) => {
        const { group } = windowProps;
        if (group) {
            setGroups((prev) => [...prev, group]);
            setWindows(prev => prev.filter(w => !w.group || w.group === group));
        }
        const id     = crypto.randomUUID();
        const zIndex = ++zCounter.current;
        setWindows(prev => [...prev, { id, ...windowProps, zIndex }]);
    };

    const removeWindow = (id) => {
        setWindows(prev => prev.filter(win => win.id !== id));
    };

    const bringToFront = (id) => {
        const zIndex = ++zCounter.current;
        setWindows(prev => prev.map(win => win.id === id ? { ...win, zIndex } : win));
    };

    const closeGroup = (groupId) => {
        setWindows(prev => prev.filter(w => w.group !== groupId));
    };

    return (
        <WindowManagerContext.Provider value={{ windows, addWindow, removeWindow, bringToFront, closeGroup}}>
            {children}
        </WindowManagerContext.Provider>
    );
};

// --- WINDOW COMPONENT ---
const Window = ({ id, windowName, children, spawnx = 0, spawny = 0, zIndex, group }) => {
    const [playClose] = useSound(closeSfx, { volume: 0.5 });

    const { closeGroup, bringToFront } = useWindowManager();
    const windowRef = useRef(null);
    const dragHandleRef = useRef(null);
    const curChildren = useRef(null);
    const [target, setTarget] = useState(null);
    const [dragTarget, setDragTarget] = useState(null);

    return (
        <div
            data-id={id}
            style={{
                position: 'absolute',
                top: spawny,
                left: spawnx,
                zIndex: zIndex,
            }}
            className="flex-col relative drop-shadow-2xl drop-shadow-black"
            onMouseEnter={(e) => {
                setTarget(e.currentTarget);
            }}
        >
            <motion.div
                initial={{ scaleY: 0.5, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                ref={windowRef}
                className="rounded-lg overflow-hidden shadow-2xl"
                style={{
                    backgroundColor: 'rgba(9, 9, 11, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                }}
            >
                <div
                    ref={dragHandleRef}
                    className="flex items-center justify-between h-10 px-3 cursor-move select-none bg-zinc-900/80 border-b border-zinc-800"
                    onMouseEnter={(e) => {
                        setDragTarget(e.currentTarget);
                    }}
                >
                    <h1 className="text-xs uppercase tracking-widest text-zinc-300 font-medium">
                        {windowName}
                    </h1>
                    <SquareX
                        className="size-6 text-zinc-400 hover:text-red-500 cursor-pointer transition-colors"
                        // onMouseDown={e => {e.stopPropagation(); closeGroup(group)}}
                        onClick={() => {closeGroup(group); playClose()}
                    }
                    />
                </div>
                <div
                    ref={curChildren}
                    className="flex-col justify-center z-50">{children}</div>
            </motion.div>

            <Moveable
                target={target}
                dragTarget={dragHandleRef}
                draggable={true}
                origin={false}
                hideDefaultLines={true}
                onDragStart={(e) => bringToFront(id)}
                onDrag={e => {
                    e.target.style.transform = e.transform;
                }}
            />
        </div>
    );
};

// --- WINDOW MANAGER RENDERER ---
export const WindowManager = () => {
    const { windows } = useWindowManager();

    return (
        <AnimatePresence>
            {windows.map(win => (
                <Window key={win.id} {...win}>
                    {win.content}
                </Window>
            ))}
        </AnimatePresence>
    );
};
