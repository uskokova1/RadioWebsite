import React, { useContext, useEffect, useState } from 'react';
import { Contact } from 'lucide-react';
import axios from "axios";
import { AppContext } from "@/context/AppContext.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Avatar } from "@/components/ui/avatar.jsx";

const ContactsButton = () => {
    const { backendUrl } = useContext(AppContext);
    const { addWindow, closeGroup } = useWindowManager();
    const [members, setMembers] = useState([]);
    const [randomY, setRandomY] = useState([]);

    const [openAlready, setOpenAlready] = useState(false);

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

    useEffect(() => {
        setRandomY(members.map(() => Math.random() * 300));
    }, [members]);

    const toggleContacts = () => {
        if (members.length === 0) return;

        if(!openAlready) {
            setOpenAlready(true);
            members.forEach((member, index) => {
                addWindow({
                    windowName: member.name,
                    content: (
                        <Card
                            style={{
                                backgroundColor: 'rgba(255, 50, 47, 0.0)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            className="flex flex-col px-2 rounded-none w-50">
                            <div className="flex m-auto justify-center">
                                {member.image ? (
                                    <img className="rounded-2xl aspect-square object-cover w-80" src={`${backendUrl}${member.image}`} alt={member.name} />
                                ) : (
                                    <Avatar className="w-16 h-16 rounded-full bg-zinc-900 flex-row m-auto justify-center">
                                        <p className="text-lg font-semibold text-white m-auto">{member.initials || '?'}</p>
                                    </Avatar>
                                )}
                            </div>
                            <CardTitle className="flex-row m-auto justify-self-center text-xl font-semibold">{member.name}</CardTitle>
                            <CardHeader className="flex-col text-gray-500">{member.position}</CardHeader>
                            {member.link && (
                                <CardFooter className="flex flex-col p-3">
                                    <a href={member.link} target="_blank" rel="noreferrer"
                                       className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                        &rarr; View Link
                                    </a>
                                </CardFooter>
                            )}
                        </Card>
                    ),
                    spawnx: index * 220 + 70,
                    spawny: randomY[index] + 150,
                    group: 2,
                });
            });
        }else{
            setOpenAlready(false)
            closeGroup(2)
        }
    };

    return (
        <div>
            <video
                autoPlay={true}
                muted={true}
                loop={true}
                src='/contact.webm'
                onClick={toggleContacts}
                className='absolute left-5 top-45 scale-60
                hover:scale-65 transition-all spring-duration-300 spring-bounce-60'
            />
        </div>
    );
};

export default ContactsButton;
