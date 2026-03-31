import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";
import { AppContext } from "@/context/AppContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Flag, Trash2 } from "lucide-react"; // Lucide icons

function CommentSection({ targetType, targetId }) {
    const { userData, backendUrl } = useContext(AppContext);
    const isAdmin = userData?.isAdmin;

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axios.defaults.withCredentials = true;
        fetchComments();
    }, [targetId]);

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/comments/${targetType}/${targetId}`);
            if (data.success) setComments(data.comments);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${targetType}/${targetId}`,
                { text },
                { withCredentials: true }
            );
            if (data.success) {
                setComments([data.comment, ...comments]);
                setText("");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReact = async (commentId, emoji) => {
        if (!userData) return toast.error("Login to react");
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${commentId}/react`,
                { emoji },
                { withCredentials: true }
            );
            if (data.success) {
                setComments(
                    comments.map((c) => (c._id === commentId ? { ...c, reactions: data.reactions } : c))
                );
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleFlag = async (commentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${commentId}/flag`,
                {},
                { withCredentials: true }
            );
            data.success ? toast.success("Comment flagged") : toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const url = isAdmin
                ? `${backendUrl}/api/comments/admin/${commentId}`
                : `${backendUrl}/api/comments/${commentId}`;
            const { data } = await axios.delete(url, { withCredentials: true });
            if (data.success) {
                setComments(comments.filter((c) => c._id !== commentId));
                toast.success("Comment deleted");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="flex-col">
        <div className="flex-col border-t border-zinc-700 pt-4 bg-zinc-900 p-5 w-80">
            <p className="justify-self-center text-xs tracking-widest text-zinc-500 mb-2 font-mono">
                COMMENTS ({comments.length})
            </p>
            <ScrollArea className="h-[300px] rounded-md border border-zinc-700 p-3 mt-3">
                {comments.length === 0 && (
                    <p className="text-center text-zinc-500 text-sm py-5 font-mono tracking-wide">
                        No comments yet. Be the first.
                    </p>
                )}
                {comments.map((c) => (
                    <div key={c._id} className="bg-zinc-900 border border-zinc-800 rounded-md p-3 mb-2">
                        <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-zinc-500 font-mono tracking-wide">
                {c.author?.username || "User"} · {formatDate(c.createdAt)}
                  {c.flaggedBy?.length > 0 && (
                      <span className="text-red-600 ml-2">
                    <Flag className="inline w-3 h-3" /> {c.flaggedBy.length}
                  </span>
                  )}
              </span>

                            <div className="flex gap-1">
                                {userData && !isAdmin && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-zinc-400 border-zinc-600 hover:text-red-500 hover:border-red-500"
                                        onClick={() => handleFlag(c._id)}
                                        title="Flag comment"
                                    >
                                        <Flag className="w-4 h-4" />
                                    </Button>
                                )}
                                {(isAdmin || userData?._id === c.author?._id) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                        onClick={() => handleDelete(c._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-zinc-300 text-sm mb-2 leading-relaxed">{c.text}</p>

                        {/* reactions */}
                        <div className="flex gap-2 flex-wrap">
                            {c.reactions?.map((r) => {
                                const reacted = userData && r.users?.includes(userData._id);
                                return (
                                    <Button
                                        key={r.emoji}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReact(c._id, r.emoji)}
                                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
                                            reacted
                                                ? "bg-zinc-800 border-red-600 text-red-400"
                                                : "bg-zinc-900 border-zinc-700 text-zinc-400"
                                        }`}
                                    >
                                        {r.emoji} {r.users?.length > 0 && <span className="text-xs">{r.users.length}</span>}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
            {userData && (
                <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-zinc-900 border">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-red-600"
                        maxLength={500}
                    />
                    <Button type="submit" disabled={submitting}
                            className="right-0 h-auto [writing-mode:vertical-rl]
                            bg-red-600 hover:bg-red-700 text-white text-lg px-4">
                        {submitting ? "..." : "Post"}
                    </Button>
                </form>
            )}
        </div>
    );
}

export default CommentSection;