import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            } else {
                toast.error(data.message);
            }
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
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const hasReacted = (reaction) => {
        if (!userData?._id) return false;
        return reaction.users?.some(id => id.toString() === userData._id.toString());
    };

    return (
        <div style={cs.wrap}>
            <style>{`
                @keyframes pop {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(1.35); }
                    70%  { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .reaction-pop { animation: pop 0.3s ease; }
            `}</style>

            <p style={cs.label}>COMMENTS ({comments.length})</p>

            {userData ? (
                <form onSubmit={handleSubmit} style={cs.form}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Write a comment..."
                        style={cs.input}
                        maxLength={500}
                    />
                    <button type="submit" style={cs.submitBtn} disabled={submitting}>
                        {submitting ? "..." : "Post"}
                    </button>
                </form>
            ) : (
                <p style={cs.loginHint}>Log in to leave a comment.</p>
            )}

            <ScrollArea className="h-[300px] rounded-md border border-zinc-700 p-3 mt-3">
                {comments.length === 0 && <p style={cs.empty}>No comments yet. Be the first.</p>}
                {comments.map(c => (
                    <div key={c._id} style={cs.comment}>
                        <div style={cs.commentHeader}>
                            <span style={cs.commentMeta}>
                                {c.author?.username || 'User'}&nbsp;·&nbsp;{formatDate(c.createdAt)}
                                {c.flaggedBy?.length > 0 && isAdmin && (
                                    <span style={cs.flagBadge}>&nbsp;⚑ {c.flaggedBy.length}</span>
                                )}
                            </span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {userData && !isAdmin && (
                                    <button
                                        title="Flag as inappropriate"
                                        onClick={() => handleFlag(c._id)}
                                        style={cs.iconBtn}
                                    >⚑</button>
                                )}
                                {userData && (isAdmin || userData._id?.toString() === c.author?._id?.toString()) && (
                                    <button
                                        onClick={() => handleDelete(c._id)}
                                        style={{ ...cs.iconBtn, color: '#fa4040' }}
                                    >✕</button>
                                )}
                            </div>
                        </div>

                        <p style={cs.commentText}>{c.text}</p>

                        <div style={cs.reactions}>
                            {c.reactions?.map(r => {
                                const active = hasReacted(r);
                                const key    = `${c._id}:${r.emoji}`;
                                const isPop  = popping[key];
                                return (
                                    <button
                                        key={r.emoji}
                                        className={isPop ? 'reaction-pop' : ''}
                                        onClick={() => handleReact(c._id, r.emoji)}
                                        style={{
                                            ...cs.reactionBtn,
                                            background:  active ? '#3d1f1f' : '#1a1a1a',
                                            borderColor: active ? '#fa4040' : '#333',
                                            color:       active ? '#fa4040' : '#888',
                                        }}
                                        title={active ? "Remove reaction" : "React"}
                                    >
                                        <span style={cs.reactionEmoji}>{r.emoji}</span>
                                        {r.users?.length > 0 && (
                                            <span style={{
                                                ...cs.reactionCount,
                                                color:      active ? '#fa4040' : '#777',
                                                fontWeight: active ? 'bold' : 'normal',
                                            }}>
                                                {r.users.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}

const cs = {
    wrap:         { marginTop: '16px', borderTop: '1px solid #2a2a2a', paddingTop: '16px' },
    label:        { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '4px', color: '#555', margin: '0 0 10px 0' },
    form:         { display: 'flex', gap: '8px', marginBottom: '4px' },
    input:        { flex: 1, fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#f5f0e8', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '8px 10px', outline: 'none' },
    submitBtn:    { fontFamily: "'Courier New', monospace", fontSize: '10px', letterSpacing: '1px', color: '#fff', background: '#fa4040', border: 'none', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer' },
    loginHint:    { fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#555', letterSpacing: '1px', margin: '0 0 8px 0' },
    empty:        { fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#444', letterSpacing: '2px', textAlign: 'center', padding: '20px 0' },
    comment:      { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '10px 12px', marginBottom: '8px' },
    commentHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
    commentMeta:  { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '2px', color: '#555' },
    flagBadge:    { color: '#fa4040' },
    commentText:  { fontFamily: "'Georgia', serif", fontSize: '13px', color: '#bbb', margin: '4px 0 10px 0', lineHeight: '1.5' },
    reactions:    { display: 'flex', gap: '5px', flexWrap: 'wrap' },
    reactionBtn:  { display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #333', borderRadius: '20px', padding: '3px 9px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s', background: '#1a1a1a' },
    reactionEmoji:{ fontSize: '14px', lineHeight: 1 },
    reactionCount:{ fontFamily: "'Courier New', monospace", fontSize: '11px' },
    iconBtn:      { background: 'transparent', border: '1px solid #333', borderRadius: '3px', color: '#555', fontSize: '10px', cursor: 'pointer', padding: '2px 6px', lineHeight: 1 },
};
