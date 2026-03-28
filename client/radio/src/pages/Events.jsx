import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---- reusable comment section (same as Blog) ----
function CommentSection({ targetType, targetId, isAdmin, userData, backendUrl }) {
    const [comments, setComments]     = useState([]);
    const [text, setText]             = useState("");
    const [submitting, setSubmitting] = useState(false);

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
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/comments/${commentId}/react`,
                { emoji }, { withCredentials: true }
            );
            if (data.success) setComments(comments.map(c => c._id === commentId ? { ...c, reactions: data.reactions } : c));
        } catch (err) { toast.error(err.message); }
    };

    const handleFlag = async (commentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/comments/${commentId}/flag`, {}, { withCredentials: true });
            data.success ? toast.success("Comment flagged") : toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDelete = async (commentId) => {
        try {
            const url = isAdmin
                ? `${backendUrl}/api/comments/admin/${commentId}`
                : `${backendUrl}/api/comments/${commentId}`;
            const { data } = await axios.delete(url, { withCredentials: true });
            if (data.success) { setComments(comments.filter(c => c._id !== commentId)); toast.success("Comment deleted"); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <div style={cStyles.wrap}>
            <p style={cStyles.label}>COMMENTS ({comments.length})</p>
            {userData && (
                <form onSubmit={handleSubmit} style={cStyles.form}>
                    <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..." style={cStyles.input} maxLength={500} />
                    <button type="submit" style={cStyles.submitBtn} disabled={submitting}>{submitting ? "..." : "Post"}</button>
                </form>
            )}
            <ScrollArea className="h-[300px] rounded-md border border-zinc-700 p-3 mt-3">
                {comments.length === 0 && <p style={cStyles.empty}>No comments yet. Be the first.</p>}
                {comments.map(c => (
                    <div key={c._id} style={cStyles.comment}>
                        <div style={cStyles.commentHeader}>
                            <span style={cStyles.commentMeta}>
                                {c.author?.username || 'User'} · {formatDate(c.createdAt)}
                                {c.flaggedBy?.length > 0 && <span style={cStyles.flagBadge}> ⚑ {c.flaggedBy.length}</span>}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {userData && !isAdmin && (
                                    <button onClick={() => handleFlag(c._id)} style={cStyles.flagBtn} title="Flag comment">⚑</button>
                                )}
                                {(isAdmin || userData?._id === c.author?._id) && (
                                    <button onClick={() => handleDelete(c._id)} style={cStyles.deleteBtn}>✕</button>
                                )}
                            </div>
                        </div>
                        <p style={cStyles.commentText}>{c.text}</p>
                        <div style={cStyles.reactions}>
                            {c.reactions?.map(r => {
                                const reacted = userData && r.users?.includes(userData._id);
                                return (
                                    <button key={r.emoji} onClick={() => handleReact(c._id, r.emoji)}
                                            style={{ ...cStyles.reactionBtn, background: reacted ? '#3a2020' : '#1a1a1a', borderColor: reacted ? '#fa4040' : '#333' }}>
                                        {r.emoji} {r.users?.length > 0 && <span style={cStyles.reactionCount}>{r.users.length}</span>}
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

function Events() {
    const { backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const [events, setEvents]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/events');
            if (data.success) setEvents(data.events);
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => { setTitle(""); setDescription(""); setShowForm(false); setEditingId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId !== null) {
                const { data } = await axios.put(`${backendUrl}/api/events/${editingId}`, { title, description }, { withCredentials: true });
                if (data.success) { setEvents(events.map(ev => ev._id === editingId ? data.event : ev)); toast.success("Event updated"); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/events`, { title, description }, { withCredentials: true });
                if (data.success) { setEvents([data.event, ...events]); toast.success("Event created"); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit   = (ev) => { setTitle(ev.title); setDescription(ev.description); setEditingId(ev._id); setShowForm(true); };
    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/events/${id}`, { withCredentials: true });
            if (data.success) { setEvents(events.filter(ev => ev._id !== id)); toast.success("Event deleted"); if (expandedId === id) setExpandedId(null); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>Events</h2>
                    <div style={styles.titleLine} />
                    <p style={styles.headerSub}>What's happening at the station.</p>
                </div>

                {isAdmin && (
                    <div style={styles.section}>
                        <button style={{ ...styles.newBtn, ...(showForm ? styles.cancelBtn : {}) }}
                                onClick={() => showForm ? resetForm() : setShowForm(true)}>
                            {showForm ? "✕ Cancel" : "+ New Event"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <p style={styles.formLabel}>{editingId !== null ? "EDIT EVENT" : "NEW EVENT"}</p>
                        <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                        <textarea placeholder="Describe the event..." value={description} onChange={e => setDescription(e.target.value)} style={styles.textarea} required />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId !== null ? "Save Changes" : "Post Event"}
                        </button>
                    </form>
                )}

                <div style={styles.list}>
                    {loading && <p style={styles.emptyMsg}>Loading events...</p>}
                    {!loading && events.length === 0 && <p style={styles.emptyMsg}>No events yet. Check back soon.</p>}
                    {events.map(ev => {
                        const expanded = expandedId === ev._id;
                        return (
                            <div key={ev._id} style={styles.card}>
                                <div style={styles.cardClickable} onClick={() => setExpandedId(expanded ? null : ev._id)}>
                                    <div>
                                        <p style={styles.cardMeta}>{ev.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(ev.createdAt)}</p>
                                        <h3 style={styles.cardTitle}>{ev.title}</h3>
                                        {!expanded && <p style={styles.cardDesc}>{ev.description?.slice(0, 120)}{ev.description?.length > 120 ? '...' : ''}</p>}
                                    </div>
                                    <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                </div>

                                {expanded && (
                                    <div style={styles.expandedBody}>
                                        <p style={styles.cardDescFull}>{ev.description}</p>
                                        {isAdmin && (
                                            <div style={styles.cardActions}>
                                                <button style={styles.editBtn} onClick={() => handleEdit(ev)}>Edit</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(ev._id)}>Delete</button>
                                            </div>
                                        )}
                                        <CommentSection
                                            targetType="event"
                                            targetId={ev._id}
                                            isAdmin={isAdmin}
                                            userData={userData}
                                            backendUrl={backendUrl}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const cStyles = {
    wrap:        { marginTop: '16px', borderTop: '1px solid #2a2a2a', paddingTop: '16px' },
    label:       { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '4px', color: '#555', margin: '0 0 10px 0' },
    form:        { display: 'flex', gap: '8px', marginBottom: '8px' },
    input:       { flex: 1, fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#f5f0e8', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '8px 10px', outline: 'none' },
    submitBtn:   { fontFamily: "'Courier New', monospace", fontSize: '10px', letterSpacing: '1px', color: '#fff', background: '#fa4040', border: 'none', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer' },
    empty:       { fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#444', letterSpacing: '2px', textAlign: 'center', padding: '20px 0' },
    comment:     { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '10px 12px', marginBottom: '8px' },
    commentHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
    commentMeta: { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '2px', color: '#555' },
    flagBadge:   { color: '#fa4040' },
    commentText: { fontFamily: "'Georgia', serif", fontSize: '13px', color: '#bbb', margin: '4px 0 8px 0', lineHeight: '1.5' },
    reactions:   { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    reactionBtn: { fontFamily: 'inherit', fontSize: '13px', border: '1px solid #333', borderRadius: '20px', padding: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' },
    reactionCount:{ fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#aaa' },
    flagBtn:     { background: 'transparent', border: '1px solid #444', borderRadius: '3px', color: '#666', fontSize: '11px', cursor: 'pointer', padding: '2px 6px' },
    deleteBtn:   { background: 'transparent', border: '1px solid #444', borderRadius: '3px', color: '#fa4040', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' },
};

const styles = {
    page:        { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:      { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:      { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:   { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:   { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    headerSub:   { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", letterSpacing: "2px", margin: "14px 0 0 0" },
    section:     { padding: "24px 32px 0" },
    newBtn:      { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fa404055", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtn:   { color: "#aaa", background: "#222", borderColor: "#444" },
    form:        { margin: "20px 32px", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
    formLabel:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:       { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    textarea:    { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%", minHeight: "100px", resize: "vertical" },
    submitBtn:   { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    list:        { padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "12px" },
    emptyMsg:    { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px" },
    card:        { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    cardClickable:{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", cursor: "pointer" },
    expandIcon:  { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", flexShrink: 0, paddingTop: "4px" },
    expandedBody:{ padding: "0 20px 20px" },
    cardMeta:    { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#444", margin: "0 0 8px 0" },
    cardTitle:   { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 6px 0", fontWeight: "bold" },
    cardDesc:    { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", margin: "0" },
    cardDescFull:{ fontFamily: "'Georgia', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 16px 0" },
    cardActions: { display: "flex", gap: "8px", marginBottom: "16px" },
    editBtn:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
};

export default Events;