import React, { createContext, useContext, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import { motion, AnimatePresence } from 'motion/react';
import { SquareX } from 'lucide-react';

// --- CONTEXT SETUP ---
const WindowManagerContext = createContext();

export const useWindowManager = () => useContext(WindowManagerContext);

export const WindowManagerProvider = ({ children }) => {
    const [windows, setWindows] = useState([]);

    const addWindow = (windowProps) => {
        const id = crypto.randomUUID(); // unique id
        setWindows(prev => [...prev, { id, ...windowProps, zIndex: prev.length + 1 }]);
    };

    const removeWindow = (id) => {
        setWindows(prev => prev.filter(win => win.id !== id));
    };

    const bringToFront = (id) => {
        setWindows(prev => {
            const maxZ = prev.length;
            return prev.map(win => {
                if (win.id === id) return { ...win, zIndex: maxZ };
                return { ...win, zIndex: win.zIndex > 0 ? win.zIndex - 1 : 0 };
            });
        });
    };

    const closeGroup = (groupId) => {
        setWindows(prev => prev.filter(w => w.group !== groupId));
    };

    return (
        <WindowManagerContext.Provider value={{ windows, addWindow, removeWindow, bringToFront, closeGroup }}>
            {children}
        </WindowManagerContext.Provider>
    );
};

// --- WINDOW COMPONENT ---
const Window = ({ id, windowName, children, spawnx = 0, spawny = 0, zIndex, group  }) => {
    const { closeGroup, removeWindow, bringToFront } = useWindowManager();
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
            onMouseEnter={(e) => {
                setTarget(e.currentTarget);
            }}
            className="flex-col relative"
        >
            <motion.div
                initial={{ scaleY: 0.5 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="border-amber-50 border-2 bg-white rounded-md"
                ref={setTarget}
                style={{
                    backgroundColor: 'rgba(255, 50, 47, 0.0)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
            >
                <div
                    style={{
                        backgroundColor: 'rgba(255, 50, 47, 0.5)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                    className="flex-col align-top w-full h-8 rounded-t-md relative cursor-move"
                    onMouseEnter={(e) => {
                        setDragTarget(e.currentTarget);
                    }}
                >
                    <h1 className="px-4 py-1">{windowName}</h1>
                    <SquareX
                        className="absolute right-0 top-0 scale-140 m-1 bg-transparent cursor-pointer"
                        onClick={() => closeGroup(group)}
                    />
                </div>
                <div className="flex-col justify-center">{children}</div>
            </motion.div>

            <Moveable
                target={target}
                dragTarget={dragTarget}
                draggable={true}
                origin={false}
                hideDefaultLines={true}
                onDragStart={() => bringToFront(id)}
                bounds={{"left":0,"top":0,"right":500,"bottom":500}}
                onDrag={e => {
                    e.target.style.transform = e.transform;
                }}
                onResize={e => {
                    e.target.style.width = `${e.width}px`;
                    e.target.style.height = `${e.height}px`;
                    e.target.style.transform = e.drag.transform;
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