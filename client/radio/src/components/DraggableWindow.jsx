import React, {useState, useRef, useEffect} from 'react';
import Moveable from 'react-moveable';
import { motion, AnimatePresence } from "motion/react";
import { SquareX } from 'lucide-react';

const DraggableWindow = ({ icon, children, visible }) => {
    const [showContainers, setShowContainers] = useState(true);
    const [target, setTarget] = useState(null);
    const [dragTarget, setDragTarget] = useState(null);

    const [zs, setzs] = useState(React.Children.toArray(children).map((child,index) => index));

    useEffect(() => {
        setShowContainers(visible)
    }, [visible]);

    /*
    const handleToggle = () => {
        setShowContainers(prev => !prev);
    };
     */

    const handleCloseAll = () => {
        setShowContainers(false);
    };

    const handleZs = (key) => {
        const newZs = zs.map((z,index) => {
            if (index == key) {
                return zs.length;
            }else{
                return z-1;
            }
        })
        setzs(newZs);
    }

    return (
        <div>
            {/* Decoupled icon to toggle visibility
            <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
                {icon}
            </div>*/}

            {/* Render containers if visible */}
            <AnimatePresence>
                {showContainers && (
                    <>
                        {React.Children.map(children, (child, index) => (
                            <div
                                key={index}
                                data-keyforz={index}
                                style={{
                                    position: 'absolute',
                                    top: child.props.spawny || 0,
                                    left: child.props.spawnx || 0,
                                    zIndex: zs[index]
                                }}
                                onMouseEnter={(e) => {
                                    setTarget(e.currentTarget);
                                }}
                                className='flex-col transform-none relative'
                            >
                                <motion.div
                                    key={index}
                                    initial={{ scaleY: 0.5 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    transition={{ type: "spring", duration: .5 }}
                                    className='border-amber-50 border-2 bg-white rounded-md'
                                >
                                    <div
                                        className='flex-col align-top w-full h-8 bg-red-400 rounded-t-md'
                                        onMouseEnter={(e) => {
                                            setDragTarget(e.currentTarget);
                                        }}
                                    >
                                        <h1 className='px-4 py-1'>{child.props.windowName}</h1>
                                        {/* Close icon inside each container */}
                                        <SquareX
                                            className='absolute right-0 top-0 scale-140 m-1 bg-red-700'
                                            onClick={handleCloseAll}
                                        />
                                    </div>

                                    {/* Render the child content */}
                                    <div className='flex-col justify-center'>
                                        {child}
                                    </div>
                                </motion.div>
                            </div>
                        ))}


                        <Moveable
                                target={target} // Attach Moveable to the specific child element
                                dragTarget={dragTarget}
                                draggable={true}
                                origin={false}
                                //resizable={true}
                                hideDefaultLines={true}
                                onDragStart={(e) => {
                                    handleZs(e.target.dataset.keyforz)
                                }}
                                onDrag={e => {
                                    e.target.style.transform = e.transform;
                                }}
                                onResize={e => {
                                    e.target.style.width = `${e.width}px`;
                                    e.target.style.height = `${e.height}px`;
                                    e.target.style.transform = e.drag.transform;
                                }}
                            />

                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DraggableWindow;