import React, {useEffect, useState} from 'react'
import {Rnd} from "react-rnd";
import MarkdownView from "react-showdown";
import DOMPurify from "dompurify";
import {motion} from 'motion/react'

const BlogMaker = () => {

    const [inputText, setInputText] = useState("");
    const [currIndex, setCurrIndex] = useState(0);

    const [textBoxes, setTextBoxes] = useState([]);
    const handleChange = (e) => {
        const sanitized = DOMPurify.sanitize(e.target.value);

        setInputText(sanitized);

        setTextBoxes(prev =>
            prev.map((box, i) =>
                i === currIndex
                    ? { ...box, text: sanitized }
                    : box
            )
        );
    }
    const addTextBox = (e) => {
        setTextBoxes([...textBoxes, {
            x: 200,
            y:200,
            width: 200,
            height: 200,
            text: 'edit text'
        }]);
    }
    const clickTextBox = (e, index) => {
        setCurrIndex(index);
        setInputText(textBoxes[index].text)
    }


    return (
    <div className='flex'>
        <div className='polka justify-self-center m-5 rounded-2xl w-full max-w-[760px] min-h-screen flex-col gap-0 shadow-md'>

            {textBoxes.map((box, index) => (
                <Rnd
                    bounds="parent"
                    key={index}
                    position={{ x: box.x, y: box.y }}
                    size={{ width: box.width, height: box.height }}
                    onDragStop={(e, d) => {
                        const updated = [...textBoxes];
                        updated[index].x = d.x;
                        updated[index].y = d.y;
                        setTextBoxes(updated);
                    }}
                    onResizeStop={(e, dir, ref, delta, pos) => {
                        const updated = [...textBoxes];
                        updated[index].x = pos.x;
                        updated[index].y = pos.y;
                        updated[index].width = ref.offsetWidth;
                        updated[index].height = ref.offsetHeight;
                        setTextBoxes(updated);
                    }}
                    onClick={(e) => clickTextBox(e, index)}
                >
                    <div className='group hover:outline-4 hover:outline-dashed
            outline-gray-300 p-2 overflow-clip bg-gray-200 h-full w-auto rounded-s'
                    >
                    <MarkdownView options={{ simpleLineBreaks: true }}
                                  className='prose' markdown={textBoxes[index].text} />
                    </div>
                </Rnd>
            ))}

            {/*
            <Rnd
            size={{ width: state.width, height: state.height }}
            bounds="parent"
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

                <motion.button className='hidden group-hover:block
                               absolute bottom-0 left-2
                               rounded-full bg-gray-100 px-1 translate-y-1'
                               whileInView={{ scale: 1.1, y:-10 }}
                               whileDrag={{ scale: 0.9 }}
                               transition={{
                                scale: {
                                   type: "spring",
                                   duration: 3,
                                   bounce: 0.8,
                               },
                                   y: {
                                       type: "spring",
                                       duration: 0.7,
                                       bounce: 0.6,
                                   }
                                }}
                >
                    Edit
                </motion.button>
        </Rnd>
        */}

        </div>
        <div className='flex-col p-10 w-max justify-center align-center'>
            <textarea rows={17} className='flex bg-gray-100 rounded-3xl p-5 field-sizing-content'
                type="text" value={inputText} onChange={handleChange}/>
            <button
                className='flex p-5 m-5 bottom-0 spring-bounce-60 spring-duration-300 hover:scale-110 transition-transform rounded-full bg-gray-200'
                onClick={addTextBox}
            >
                add text box </button>
            <button
                className='flex p-5 m-5 bottom-0 spring-bounce-60 spring-duration-300 hover:scale-110 transition-transform rounded-full bg-gray-200'
                onClick={addTextBox}
            >
                add img </button>
        </div>
    </div>
    )
}
export default BlogMaker
