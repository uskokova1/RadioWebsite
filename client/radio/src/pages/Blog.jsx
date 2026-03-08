import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";

function Blog() {
    const { backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/posts');
            if (data.success) {
                setPosts(data.posts);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId !== null) {
                const { data } = await axios.put(
                    `${backendUrl}/api/posts/${editingId}`,
                    { title, description },
                    { withCredentials: true }
                );
                if (data.success) {
                    setPosts(posts.map(p => p._id === editingId ? data.post : p));
                    toast.success("Post updated");
                    resetForm();
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(
                    `${backendUrl}/api/posts`,
                    { title, description },
                    { withCredentials: true }
                );
                if (data.success) {
                    setPosts([data.post, ...posts]);
                    toast.success("Post created");
                    resetForm();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (post) => {
        setTitle(post.title);
        setDescription(post.description);
        setEditingId(post._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/posts/${id}`,
                { withCredentials: true }
            );
            if (data.success) {
                setPosts(posts.filter(p => p._id !== id));
                toast.success("Post deleted");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

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
                        <button
                            style={{ ...styles.newPostBtn, ...(showForm ? styles.cancelBtn : {}) }}
                            onClick={() => showForm ? resetForm() : setShowForm(true)}
                        >
                            {showForm ? "✕ Cancel" : "+ New Post"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <p style={styles.formLabel}>{editingId !== null ? "EDIT POST" : "NEW POST"}</p>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <textarea
                            placeholder="Write something..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                            required
                        />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId !== null ? "Save Changes" : "Post"}
                        </button>
                    </form>
                )}

                <div style={styles.postList}>
                    {loading && <p style={styles.emptyMsg}>Loading posts...</p>}
                    {!loading && posts.length === 0 && <p style={styles.emptyMsg}>No posts yet.</p>}
                    {posts.map(post => (
                        <div key={post._id} style={styles.postCard}>
                            <p style={styles.postMeta}>
                                {post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}
                            </p>
                            <h3 style={styles.postTitle}>{post.title}</h3>
                            <p style={styles.postDesc}>{post.description}</p>
                            {isAdmin && (
                                <div style={styles.postActions}>
                                    <button style={styles.editBtn} onClick={() => handleEdit(post)}>Edit</button>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(post._id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        justifyContent: "center",
    },
    column: {
        width: "100%",
        maxWidth: "760px",
        minHeight: "100vh",
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a",
        borderRight: "1px solid #2a2a2a",
    },
    header: {
        background: "#322d2d",
        padding: "40px 32px 28px",
        borderBottom: "1px solid #3a3a3a",
    },
    eyebrow: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "5px",
        color: "#fa4040",
        margin: "0 0 10px 0",
    },
    pageTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "48px",
        fontWeight: "bold",
        color: "#f5f0e8",
        margin: "0",
        letterSpacing: "-1px",
    },
    titleLine: {
        width: "40px",
        height: "3px",
        background: "#fa4040",
        marginTop: "16px",
    },
    section: {
        padding: "24px 32px 0",
    },
    newPostBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#fa4040",
        background: "#241212",
        border: "1px solid #fe979755",
        borderRadius: "4px",
        padding: "10px 20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    cancelBtn: {
        color: "#aaa",
        background: "#222",
        borderColor: "#444",
    },
    form: {
        margin: "20px 32px",
        background: "#222",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    formLabel: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "4px",
        color: "#555",
        margin: "0",
    },
    input: {
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#f5f0e8",
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "10px 12px",
        outline: "none",
        width: "100%",
    },
    textarea: {
        fontFamily: "'Georgia', serif",
        fontSize: "14px",
        color: "#ccc",
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "10px 12px",
        outline: "none",
        width: "100%",
        minHeight: "100px",
        resize: "vertical",
    },
    submitBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#fff",
        background: "#fa4040",
        border: "none",
        borderRadius: "4px",
        padding: "10px",
        cursor: "pointer",
        alignSelf: "flex-end",
        transition: "opacity 0.2s ease",
    },
    postList: {
        padding: "20px 32px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    emptyMsg: {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        color: "#444",
        letterSpacing: "2px",
        textAlign: "center",
        marginTop: "40px",
    },
    postCard: {
        background: "#222",
        border: "1px solid #2e2e2e",
        borderRadius: "8px",
        padding: "20px",
        transition: "border-color 0.2s ease",
    },
    postMeta: {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        letterSpacing: "4px",
        color: "#444",
        margin: "0 0 8px 0",
    },
    postTitle: {
        fontFamily: "'Georgia', serif",
        fontSize: "20px",
        color: "#f5f0e8",
        margin: "0 0 10px 0",
        fontWeight: "bold",
    },
    postDesc: {
        fontFamily: "'Georgia', serif",
        fontSize: "14px",
        color: "#888",
        lineHeight: "1.6",
        margin: "0 0 16px 0",
    },
    postActions: {
        display: "flex",
        gap: "8px",
    },
    editBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "2px",
        color: "#fa4040",
        background: "transparent",
        border: "1px solid #fc848444",
        borderRadius: "3px",
        padding: "6px 12px",
        cursor: "pointer",
    },
    deleteBtn: {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        letterSpacing: "2px",
        color: "#888",
        background: "transparent",
        border: "1px solid #333",
        borderRadius: "3px",
        padding: "6px 12px",
        cursor: "pointer",
    },
};

export default Blog;
