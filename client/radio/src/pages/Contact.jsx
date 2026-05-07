import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { X, Mail, ExternalLink } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function Contact() {
    const { backendUrl } = useContext(AppContext);
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/contacts');
                if (data.success) setMembers(data.contacts);
            } catch (err) { console.error(err.message); }
        };
        fetchContacts();
    }, []);

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Contact</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">The people behind the signal.</p>
                </CardHeader>

                <CardContent className="pt-4">
                    <ScrollArea className="h-[420px] pr-3">
                        {members.length === 0 ? (
                            <p className="text-center text-xs text-zinc-500 py-8">No contacts yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {members.map(member => (
                                    <MemberCard
                                        key={member._id}
                                        member={member}
                                        backendUrl={backendUrl}
                                        onClick={() => setSelected(member)}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {selected && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
                    onClick={() => setSelected(null)}
                >
                    <Card
                        className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-white relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="absolute top-2 right-2"
                            onClick={() => setSelected(null)}
                        >
                            <X />
                        </Button>
                        <CardHeader className="items-center text-center border-b border-zinc-800 pb-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500 bg-zinc-900 overflow-hidden mx-auto">
                                {selected.image ? (
                                    <img
                                        src={`${backendUrl}${selected.image}`}
                                        alt={selected.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-semibold text-red-400">
                                        {selected.initials || '?'}
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-xl mt-3">{selected.name}</CardTitle>
                            <CardDescription className="uppercase tracking-widest text-xs text-red-400 mt-1">
                                {selected.position}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {selected.email && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Email</p>
                                    <a
                                        href={`mailto:${selected.email}`}
                                        className="text-sm text-zinc-200 break-all hover:text-red-400 transition-colors inline-flex items-center gap-1"
                                    >
                                        <Mail className="size-3.5" />
                                        {selected.email}
                                    </a>
                                </div>
                            )}
                            {selected.link && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(selected.link, '_blank')}
                                >
                                    <ExternalLink className="size-4" /> Visit Link
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function MemberCard({ member, backendUrl, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-zinc-900 overflow-hidden mb-3">
                {member.image ? (
                    <img
                        src={`${backendUrl}${member.image}`}
                        alt={member.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-semibold text-red-400">
                        {member.initials || '?'}
                    </span>
                )}
            </div>
            <p className="text-sm font-semibold text-white text-center truncate max-w-full">
                {member.name}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 text-center mt-1 truncate max-w-full">
                {member.position}
            </p>
        </button>
    );
}

export default Contact;
