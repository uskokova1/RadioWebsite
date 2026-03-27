import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminComments = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [allComments,     setAllComments]     = useState([]);
    const [flaggedComments, setFlaggedComments] = useState([]);
    const [showFlagged,     setShowFlagged]     = useState(false);

    useEffect(() => {
        if (!userData) getUserData();
    }, []);

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/');
            toast.error('Not an admin');
        } else if (userData) {
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
            } else {
                toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const displayed = showFlagged ? flaggedComments : allComments;

    const CommentRow = ({ c }) => (
        <div style={styles.comment}>
            <div style={styles.commentHeader}>
                <div>
                    <span style={styles.commentMeta}>
                        {c.author?.username || 'User'} · {formatDate(c.createdAt)}
                    </span>
                    <span style={styles.targetBadge}> [{c.targetType}]</span>
                    {c.flaggedBy?.length > 0 && (
                        <span style={styles.flagBadge}> ⚑ {c.flaggedBy.length} flag(s)</span>
                    )}
                </div>
                <button onClick={() => handleDelete(c._id)} style={styles.deleteBtn}>Delete</button>
            </div>
            <p style={styles.commentText}>{c.text}</p>
            <div style={styles.reactions}>
                {c.reactions?.filter(r => r.users?.length > 0).map(r => (
                    <span key={r.emoji} style={styles.reactionChip}>{r.emoji} {r.users.length}</span>
                ))}
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')}
                            className='flex rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft /> Back
                    </button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>Comment Moderation</h2>
                </div>

                <div style={styles.body}>
                    {/* toggle */}
                    <div style={styles.toggleRow}>
                        <button
                            onClick={() => setShowFlagged(false)}
                            style={{ ...styles.toggleBtn, ...(showFlagged ? {} : styles.toggleActive) }}
                        >
                            All Comments ({allComments.length})
                        </button>
                        <button
                            onClick={() => setShowFlagged(true)}
                            style={{ ...styles.toggleBtn, ...(showFlagged ? styles.toggleActive : {}) }}
                        >
                            ⚑ Flagged ({flaggedComments.length})
                        </button>
                    </div>

                    <ScrollArea className="h-[600px] rounded-md border border-zinc-700 p-4 mt-4">
                        {displayed.length === 0 && (
                            <p style={styles.empty}>
                                {showFlagged ? 'No flagged comments.' : 'No comments yet.'}
                            </p>
                        )}
                        {displayed.map(c => <CommentRow key={c._id} c={c} />)}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page:         { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:       { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:       { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", display: "flex", flexDirection: "column" },
    body:         { padding: "24px 32px" },
    toggleRow:    { display: "flex", gap: "10px" },
    toggleBtn:    { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#888", background: "#222", border: "1px solid #333", borderRadius: "4px", padding: "8px 16px", cursor: "pointer" },
    toggleActive: { color: "#fa4040", borderColor: "#fa404055", background: "#241212" },
    empty:        { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", letterSpacing: "2px", textAlign: "center", padding: "40px 0" },
    comment:      { background: "#222", border: "1px solid #2e2e2e", borderRadius: "6px", padding: "14px", marginBottom: "10px" },
    commentHeader:{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" },
    commentMeta:  { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", color: "#555" },
    targetBadge:  { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#888", letterSpacing: "1px" },
    flagBadge:    { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#fa4040" },
    commentText:  { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#bbb", margin: "4px 0 8px 0", lineHeight: "1.5" },
    reactions:    { display: "flex", gap: "6px", flexWrap: "wrap" },
    reactionChip: { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#888", background: "#1a1a1a", border: "1px solid #333", borderRadius: "20px", padding: "2px 8px" },
    deleteBtn:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
};

export default AdminComments;