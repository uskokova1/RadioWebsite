import React, { useContext, useEffect, useState } from 'react';
import { Contact } from 'lucide-react';
import axios from "axios";
import { AppContext } from "@/context/AppContext.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Avatar } from "@/components/ui/avatar.jsx";

const BlogButton = () => {
    const { backendUrl } = useContext(AppContext);
    const { addWindow, closeGroup } = useWindowManager(); // use the new WindowManager
    const [members, setMembers] = useState([]);
    const [randomY, setRandomY] = useState([]);

    const [openAlready, setOpenAlready] = useState(false);

    // Fetch members from backend
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/contacts`);
                if (data.success) setMembers(data.contacts);
            } catch (err) {
                console.error(err.message);
            }
        };
        fetchContacts();
    }, [backendUrl]);

    // Set random Y positions for staggered windows
    useEffect(() => {
        setRandomY(members.map(() => Math.random() * 300));
    }, [members]);

    // Open/close all contact windows (group 1)
    const toggleContacts = () => {
        if (members.length === 0) return;


        if(!openAlready) {
            setOpenAlready(true);
            members.forEach((member, index) => {
                addWindow({
                    windowName: 'contacts',
                    content: (
                        <Card className="flex px-5 rounded-none w-50">
                            <Avatar className="w-16 h-16 rounded-full bg-zinc-900 flex-row m-auto justify-center">
                                <p className="text-lg font-semibold text-white m-auto">{member.initials}</p>
                            </Avatar>
                            <CardTitle className="flex-row m-1 text-xl font-semibold">{member.name}</CardTitle>
                            <CardHeader className="flex-col text-gray-500">{member.position}</CardHeader>
                        </Card>
                    ),
                    spawnx: index * 220 + 70,
                    spawny: randomY[index] + 150,
                    group: 2, // all contact windows belong to group 2
                });
            });
        }else{
            setOpenAlready(false)
            closeGroup(2)
        }
    };

    return (
        <div>
            <Contact
                onClick={toggleContacts}
                className='absolute left-600 top-10 w-20 h-20 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'
            />
        </div>
    );
};

export default BlogButton;