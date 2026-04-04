import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const treeStyles = {
    page:       { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:     { width: "100%", maxWidth: "1100px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:     { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:  { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:  { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    body:       { padding: "24px 32px 48px" },
    // tree items
    treeItem:   { borderBottom: "1px solid #222" },
    groupRow:   { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", cursor: "pointer", background: "#1e1e1e", borderRadius: "4px" },
    groupRowHover: { background: "#261212" },
    fileRow:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "#191919", borderRadius: "4px", marginTop: "4px" },
    icon:       { fontSize: "16px", flexShrink: 0, width: "20px", textAlign: "center", userSelect: "none" },
    name:       { fontFamily: "'Georgia', serif", fontSize: "16px", color: "#f5f0e8", flex: 1 },
    desc:       { fontFamily: "'Georgia', serif", fontSize: "12px", color: "#666", flex: 2 },
    postTitle:  { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", flex: 1 },
    postMeta:   { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#555", marginRight: "12px" },
    // buttons
    btnSmall:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fa4040", background: "transparent", border: "1px solid #fc848444", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
    btnDelete:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#888", background: "transparent", border: "1px solid #444", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
    btnAdd:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fa4040", background: "#241212", border: "1px solid #fe979755", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
    // forms
    formInline: { background: "#222", border: "1px solid #333", borderRadius: "4px", padding: "12px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px" },
    formRow:    { display: "flex", gap: "8px" },
    input:      { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "3px", padding: "6px 10px", outline: "none", flex: 1 },
    textarea:   { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "3px", padding: "8px 10px", outline: "none", resize: "vertical", minHeight: "60px" },
    editorWrap: { display: "flex", gap: "8px" },
    submitBtn:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "3px", padding: "6px 14px", cursor: "pointer", alignSelf: "flex-end" },
    saveBtn:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "3px", padding: "4px 12px", cursor: "pointer" },
    cancelBtn:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#aaa", background: "#222", border: "1px solid #444", borderRadius: "3px", padding: "4px 12px", cursor: "pointer" },
    // other
    emptyMsg:   { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", padding: "40px 0" },
    label:      { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "3px", color: "#555" },
    arrow:      { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#555", width: "16px", textAlign: "center", userSelect: "none" },
};

function AdminBlogs() {
    const { backendUrl, userData, blogGroups, fetchBlogGroups } = useContext(AppContext);
    const [treeData, setTreeData] = useState([]); // { group, posts[], expanded }
    const [loading, setLoading] = useState(true);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");

    // Editing state
    const [editingGroup, setEditingGroup] = useState(null); // group id
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupDesc, setEditGroupDesc] = useState("");
    const [createPostGroup, setCreatePostGroup] = useState(null); // group id
    const [editingPost, setEditingPost] = useState(null); // post id
    const [editPostTitle, setEditPostTitle] = useState("");
    const [editPostDesc, setEditPostDesc] = useState("");
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostDesc, setNewPostDesc] = useState("");

    // Drag state
    const [draggingPost, setDraggingPost] = useState(null); // post id being dragged
    const [dropTarget, setDropTarget] = useState(null);    // group id being hovered

    const handleDragStart = (e, post) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ postId: post._id, fromGroupId: post.blogGroup }));
        e.dataTransfer.effectAllowed = "move";
        setDraggingPost(post._id);
    };

    const handleDragEnter = (e, groupId) => {
        e.preventDefault();
        setDropTarget(groupId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetGroupId) => {
        e.preventDefault();
        setDropTarget(null);
        setDraggingPost(null);
        try {
            const { postId, fromGroupId } = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (fromGroupId === targetGroupId) return; // dropped on same group
            const { data } = await axios.put(
                `${backendUrl}/api/posts/${postId}`,
                { blogGroupId: targetGroupId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success("Post moved");
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDragEnd = () => {
        setDraggingPost(null);
        setDropTarget(null);
    };

    useEffect(() => { fetchTreeData(); }, []);

    const fetchTreeData = async () => {
        try {
            const { data: groups } = await axios.get(`${backendUrl}/api/bloggroup`);
            const tree = await Promise.all(groups.map(async (g) => {
                const { data } = await axios.get(`${backendUrl}/api/posts/blog/${g._id}`);
                return { group: g, posts: data.success ? data.posts : [], expanded: true };
            }));
            setTreeData(tree);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ---- Group CRUD ----
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/bloggroup`, { name: newGroupName, description: newGroupDesc }, { withCredentials: true });
            if (data._id) {
                toast.success("Blog group created");
                setNewGroupName("");
                setNewGroupDesc("");
                setShowNewGroup(false);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteGroup = async (id) => {
        if (!confirm("Delete this blog group and ALL its posts?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/bloggroup/${id}`, { withCredentials: true });
            if (data.message) {
                toast.success("Group deleted");
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleSaveGroup = async (id) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/bloggroup/${id}`, { name: editGroupName, description: editGroupDesc }, { withCredentials: true });
            if (data._id) {
                toast.success("Group updated");
                setEditingGroup(null);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const toggleGroup = (id) => {
        setTreeData(treeData.map(t => t.group._id === id ? { ...t, expanded: !t.expanded } : t));
    };

    // ---- Post CRUD ----
    const handleCreatePost = async (groupId) => {
        if (!newPostTitle.trim() || !newPostDesc.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/posts`, { title: newPostTitle, description: newPostDesc, blogGroupId: groupId }, { withCredentials: true });
            if (data.success) {
                toast.success("Post created");
                setNewPostTitle("");
                setNewPostDesc("");
                setCreatePostGroup(null);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Delete this post?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${postId}`, { withCredentials: true });
            if (data.success) {
                toast.success("Post deleted");
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleSavePost = async (postId) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/posts/${postId}`, { title: editPostTitle, description: editPostDesc }, { withCredentials: true });
            if (data.success) {
                toast.success("Post updated");
                setEditingPost(null);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

    return (
        <div style={treeStyles.page}>
            <div style={treeStyles.column}>
                <div style={treeStyles.header}>
                    <p style={treeStyles.eyebrow}>ADMIN · BLOG MANAGEMENT</p>
                    <h2 style={treeStyles.pageTitle}>Blogs</h2>
                    <div style={treeStyles.titleLine} />
                </div>

                <div style={treeStyles.body}>
                    {loading && <p style={treeStyles.emptyMsg}>Loading...</p>}

                    {/* Create new group form */}
                    <div style={treeStyles.treeItem}>
                        <div style={treeStyles.groupRow} onClick={() => setShowNewGroup(!showNewGroup)}>
                            <span style={treeStyles.arrow}>{showNewGroup ? "▼" : "▶"}</span>
                            <span style={treeStyles.icon}>+</span>
                            <span style={{ ...treeStyles.name, color: "#fa4040" }}>New Blog Group</span>
                        </div>
                        {showNewGroup && (
                            <form onSubmit={handleCreateGroup} style={{ ...treeStyles.formInline, marginLeft: "28px" }}>
                                <input style={treeStyles.input} placeholder="Group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                                <textarea style={treeStyles.textarea} placeholder="Description (optional)" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} />
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                    <button type="button" style={treeStyles.cancelBtn} onClick={() => { setShowNewGroup(false); setNewGroupName(""); setNewGroupDesc(""); }}>Cancel</button>
                                    <button type="submit" style={treeStyles.saveBtn}>Create</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Tree */}
                    {!loading && treeData.length === 0 && <p style={treeStyles.emptyMsg}>No blog groups found.</p>}

                    {treeData.map(({ group, posts, expanded }) => {
                        const isEditing = editingGroup === group._id;
                        const isCreatingPost = createPostGroup === group._id;

                        return (
                            <div key={group._id} style={treeStyles.treeItem}>
                                {/* Group row */}
                                <div
                                    style={treeStyles.groupRow}
                                    onDragOver={handleDragOver}
                                    onDrop={e => handleDrop(e, group._id)}
                                    onClick={() => !isEditing && toggleGroup(group._id)}
                                    onMouseEnter={e => {
                                        if (isEditing) return;
                                        e.currentTarget.style.background = dropTarget === group._id ? "#302010" : "#261212";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "#1e1e1e";
                                    }}
                                >
                                    <span style={treeStyles.arrow}>{expanded ? "▼" : "▶"}</span>
                                    <span style={treeStyles.icon}>{expanded ? "📂" : "📁"}</span>
                                    <span style={treeStyles.name}>{group.name}</span>
                                    <span style={treeStyles.desc}>{group.description}</span>
                                    <span style={treeStyles.label}>{posts.length} posts</span>
                                    <button style={treeStyles.btnSmall} onClick={e => { e.stopPropagation(); setEditingGroup(group._id); setEditGroupName(group.name); setEditGroupDesc(group.description); }}>Edit</button>
                                    <button style={treeStyles.btnDelete} onClick={e => { e.stopPropagation(); handleDeleteGroup(group._id); }}>Delete</button>
                                </div>

                                {/* Group inline edit */}
                                {isEditing && (
                                    <div style={{ ...treeStyles.formInline, marginLeft: "28px" }}>
                                        <input style={treeStyles.input} placeholder="Group name" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} required />
                                        <textarea style={treeStyles.textarea} placeholder="Description" value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} />
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button style={treeStyles.cancelBtn} onClick={() => setEditingGroup(null)}>Cancel</button>
                                            <button style={treeStyles.saveBtn} onClick={() => handleSaveGroup(group._id)}>Save</button>
                                        </div>
                                    </div>
                                )}

                                {/* Posts */}
                                {expanded && posts.map(post => {
                                    const isEditingPost = editingPost === post._id;
                                    const isDragging = draggingPost === post._id;
                                    return (
                                        <div
                                            key={post._id}
                                            draggable={!isEditingPost}
                                            onDragStart={e => handleDragStart(e, post)}
                                            onDragEnd={handleDragEnd}
                                            style={{
                                                ...treeStyles.fileRow,
                                                marginLeft: "48px",
                                                cursor: isDragging ? "grabbing" : "grab",
                                                opacity: isDragging ? 0.4 : 1,
                                                border: "1px solid transparent",
                                            }}
                                            onMouseEnter={e => { if (!isEditingPost) e.currentTarget.style.borderColor = "#fa4040"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
                                        >
                                            {isEditingPost ? (
                                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    <input style={treeStyles.input} value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} placeholder="Title" />
                                                    <textarea style={treeStyles.textarea} value={editPostDesc} onChange={e => setEditPostDesc(e.target.value)} placeholder="Content" />
                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                        <button style={treeStyles.cancelBtn} onClick={() => setEditingPost(null)}>Cancel</button>
                                                        <button style={treeStyles.saveBtn} onClick={() => handleSavePost(post._id)}>Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span style={treeStyles.icon}>📄</span>
                                                    <span style={treeStyles.postTitle}>&nbsp;{post.title}</span>
                                                    <span style={treeStyles.postMeta}>{formatDate(post.createdAt)}</span>
                                                    <button style={treeStyles.btnSmall} onClick={() => { setEditingPost(post._id); setEditPostTitle(post.title); setEditPostDesc(post.description); }}>Edit</button>
                                                    <button style={treeStyles.btnDelete} onClick={() => handleDeletePost(post._id)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* New post form */}
                                {expanded && isCreatingPost && (
                                    <div style={{ ...treeStyles.formInline, marginLeft: "48px" }}>
                                        <div style={treeStyles.label}>NEW POST IN {group.name.toUpperCase()}</div>
                                        <input style={treeStyles.input} placeholder="Post title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required />
                                        <textarea style={treeStyles.textarea} placeholder="Post content" value={newPostDesc} onChange={e => setNewPostDesc(e.target.value)} required />
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button style={treeStyles.cancelBtn} onClick={() => { setCreatePostGroup(null); setNewPostTitle(""); setNewPostDesc(""); }}>Cancel</button>
                                            <button style={treeStyles.saveBtn} onClick={() => handleCreatePost(group._id)}>Create</button>
                                        </div>
                                    </div>
                                )}

                                {expanded && !isCreatingPost && (
                                    <div style={{ marginLeft: "48px", padding: "6px 0" }}>
                                        <button style={treeStyles.btnAdd} onClick={() => setCreatePostGroup(group._id)}>+ Add Post</button>
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

export default AdminBlogs;
