import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import Markdown from 'react-showdown';
import CommentSection from "../components/CommentSection.jsx";

function Blog() {
    const { backendUrl, userData, blogGroups } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const stored = localStorage.getItem("selectedBlogGroup");
    const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
    const [selectedBlogGroup, setSelectedBlogGroup] = useState(parsed);

    useEffect(() => {
        if (!selectedBlogGroup || typeof selectedBlogGroup !== 'object') return;
        if (selectedBlogGroup.name) return;
        const full = blogGroups.find(g => g._id === selectedBlogGroup._id);
        if (full) setSelectedBlogGroup(full);
    }, [blogGroups, selectedBlogGroup]);

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [selectedImagePath, setSelectedImagePath] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    useEffect(() => { fetchImages(); }, []);
    useEffect(() => { if (selectedBlogGroup) fetchPosts(); }, [selectedBlogGroup]);

    const fetchPosts = async () => {
        try {
            const url = selectedBlogGroup
                ? `${backendUrl}/api/posts/blog/${selectedBlogGroup._id}`
                : `${backendUrl}/api/posts`;
            const { data } = await axios.get(url);
            if (data.success) setPosts(data.posts);
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedImagePath(null);
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const body = { title, description, image: selectedImagePath, blogGroupId: selectedBlogGroup._id };
            let res;
            if (editingId) {
                res = await axios.put(`${backendUrl}/api/posts/${editingId}`, body, { withCredentials: true });
            } else {
                res = await axios.post(`${backendUrl}/api/posts`, body, { withCredentials: true });
            }
            if (res.data.success) {
                if (editingId) setPosts(posts.map(p => p._id === editingId ? res.data.post : p));
                else setPosts([res.data.post, ...posts]);
                toast.success(editingId ? "Post updated" : "Post created");
                resetForm();
            } else toast.error(res.data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (post) => {
        setTitle(post.title);
        setDescription(post.description);
        setSelectedImagePath(post.image || null);
        setEditingId(post._id);
        setShowForm(true);
        fetchImages();
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
            if (data.success) { setPosts(posts.filter(p => p._id !== id)); toast.success("Post deleted"); if (expandedId === id) setExpandedId(null); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const selectGroup = (group) => {
        setSelectedBlogGroup(group);
        localStorage.setItem("selectedBlogGroup", JSON.stringify({ _id: group._id, name: group.name }));
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!selectedBlogGroup) {
        return (
            <div style={styles.page}>
                <div style={styles.column}>
                    <div style={styles.header}>
                        <a href="/BlogGroups" style={styles.backBtn}>&larr; All Blog Groups</a>
                        <p style={{ ...styles.eyebrow, marginTop: "16px" }}>ALL</p>
                        <h2 style={styles.pageTitle}>WSIN Blogs</h2>
                        <div style={styles.titleLine} />
                    </div>
                    <div style={styles.postList}>
                        {loading && <p style={styles.emptyMsg}>Loading posts...</p>}
                        {!loading && posts.length === 0 && <p style={styles.emptyMsg}>No posts yet.</p>}
                        {posts.map(post => {
                            const expanded = expandedId === post._id;
                            const gName = blogGroups.find(g => g._id === post.blogGroup)?.name;
                            return (
                                <div key={post._id} style={styles.postCard}>
                                    <div style={styles.postClickable} onClick={() => setExpandedId(expanded ? null : post._id)}>
                                        <div>
                                            {gName && <span style={styles.groupBadge}>{gName}</span>}
                                            <p style={styles.postMeta}>{post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}</p>
                                            <h3 style={styles.postTitle}>{post.title}</h3>
                                            {!expanded && <p style={styles.postDesc}>{post.description?.slice(0, 120)}{post.description?.length > 120 ? '...' : ''}</p>}
                                        </div>
                                        <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                    </div>
                                    {expanded && (
                                        <div style={styles.expandedBody}>
                                            {post.image && <img className='aspect-square object-cover w-65' src={backendUrl + post.image} />}
                                            <p style={styles.postDescFull}>{post.description}</p>
                                            {isAdmin && (
                                                <div style={styles.postActions}>
                                                    <button style={styles.editBtn} onClick={() => handleEdit(post)}>Edit</button>
                                                    <button style={styles.deleteBtn} onClick={() => handleDelete(post._id)}>Delete</button>
                                                </div>
                                            )}
                                            <CommentSection targetType="post" targetId={post._id} />
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

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <a href="/BlogGroups" style={styles.backBtn}>&larr; All Blog Groups</a>
                    <button style={styles.backBtn} onClick={() => { setSelectedBlogGroup(null); setExpandedId(null); }}>
                        &larr; Back to Groups
                    </button>
                    <p style={{ ...styles.eyebrow, marginTop: "16px" }}>{selectedBlogGroup.name.toUpperCase()}</p>
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
                        <p style={styles.formLabel}>{editingId ? "EDIT POST" : "NEW POST"}</p>
                        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>POST IMAGE (optional)</p>
                            <div style={styles.imagePicker}>
                                <div
                                    style={{
                                        ...styles.imagePickerItem,
                                        ...(selectedImagePath === null ? styles.imagePickerSelected : {}),
                                    }}
                                    onClick={() => setSelectedImagePath(null)}
                                >
                                    None
                                </div>
                                {uploadedImages.map(img => (
                                    <div
                                        key={img.name}
                                        style={{
                                            ...styles.imagePickerItem,
                                            ...(selectedImagePath === `/uploads/${img.name}` ? styles.imagePickerSelected : {}),
                                        }}
                                        onClick={() => setSelectedImagePath(`/uploads/${img.name}`)}
                                    >
                                        <img
                                            src={`${backendUrl}/uploads/${img.name}`}
                                            alt={img.name}
                                            style={styles.imagePickerThumb}
                                        />
                                        <span style={styles.imagePickerName}>{img.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>CONTENT <span style={{ color: "#444" }}>— Markdown supported</span></p>
                            <div style={styles.editorWrap}>
                                <textarea
                                    placeholder="Write something..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={styles.editorTextarea}
                                    required
                                />
                                <div className="prose prose-invert" style={styles.previewPane}>
                                    {!description && <p style={{ color: "#444", fontFamily: "'Georgia', serif", fontSize: "14px" }}>Preview will appear here…</p>}
                                    {description && (
                                        <Markdown
                                            markdown={description}
                                            options={{ tables: true, strikethrough: true, ghCodeBlocks: true }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId ? "Save Changes" : "Post"}
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
                                <div style={styles.postClickable} onClick={() => setExpandedId(expanded ? null : post._id)}>
                                    <div>
                                        <p style={styles.postMeta}>{post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}</p>
                                        <h3 style={styles.postTitle}>{post.title}</h3>
                                        {!expanded && <p style={styles.postDesc}>{post.description?.slice(0, 120)}{post.description?.length > 120 ? '...' : ''}</p>}
                                    </div>
                                    <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                </div>
                                {expanded && (
                                    <div style={styles.expandedBody}>
                                        {post.image && <img className='aspect-square object-cover w-65' src={backendUrl + post.image} />}
                                        <div className="prose prose-invert" style={{ margin: "12px 0" }}>
                                            <Markdown
                                                markdown={post.description}
                                                options={{ tables: true, strikethrough: true, ghCodeBlocks: true }}
                                            />
                                        </div>
                                        {isAdmin && (
                                            <div style={styles.postActions}>
                                                <button style={styles.editBtn} onClick={() => handleEdit(post)}>Edit</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(post._id)}>Delete</button>
                                            </div>
                                        )}
                                        <CommentSection targetType="post" targetId={post._id} />
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

const styles = {
    page:       { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:     { width: "100%", maxWidth: "1100px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:     { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    backBtn:    { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "1px", color: "#fa4040", background: "transparent", border: "1px solid #fc848444", borderRadius: "4px", padding: "6px 14px", cursor: "pointer", textDecoration: "none", display: "inline-block", marginBottom: "8px" },
    groupBadge: { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#fa4040", background: "#241212", border: "1px solid #fc848433", borderRadius: "3px", padding: "1px 6px", marginRight: "6px" },
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
    editorWrap: { display: "flex", gap: "16px", alignItems: "flex-start" },
    editorTextarea: { flex: 1, fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "12px", outline: "none", minHeight: "280px", resize: "vertical" },
    previewPane: { flex: 1, background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "12px", minHeight: "280px", overflowY: "auto" },
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
    imagePicker: { display: "flex", flexWrap: "wrap", gap: "8px", padding: "8px" },
    imagePickerItem: { width: "70px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", padding: "4px", border: "1px solid #333", borderRadius: "4px", background: "#1a1a1a" },
    imagePickerSelected: { borderColor: "#fa4040", background: "#241212" },
    imagePickerThumb: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "3px" },
    imagePickerName: { fontSize: "8px", fontFamily: "'Courier New', monospace", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "64px" },
    editBtn:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fc848444", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
};

export default Blog;
