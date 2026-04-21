import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Flag, Trash2, Send } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CommentSection({ targetType, targetId }) {
    const { backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const [comments, setComments]     = useState([]);
    const [text, setText]             = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [popping, setPopping]       = useState({});

    useEffect(() => { fetchComments(); }, [targetId]);

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comments/${targetType}/${targetId}`);
            if (data.success) setComments(data.comments);
        } catch (err) { console.error(err.message); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${targetType}/${targetId}`,
                { text }, { withCredentials: true }
            );
            if (data.success) { setComments([data.comment, ...comments]); setText(""); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleReact = async (commentId, emoji) => {
        if (!userData) return toast.error("Login to react");
        const key = `${commentId}:${emoji}`;
        setPopping(p => ({ ...p, [key]: true }));
        setTimeout(() => setPopping(p => ({ ...p, [key]: false })), 300);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${commentId}/react`,
                { emoji }, { withCredentials: true }
            );
            if (data.success) {
                setComments(comments.map(c =>
                    c._id === commentId ? { ...c, reactions: data.reactions } : c
                ));
            } else { toast.error(data.message); }
        } catch (err) { toast.error(err.message); }
    };

    const handleFlag = async (commentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${commentId}/flag`,
                {}, { withCredentials: true }
            );
            data.success ? toast.success("Comment flagged for review") : toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDelete = async (commentId) => {
        try {
            const url = isAdmin
                ? `${backendUrl}/api/comments/admin/${commentId}`
                : `${backendUrl}/api/comments/${commentId}`;
            const { data } = await axios.delete(url, { withCredentials: true });
            if (data.success) {
                setComments(comments.filter(c => c._id !== commentId));
                toast.success("Comment deleted");
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const hasReacted = (reaction) => {
        if (!userData?._id) return false;
        return reaction.users?.some(id => id.toString() === userData._id.toString());
    };

    const isOwnComment = (c) =>
        userData && c.author?._id && userData._id?.toString() === c.author._id.toString();

    return (
        <div className="mt-4 border-t border-zinc-800 pt-4 space-y-3">
            <style>{`
                @keyframes pop {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(1.35); }
                    70%  { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .reaction-pop { animation: pop 0.3s ease; }
            `}</style>

            <p className="text-xs uppercase tracking-widest text-zinc-500 mx-3">
                Comments ({comments.length})
            </p>


            <ScrollArea className="h-[260px] rounded-md border border-zinc-800 p-2">
                {comments.length === 0 && (
                    <p className="text-center text-xs text-zinc-500 py-8">
                        No comments yet. Be the first.
                    </p>
                )}

                <div className="space-y-2">
                    {comments.map(c => (
                        <div
                            key={c._id}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                    <span className="text-xs text-zinc-400 font-medium">
                                        {c.author?.username || 'User'}
                                    </span>
                                    <span className="text-xs text-zinc-600 ml-2">
                                        {formatDate(c.createdAt)}
                                    </span>
                                    {c.flaggedBy?.length > 0 && isAdmin && (
                                        <span className="inline-flex items-center gap-1 ml-2 text-xs text-red-500">
                                            <Flag className="size-3" /> {c.flaggedBy.length}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-1 shrink-0">
                                    {userData && !isAdmin && !isOwnComment(c) && (
                                        <Button
                                            variant="outline"
                                            size="icon-xs"
                                            title="Flag as inappropriate"
                                            onClick={() => handleFlag(c._id)}
                                            className="text-zinc-400 hover:text-red-500 hover:border-red-500/50"
                                        >
                                            <Flag />
                                        </Button>
                                    )}
                                    {userData && (isAdmin || isOwnComment(c)) && (
                                        <Button
                                            variant="destructive"
                                            size="icon-xs"
                                            title="Delete"
                                            onClick={() => handleDelete(c._id)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-zinc-200 leading-relaxed mb-2 break-words">
                                {c.text}
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                                {c.reactions?.map(r => {
                                    const active = hasReacted(r);
                                    const key    = `${c._id}:${r.emoji}`;
                                    const isPop  = popping[key];
                                    return (
                                        <button
                                            key={r.emoji}
                                            className={[
                                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                                                active
                                                    ? 'border-red-500/60 bg-red-500/15 text-red-400'
                                                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800',
                                                isPop ? 'reaction-pop' : '',
                                            ].join(' ')}
                                            onClick={() => handleReact(c._id, r.emoji)}
                                            title={active ? "Remove reaction" : "React"}
                                        >
                                            <span className="text-sm leading-none">{r.emoji}</span>
                                            {r.users?.length > 0 && (
                                                <span className="font-mono">{r.users.length}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            {userData ? (
                <form onSubmit={handleSubmit} className="flex gap-2 m-3">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={500}
                        className="flex-1 bg-zinc-800 p-1 rounded-xl"
                    />
                    <Button type="submit" disabled={submitting || !text.trim()}>
                        <Send className="size-4" />
                        {submitting ? "..." : "Post"}
                    </Button>
                </form>
            ) : (
                <p className="text-xs text-zinc-500">Log in to leave a comment.</p>
            )}
        </div>
    );
}
