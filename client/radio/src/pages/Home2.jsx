import React from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { House } from 'lucide-react';
import Login from '@/pages/Login.jsx'
import EmailVerify from "@/pages/EmailVerify.jsx";

const App = () => {
    return (
        <div>
            <h1>Draggable & Scalable Containers</h1>
            <DraggableWindow icon={
                <House className='absolute left-5 top-15 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>
            }>
                <Login windowName='Login' spawnx={50} spawny={90}/>
                <EmailVerify windowName='Email Verify' spawnx={350} spawny={290} />
                <div className='text-4xl text-black top-5  w-full h-auto' spawnx={150} spawny={590}>Child 1 Content</div>
            </DraggableWindow>
        </div>
    );
};

export default App;