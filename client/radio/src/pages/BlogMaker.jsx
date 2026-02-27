import React, {useState} from 'react'
import {Rnd} from "react-rnd";
import MarkdownView from "react-showdown";
import DOMPurify from "dompurify";
import {motion} from 'motion/react'

const BlogMaker = () => {

    const [inputText, setInputText] = useState("");
    const handleChange = (e) => {
        setInputText(DOMPurify.sanitize(e.target.value));
    }
    const [state, setState] = useState({
        width: 200,
        height: 200,
        x: 100,
        y: 100,
    });

    return (
        <div>
        <Rnd
            size={{ width: state.width, height: state.height }}
            bounds="window"
            position={{ x: state.x, y: state.y }}
            onDragStop={(e, d) => {
                setState({ ...state, x: d.x, y: d.y });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                setState({
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                });
            }}
        >

            <div className='group border-2 border-gray-300 p-2 overflow bg-gray-200 h-full w-auto rounded-s'>
                <MarkdownView className='prose' markdown={inputText} />

                {/*
                <button className='opacity-0 group-hover:opacity-100
                absolute bottom-0 right-0
                rounded-full bg-gray-100 px-1
                transition-transform
                spring-bounce-60 spring-duration-300
                scale-x-50 translate-y-5
                group-hover:scale-x-100
                group-hover:translate-y-0
                '>
                    Edit </button>
                */}
                <motion.button className='hidden group-hover:block
                               absolute bottom-0 left-2
                               rounded-full bg-gray-100 px-1 translate-y-1'
                               whileInView={{ scale: 1.1, y:-10 }}
                               whileDrag={{ scale: 0.9 }}
                               transition={{
                                scale: {
                                   type: "spring",
                                   duration: 2,
                                   bounce: 0.8,
                               },
                                   y: {
                                       type: "spring",
                                       duration: 1,
                                       bounce: 0.8,
                                   }
                                }}
                >
                    Edit
                </motion.button>
            </div>
        </Rnd>
            <div className='absolute right align-middle'>
                <textarea type="text" value={inputText} onChange={handleChange}/>
            </div>
            {/*
            <button className='absolute p-5 m-5 bottom-0 spring-bounce-60 spring-duration-300 hover:scale-120 transition-transform rounded-full bg-gray-400'> jgiojfiew </button>
            */}
        </div>
    )
}
export default BlogMaker
