import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Flag, Trash2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminComments = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

    const [allComments, setAllComments]         = useState([]);
    const [flaggedComments, setFlaggedComments] = useState([]);
    const [showFlagged, setShowFlagged]         = useState(false);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') {
            fetchAll();
            fetchFlagged();
        }
    }, [userData]);

    const fetchAll = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/comments/all', { withCredentials: true });
            if (data.success) setAllComments(data.comments);
        } catch (err) { console.error(err.message); }
    };

    const fetchFlagged = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/comments/all?flagged=true', { withCredentials: true });
            if (data.success) setFlaggedComments(data.comments);
        } catch (err) { console.error(err.message); }
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/comments/admin/${id}`, { withCredentials: true });
            if (data.success) {
                setAllComments(prev => prev.filter(c => c._id !== id));
                setFlaggedComments(prev => prev.filter(c => c._id !== id));
                toast.success('Comment deleted');
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const displayed = showFlagged ? flaggedComments : allComments;
    const isAdmin = userData && userData.role === 'admin';

    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Comment Moderation</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={showFlagged ? 'outline' : 'default'}
                            onClick={() => setShowFlagged(false)}
                        >
                            All ({allComments.length})
                        </Button>
                        <Button
                            size="sm"
                            variant={showFlagged ? 'default' : 'outline'}
                            onClick={() => setShowFlagged(true)}
                            className={showFlagged ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                            <Flag className="size-4" /> Flagged ({flaggedComments.length})
                        </Button>
                    </div>

                    <ScrollArea className="h-[420px] pr-3">
                        {displayed.length === 0 ? (
                            <p className="text-center text-xs text-zinc-500 py-8">
                                {showFlagged ? 'No flagged comments.' : 'No comments yet.'}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {displayed.map(c => (
                                    <div
                                        key={c._id}
                                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs text-zinc-300 font-medium">
                                                        {c.author?.username || 'User'}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {formatDate(c.createdAt)}
                                                    </span>
                                                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5">
                                                        {c.targetType}
                                                    </span>
                                                    {c.flaggedBy?.length > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5">
                                                            <Flag className="size-3" /> {c.flaggedBy.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon-xs"
                                                onClick={() => handleDelete(c._id)}
                                                title="Delete"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-zinc-200 leading-relaxed break-words">{c.text}</p>
                                        {c.reactions?.some(r => r.users?.length > 0) && (
                                            <div className="flex flex-wrap gap-1">
                                                {c.reactions.filter(r => r.users?.length > 0).map(r => (
                                                    <span
                                                        key={r.emoji}
                                                        className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-full px-2 py-0.5"
                                                    >
                                                        {r.emoji} {r.users.length}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminComments;
