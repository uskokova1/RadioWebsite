import {useState, useContext, useEffect} from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const BlogGroupGrid = ({ onSelectGroup, backendUrl, userData }) => {
    const { blogGroups, fetchBlogGroups } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/bloggroup`,
                { name, description },
                { withCredentials: true }
            );
            if (data._id) {
                toast.success("Blog group created");
                setName("");
                setDescription("");
                setShowForm(false);
                fetchBlogGroups();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={gStyles.page}>
            <div style={gStyles.column}>
                <div style={gStyles.header}>
                    <p style={gStyles.eyebrow}>BLOG GROUPS</p>
                    <h2 style={gStyles.pageTitle}>Blog Groups</h2>
                    <div style={gStyles.titleLine} />
                </div>
                <p style={gStyles.desc}>Select a blog group and read blogs</p>

                {isAdmin && (
                    <div style={gStyles.section}>
                        <button style={{ ...gStyles.newGroupBtn, ...(showForm ? gStyles.cancelBtn : {}) }}
                                onClick={() => setShowForm(!showForm)}>
                            {showForm ? "✕ Cancel" : "+ New Blog Group"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={gStyles.form}>
                        <p style={gStyles.formLabel}>NEW BLOG GROUP</p>
                        <input type="text" placeholder="Group name" value={name} onChange={e => setName(e.target.value)} style={gStyles.input} required />
                        <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ ...gStyles.input, minHeight: "80px", resize: "vertical" }} />
                        <button type="submit" style={gStyles.submitBtn} disabled={submitting}>
                            {submitting ? "Creating..." : "Create Group"}
                        </button>
                    </form>
                )}

                <div style={gStyles.grid}>
                    {(!blogGroups || blogGroups.length === 0) && (
                        <p style={gStyles.emptyMsg}>No blog groups found.</p>
                    )}
                    {blogGroups && blogGroups.map((group) => (
                        <div
                            key={group._id}
                            style={gStyles.card}
                            onClick={() => onSelectGroup(group)}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#fa4040"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#2e2e2e"}
                        >
                            {group.coverImage ? (
                                <img
                                    src={`${backendUrl}/uploads/${group.coverImage}`}
                                    alt={group.name}
                                    style={gStyles.cardImage}
                                />
                            ) : (
                                <div style={gStyles.cardPlaceholder}>
                                    <span style={gStyles.cardIcon}>📄</span>
                                </div>
                            )}
                            <div style={gStyles.cardBody}>
                                <h3 style={gStyles.cardName}>{group.name}</h3>
                                <p style={gStyles.cardDesc}>
                                    {group.description || "No description"}
                                </p>
                                <span style={gStyles.cardMeta}>READ BLOGS →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const gStyles = {
    page:       { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:     { width: "100%", minWidth: "1000px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:     { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:  { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:  { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    desc:       { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#666", margin: "8px 0 0 0", padding: "16px 32px 0" },
    section:    { padding: "24px 32px 0" },
    newGroupBtn:{ fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fe979755", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtn:  { color: "#aaa", background: "#222", borderColor: "#444" },
    form:       { margin: "20px 32px", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
    formLabel:  { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:      { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    submitBtn:  { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    grid:       { padding: "20px 32px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
    card:       { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" },
    cardHover:  { borderColor: "#fa4040" },
    cardImage:  { width: "100%", height: "180px", objectFit: "cover" },
    cardPlaceholder: { height: "180px", background: "linear-gradient(135deg, rgba(250,64,64,0.1) 0%, #111 100%)", display: "flex", alignItems: "center", justifyContent: "center" },
    cardIcon:   { fontSize: "48px", color: "#fa4040", fontFamily: "'Georgia', serif" },
    cardBody:   { padding: "16px 20px" },
    cardName:   { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 6px 0", fontWeight: "bold" },
    cardDesc:   { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", margin: "0 0 8px 0" },
    cardMeta:   { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", color: "#fa4040" },
    emptyMsg:   { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px", padding: "40px 0" },
};


export default BlogGroupGrid;
