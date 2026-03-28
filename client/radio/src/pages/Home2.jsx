import React, {useState} from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { House, Book } from 'lucide-react';
import Login from '@/pages/Login.jsx'
import EmailVerify from "@/pages/EmailVerify.jsx";
import BlogGrid from "@/components/BlogGrid.jsx";
import BlogButton from "@/components/BlogButton.jsx";

const App = () => {
    const [showWindow, setShowWindow] = useState(1)
    const handleSwitch = (e, n) => {
        if(n == showWindow) {setShowWindow(null)}
        else{
            setShowWindow(n)
        }
    }

    return (
        <div>
            <House onClick={(e) => handleSwitch(e,1)}
                className='absolute left-5 top-15 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>

            <DraggableWindow visible={showWindow == 1}>
                <Login windowName='Login' spawnx={50} spawny={90}/>
                <EmailVerify windowName='Email Verify' spawnx={350} spawny={290} />
                <div className='text-4xl text-black top-5  w-full h-auto' spawnx={150} spawny={590}>Child 1 Content</div>
            </DraggableWindow>

            <BlogButton />
        </div>
    );
};

export default App;