import React, {useContext, useEffect, useState} from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { Contact } from 'lucide-react';
import axios from "axios";
import {AppContext} from "@/context/AppContext.jsx";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import {Avatar} from "@/components/ui/avatar.jsx"
import {Tooltip} from "@/components/ui/tooltip.jsx"


const BlogButton = () => {
    const [showWindow, setShowWindow] = useState(1)

    const handleSwitch = (e, n) => {
        if(n == showWindow) {setShowWindow(null)}
        else{
            setShowWindow(n)
        }
    }

    const { backendUrl } = useContext(AppContext);
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [randomY, setRandomY] = useState(null);


    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/contacts');
                if (data.success) setMembers(data.contacts);
            } catch (err) {
                console.error(err.message);
            }
        };
        fetchContacts();
    }, []);

    useEffect(() => {
         setRandomY(members.map(() => Math.random()*300))
        console.log(randomY)
    }, [members])


    return (
        <div>
            <Contact onClick={(e) => handleSwitch(e,0)}
                  className='absolute left-5 top-45 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>
            <DraggableWindow visible={showWindow == 0}>
                    {members.map((member,index) => (
                        <Card spawnx={index*220+70} spawny={randomY[index]+150} windowName='contacts' className='flex px-5 rounded-none w-50'>
                            <Avatar className="w-16 h-16 rounded-full bg-zinc-900 flex-row m-auto justify-center">
                                <p1 className="text-lg font-semibold text-white align m-auto">{member.initials}</p1>
                            </Avatar>
                            <CardTitle className="flex-row m-1 text-xl font-semibold">{member.name}</CardTitle>

                            <CardHeader className="flex-col text-gray-500">{member.position}</CardHeader>


                        </Card>))}
                    </DraggableWindow>
                        </div>

    );
};

export default BlogButton;