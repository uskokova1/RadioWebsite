import React, { useState, useRef } from 'react';
import Moveable from 'react-moveable';
import { motion } from "motion/react"

const DraggableWindow = ({ icon, children }) => {
    const [showContainers, setShowContainers] = useState(false);


    const [target,  setTarget] = useState(null);
    const [dragTarget,  setDragTarget] = useState(null);

    const handleToggle = () => {
        setShowContainers(prev => !prev);
    };

    const handleCloseAll = () => {
        setShowContainers(false);
    };


        return (
        <div>
            {/* Decoupled icon to toggle visibility */}
            <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
                {icon}
            </div>

            {/* Render containers if visible */}
            {showContainers && (
                <>
                    {React.Children.map(children, (child, index) => (
                        <div
                            key={index}
                             style={{
                                 position: 'absolute',
                                 top: child.props.spawnx,
                                 left: child.props.spawny,
                                 zIndex: index,
                             }}
                            onMouseEnter={(e) => {
                                setTarget(e.currentTarget)
                            }}
                            className='flex-col'
                        >
                        <motion.div
                            initial={{ scaleY: 0.5 }}
                            animate={{ scaleY: 1 }}
                            transition={{ type: "spring" }}
                            className='border-amber-50 border-2 bg-white rounded-md'
                        >
                            <div
                                className='flex-col align-top w-full h-8 bg-red-400 rounded-t-md'
                                onMouseEnter ={(e) => {
                                    setDragTarget(e.currentTarget)
                                }}
                            >
                                <h1 className='px-4 py-1'> {child.props.windowName} </h1>
                                {/* Close icon inside each container */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        cursor: 'pointer',
                                        background: 'red',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        textAlign: 'center',
                                        lineHeight: '20px',
                                        fontSize: '14px',
                                    }}
                                    onClick={handleCloseAll}
                                >
                                    &times;
                                </div>
                            </div>

                            {/* Render the child content */}
                            <div className='flex-col justify-center'>
                                {child}
                            </div>
                        </motion.div>
                        </div>
                    ))}

                    {/* Moveable component for dragging/scaling */}
                    <Moveable
                            target={target}
                            dragTarget={dragTarget}
                            draggable={true}
                            //resizable={true}
                            origin={false}
                            hideDefaultLines={true}
                            onDragStart={(e) => {
                                e.target.style.zIndex = children.length;

                            }}
                            onDragEnd={(e) => {
                                //e.target.style.zIndex = e.target.style.zIndex-1;
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
        </div>
    );
};

export default DraggableWindow;