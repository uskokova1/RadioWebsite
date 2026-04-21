import React, { useContext, useEffect, useState } from 'react';
import { Contact } from 'lucide-react';
import axios from "axios";
import { AppContext } from "@/context/AppContext.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Avatar } from "@/components/ui/avatar.jsx";

export const CONTACTS_GROUP = 2;

export function buildContactWindows(members, randomY, backendUrl) {
    return members.map((member, index) => ({
        windowName: member.name,
        spawnx: index * 220 + 70,
        spawny: randomY[index] + 150,
        group: CONTACTS_GROUP,
        content: (
            <Card className="flex flex-col px-2 rounded-none w-50">
                <div className="flex m-auto justify-center">
                    {member.image ? (
                        <img className="aspect-square object-cover w-80"
                             src={`${backendUrl}${member.image}`} alt={member.name} />
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
    }));
}

const ContactsButton = () => {
    const { backendUrl } = useContext(AppContext);
    const { addWindow, closeGroup, windows } = useWindowManager();
    const [members, setMembers] = useState([]);
    const [randomY, setRandomY] = useState([]);

    useEffect(() => {
        axios.get(`${backendUrl}/api/contacts`)
            .then(({ data }) => { if (data.success) setMembers(data.contacts); })
            .catch(console.error);
    }, [backendUrl]);

    useEffect(() => {
        setRandomY(members.map(() => Math.random() * 300));
    }, [members]);

    const toggleContacts = () => {
        if (!members.length) return;
        if (windows.some(w => w.group === CONTACTS_GROUP)) {
            closeGroup(CONTACTS_GROUP);
        } else {
            buildContactWindows(members, randomY, backendUrl).forEach(w => addWindow(w));
        }
    };

    return (
        <button
            onClick={toggleContacts}
            title="Contacts"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <Contact className="size-6" />
        </button>
    );
};

export default ContactsButton;
