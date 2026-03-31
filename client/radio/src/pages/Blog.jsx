import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";

const EMOJIS = ['👍', '❤️', '😂', '🔥', '😮'];

function CommentSection({ targetType, targetId, isAdmin, userData, backendUrl }) {
    const [comments, setComments]   = useState([]);
    const [text, setText]           = useState("");
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
                setComments(comments.map(c =>
                    c._id === commentId ? { ...c, reactions: data.reactions } : c
                ));
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
                setComments(comments.filter(c => c._id !== commentId));
                toast.success("Comment deleted");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div style={cStyles.wrap}>
            <p style={cStyles.label}>COMMENTS ({comments.length})</p>

            {userData && (
                <form onSubmit={handleSubmit} style={cStyles.form}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Write a comment..."
                        style={cStyles.input}
                        maxLength={500}
                    />
                    <button type="submit" style={cStyles.submitBtn} disabled={submitting}>
                        {submitting ? "..." : "Post"}
                    </button>
                </form>
            )}

            <ScrollArea className="h-[300px] rounded-md border border-zinc-700 p-3 mt-3">
                {comments.length === 0 && (
                    <p style={cStyles.empty}>No comments yet. Be the first.</p>
                )}
                {comments.map(c => (
                    <div key={c._id} style={cStyles.comment}>
                        {/* flag button top-right */}
                        <div style={cStyles.commentHeader}>
                            <span style={cStyles.commentMeta}>
                                {c.author?.username || 'User'} · {formatDate(c.createdAt)}
                                {c.flaggedBy?.length > 0 && (
                                    <span style={cStyles.flagBadge}> ⚑ {c.flaggedBy.length}</span>
                                )}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {userData && !isAdmin && (
                                    <button
                                        onClick={() => handleFlag(c._id)}
                                        style={cStyles.flagBtn}
                                        title="Flag comment"
                                    >⚑</button>
                                )}
                                {(isAdmin || userData?._id === c.author?._id) && (
                                    <button onClick={() => handleDelete(c._id)} style={cStyles.deleteBtn}>✕</button>
                                )}
                            </div>
                        </div>

                        <p style={cStyles.commentText}>{c.text}</p>

                        {/* reactions */}
                        <div style={cStyles.reactions}>
                            {c.reactions?.map(r => {
                                const reacted = userData && r.users?.includes(userData._id);
                                return (
                                    <button
                                        key={r.emoji}
                                        onClick={() => handleReact(c._id, r.emoji)}
                                        style={{
                                            ...cStyles.reactionBtn,
                                            background: reacted ? '#3a2020' : '#1a1a1a',
                                            borderColor: reacted ? '#fa4040' : '#333',
                                        }}
                                    >
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

function Blog() {
    const { backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);  // which post is expanded

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/posts');
            if (data.success) setPosts(data.posts);
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => { setTitle(""); setDescription(""); setShowForm(false); setEditingId(null); };

// handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            if (image) formData.append("image", image);
            //formData.append("userId", userData._id);

            let res;
            if (editingId) {
                res = await axios.put(
                    `${backendUrl}/api/posts/${editingId}`,
                    formData,
                    { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                res = await axios.post(
                    `${backendUrl}/api/posts`,
                    formData,
                    { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
                );
            }

            if (res.data.success) {
                if (editingId) setPosts(posts.map(p => p._id === editingId ? res.data.post : p));
                else setPosts([res.data.post, ...posts]);

                toast.success(editingId ? "Post updated" : "Post created");
                resetForm();
                setImage(null);
            } else toast.error(res.data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (post) => { setTitle(post.title); setDescription(post.description); setEditingId(post._id); setShowForm(true); };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
            if (data.success) { setPosts(posts.filter(p => p._id !== id)); toast.success("Post deleted"); if (expandedId === id) setExpandedId(null); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p style={styles.eyebrow}>WSIN RADIO</p>
                    <h2 style={styles.pageTitle}>WSIN Blogs</h2>
                    <div style={styles.titleLine} />
                </div>

                {isAdmin && (
                    <div style={styles.section}>
                        <button style={{ ...styles.newPostBtn, ...(showForm ? styles.cancelBtn : {}) }}
                                onClick={() => showForm ? resetForm() : setShowForm(true)}>
                            {showForm ? "✕ Cancel" : "+ New Post"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <p style={styles.formLabel}>{editingId !== null ? "EDIT POST" : "NEW POST"}</p>
                        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setImage(e.target.files[0])}
                        />
                        <textarea placeholder="Write something..." value={description} onChange={e => setDescription(e.target.value)} style={styles.textarea} required />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId !== null ? "Save Changes" : "Post"}
                        </button>
                    </form>
                )}

                <div style={styles.postList}>
                    {loading && <p style={styles.emptyMsg}>Loading posts...</p>}
                    {!loading && posts.length === 0 && <p style={styles.emptyMsg}>No posts yet.</p>}
                    {posts.map(post => {
                        const expanded = expandedId === post._id;
                        return (
                            <div key={post._id} style={styles.postCard}>
                                {/* clickable header row */}
                                <div style={styles.postClickable} onClick={() => setExpandedId(expanded ? null : post._id)}>
                                    <div>
                                        <p style={styles.postMeta}>{post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}</p>
                                        <h3 style={styles.postTitle}>{post.title}</h3>
                                        {!expanded && <p style={styles.postDesc}>{post.description?.slice(0, 120)}{post.description?.length > 120 ? '...' : ''}</p>}
                                    </div>
                                    <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                </div>

                                {/* expanded content */}
                                {expanded && (
                                    <div style={styles.expandedBody}>
                                        <img
                                            src={backendUrl + post.image}
                                        />
                                        <p style={styles.postDescFull}>{post.description}</p>
                                        {isAdmin && (
                                            <div style={styles.postActions}>
                                                <button style={styles.editBtn} onClick={() => handleEdit(post)}>Edit</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(post._id)}>Delete</button>
                                            </div>
                                        )}
                                        <CommentSection
                                            targetType="post"
                                            targetId={post._id}
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

// ---- comment sub-styles ----
const cStyles = {
    wrap:       { marginTop: '16px', borderTop: '1px solid #2a2a2a', paddingTop: '16px' },
    label:      { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '4px', color: '#555', margin: '0 0 10px 0' },
    form:       { display: 'flex', gap: '8px', marginBottom: '8px' },
    input:      { flex: 1, fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#f5f0e8', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '8px 10px', outline: 'none' },
    submitBtn:  { fontFamily: "'Courier New', monospace", fontSize: '10px', letterSpacing: '1px', color: '#fff', background: '#fa4040', border: 'none', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer' },
    empty:      { fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#444', letterSpacing: '2px', textAlign: 'center', padding: '20px 0' },
    comment:    { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '10px 12px', marginBottom: '8px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
    commentMeta:{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '2px', color: '#555' },
    flagBadge:  { color: '#fa4040' },
    commentText:{ fontFamily: "'Georgia', serif", fontSize: '13px', color: '#bbb', margin: '4px 0 8px 0', lineHeight: '1.5' },
    reactions:  { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    reactionBtn:{ fontFamily: 'inherit', fontSize: '13px', border: '1px solid #333', borderRadius: '20px', padding: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' },
    reactionCount: { fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#aaa' },
    flagBtn:    { background: 'transparent', border: '1px solid #444', borderRadius: '3px', color: '#666', fontSize: '11px', cursor: 'pointer', padding: '2px 6px' },
    deleteBtn:  { background: 'transparent', border: '1px solid #444', borderRadius: '3px', color: '#fa4040', fontSize: '10px', cursor: 'pointer', padding: '2px 6px' },
};

const styles = {
    page:       { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:     { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:     { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:  { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:  { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    section:    { padding: "24px 32px 0" },
    newPostBtn: { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fe979755", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtn:  { color: "#aaa", background: "#222", borderColor: "#444" },
    form:       { margin: "20px 32px", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
    formLabel:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:      { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    textarea:   { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%", minHeight: "100px", resize: "vertical" },
    submitBtn:  { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    postList:   { padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "12px" },
    emptyMsg:   { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px" },
    postCard:   { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    postClickable: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", cursor: "pointer" },
    expandIcon: { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", flexShrink: 0, paddingTop: "4px" },
    expandedBody:  { padding: "0 20px 20px" },
    postMeta:   { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#444", margin: "0 0 8px 0" },
    postTitle:  { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 6px 0", fontWeight: "bold" },
    postDesc:   { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", margin: "0" },
    postDescFull:{ fontFamily: "'Georgia', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 16px 0" },
    postActions:{ display: "flex", gap: "8px", marginBottom: "16px" },
    editBtn:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fc848444", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
};

export default Blog;