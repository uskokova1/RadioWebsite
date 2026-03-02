import React, { useState, useRef, useEffect } from "react";
import MarkdownView from "react-showdown";
import DOMPurify from "dompurify";
import Moveable from "react-moveable";

const BlogMaker = () => {
    const containerRef = useRef(null);
    const [target, setTarget] = useState(null);

    const [inputText, setInputText] = useState("");
    const [blocks, setBlocks] = useState([]);
    const [currentId, setCurrentId] = useState(null);

    const currentBlock = blocks.find(b => b.id === currentId);

    const handleChange = (e) => {
        const sanitized = DOMPurify.sanitize(e.target.value);
        setInputText(sanitized);

        setBlocks(prev =>
            prev.map(block =>
                block.id === currentId && block.type === "text"
                    ? { ...block, content: sanitized }
                    : block
            )
        );
    };

    const addTextBlock = () => {
        const newBlock = {
            id: crypto.randomUUID(),
            type: "text",
            x: 200,
            y: 200,
            width: 200,
            height: 200,
            content: "edit text"
        };

        setBlocks(prev => [...prev, newBlock]);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        const newBlock = {
            id: crypto.randomUUID(),
            type: "image",
            x: 200,
            y: 200,
            width: 300,
            height: 200,
            src: imageUrl
        };

        setBlocks(prev => [...prev, newBlock]);
    };

    const clickBox = (e, block) => {
        setCurrentId(block.id);
        setTarget(e.currentTarget);

        if (block.type === "text") {
            setInputText(block.content);
        }
    };

    const updateBlock = (id, updates) => {
        setBlocks(prev =>
            prev.map(block =>
                block.id === id ? { ...block, ...updates } : block
            )
        );
    };

    return (
        <div className="flex">
            <div
                ref={containerRef}
                className="polka relative m-5 rounded-2xl min-w-190 max-w-190 min-h-screen shadow-md"
            >
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        onClick={(e) => clickBox(e, block)}
                        style={{
                            position: "absolute",
                            left: block.x,
                            top: block.y,
                            width: block.width,
                            height: block.height,
                        }}
                    >
                        {block.type === "text" && (
                            <div className="bg-gray-200 p-2 h-full">
                                <MarkdownView
                                    className="prose"
                                    markdown={block.content}
                                />
                            </div>
                        )}

                        {block.type === "image" && (
                            <img
                                draggable={false}
                                src={block.src}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}

                {currentBlock && (
                    <Moveable
                        target={target}
                        container={containerRef.current}
                        draggable={true}
                        resizable={true}
                        bounds={{ element: containerRef.current }}

                        onDragStart={({ set }) => {
                            set([currentBlock.x, currentBlock.y]);
                        }}

                        onDrag={({ target, beforeTranslate }) => {
                            target.style.left = `${beforeTranslate[0]}px`;
                            target.style.top = `${beforeTranslate[1]}px`;
                        }}

                        onDragEnd={({ lastEvent }) => {
                            if (!lastEvent) return;

                            updateBlock(currentId, {
                                x: lastEvent.beforeTranslate[0],
                                y: lastEvent.beforeTranslate[1],
                            });
                        }}

                        onResizeStart={({ setOrigin, dragStart }) => {
                            setOrigin(["%", "%"]);
                            if (dragStart) {
                                dragStart.set([currentBlock.x, currentBlock.y]);
                            }
                        }}

                        onResize={({ target, width, height, drag }) => {
                            target.style.width = `${width}px`;
                            target.style.height = `${height}px`;
                            target.style.left = `${drag.beforeTranslate[0]}px`;
                            target.style.top = `${drag.beforeTranslate[1]}px`;
                        }}

                        onResizeEnd={({ lastEvent }) => {
                            if (!lastEvent) return;

                            updateBlock(currentId, {
                                width: lastEvent.width,
                                height: lastEvent.height,
                                x: lastEvent.drag.beforeTranslate[0],
                                y: lastEvent.drag.beforeTranslate[1],
                            });
                        }}
                    />
                )}
            </div>

            <div className="flex-col p-10 w-max">
                {currentBlock?.type === "text" && (
                    <textarea
                        rows={17}
                        className="flex bg-gray-100 rounded-3xl p-5"
                        value={inputText}
                        onChange={handleChange}
                    />
                )}

                <button
                    className="flex p-5 m-5 rounded-full bg-gray-200 hover:scale-110 transition-transform"
                    onClick={addTextBlock}
                >
                    add text box
                </button>

                <input
                    type="file"
                    className="flex p-5 m-5 rounded-full bg-gray-200"
                    onChange={handleImageUpload}
                />
            </div>
        </div>
    );
};

export default BlogMaker;