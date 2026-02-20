import MarkdownView from 'react-showdown';
import {useState} from "react";

const BlogEditor = () => {
    const [inputText, setInputText] = useState('');

    const handleChange = (e) => {
        setInputText(e.target.value);
    }

    return (
        <div style={{display: 'flex'}}>
            <div style={{width: '50%'}}>
                <textarea type="text" value={inputText} onChange={handleChange}
                    style={
                    {
                        width:'20vw',
                        height:'50vh',
                    }
                }/>
            </div>
            <div style = {{width:'20vw',
                height:'50vh'}}>
                <MarkdownView markdown={inputText} />
            </div>
        </div>
    );
};

export default BlogEditor;
