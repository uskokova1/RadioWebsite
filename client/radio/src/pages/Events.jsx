import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";

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

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/events');
            if (data.success) {
                setEvents(data.events);
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
                    `${backendUrl}/api/events/${editingId}`,
                    { title, description },
                    { withCredentials: true }
                );
                if (data.success) {
                    setEvents(events.map(ev => ev._id === editingId ? data.event : ev));
                    toast.success("Event updated");
                    resetForm();
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(
                    `${backendUrl}/api/events`,
                    { title, description },
                    { withCredentials: true }
                );
                if (data.success) {
                    setEvents([data.event, ...events]);
                    toast.success("Event created");
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

    const handleEdit = (ev) => {
        setTitle(ev.title);
        setDescription(ev.description);
        setEditingId(ev._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/events/${id}`,
                { withCredentials: true }
            );
            if (data.success) {
                setEvents(events.filter(ev => ev._id !== id));
                toast.success("Event deleted");
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
                    <h2 style={styles.pageTitle}>Events</h2>
                    <div style={styles.titleLine} />
                    <p style={styles.headerSub}>What's happening at the station.</p>
                </div>

                {isAdmin && (
                    <div style={styles.section}>
                        <button
                            style={{ ...styles.newBtn, ...(showForm ? styles.cancelBtn : {}) }}
                            onClick={() => showForm ? resetForm() : setShowForm(true)}
                        >
                            {showForm ? "✕ Cancel" : "+ New Event"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <p style={styles.formLabel}>{editingId !== null ? "EDIT EVENT" : "NEW EVENT"}</p>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <textarea
                            placeholder="Describe the event..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                            required
                        />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId !== null ? "Save Changes" : "Post Event"}
                        </button>
                    </form>
                )}

                <div style={styles.list}>
                    {loading && <p style={styles.emptyMsg}>Loading events...</p>}
                    {!loading && events.length === 0 && <p style={styles.emptyMsg}>No events yet. Check back soon.</p>}
                    {events.map(ev => (
                        <div key={ev._id} style={styles.card}>
                            <div style={styles.cardBody}>
                                <p style={styles.cardMeta}>
                                    {ev.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(ev.createdAt)}
                                </p>
                                <h3 style={styles.cardTitle}>{ev.title}</h3>
                                <p style={styles.cardDesc}>{ev.description}</p>
                                {isAdmin && (
                                    <div style={styles.cardActions}>
                                        <button style={styles.editBtn} onClick={() => handleEdit(ev)}>Edit</button>
                                        <button style={styles.deleteBtn} onClick={() => handleDelete(ev._id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column: {
        width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a",
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a",
    },
    header: { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow: { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle: { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine: { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    headerSub: { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", letterSpacing: "2px", margin: "14px 0 0 0" },
    section: { padding: "24px 32px 0" },
    newBtn: {
        fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px",
        color: "#fa4040", background: "#241212", border: "1px solid #fa404055",
        borderRadius: "4px", padding: "10px 20px", cursor: "pointer",
    },
    cancelBtn: { color: "#aaa", background: "#222", borderColor: "#444" },
    form: {
        margin: "20px 32px", background: "#222", border: "1px solid #333",
        borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
    },
    formLabel: { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    thumbUpload: {
        width: "100%", height: "140px", background: "#1a1a1a", border: "1px dashed #444",
        borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", overflow: "hidden",
    },
    thumbPreview: { width: "100%", height: "100%", objectFit: "cover" },
    thumbPlaceholder: { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", letterSpacing: "2px" },
    input: {
        fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8",
        background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px",
        padding: "10px 12px", outline: "none", width: "100%",
    },
    textarea: {
        fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc",
        background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px",
        padding: "10px 12px", outline: "none", width: "100%", minHeight: "100px", resize: "vertical",
    },
    submitBtn: {
        fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px",
        color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px",
        padding: "10px", cursor: "pointer", alignSelf: "flex-end",
    },
    list: { padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "16px" },
    emptyMsg: { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px" },
    card: { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    cardThumb: { width: "100%", height: "180px", objectFit: "cover", display: "block", borderBottom: "1px solid #2e2e2e" },
    cardBody: { padding: "20px" },
    cardMeta: { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#444", margin: "0 0 8px 0" },
    cardTitle: { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 10px 0", fontWeight: "bold" },
    cardDesc: { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 16px 0" },
    cardActions: { display: "flex", gap: "8px" },
    editBtn: {
        fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
        color: "#fa4040", background: "transparent", border: "1px solid #fa404044",
        borderRadius: "3px", padding: "6px 12px", cursor: "pointer",
    },
    deleteBtn: {
        fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px",
        color: "#888", background: "transparent", border: "1px solid #333",
        borderRadius: "3px", padding: "6px 12px", cursor: "pointer",
    },
};

export default Events;