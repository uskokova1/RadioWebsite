import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import CommentSection from "../components/CommentSection.jsx";

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
    const [rsvpLoading, setRsvpLoading] = useState(null); // id of event being rsvp'd

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
            if (editingId) {
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

    const handleEdit = (ev) => { setTitle(ev.title); setDescription(ev.description); setEditingId(ev._id); setShowForm(true); };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/events/${id}`, { withCredentials: true });
            if (data.success) { setEvents(events.filter(ev => ev._id !== id)); toast.success("Event deleted"); if (expandedId === id) setExpandedId(null); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleRsvp = async (eventId) => {
        if (!userData) return toast.error("Log in to RSVP");
        setRsvpLoading(eventId);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/events/${eventId}/rsvp`,
                {}, { withCredentials: true }
            );
            if (data.success) {
                // update the rsvps array in local state
                setEvents(events.map(ev => {
                    if (ev._id !== eventId) return ev;
                    const userId = userData._id;
                    const alreadyIn = ev.rsvps?.some(id => id.toString() === userId?.toString());
                    return {
                        ...ev,
                        rsvps: alreadyIn
                            ? ev.rsvps.filter(id => id.toString() !== userId?.toString())
                            : [...(ev.rsvps || []), userId],
                    };
                }));
            } else {
                toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setRsvpLoading(null); }
    };

    const isGoing = (ev) => {
        if (!userData?._id) return false;
        return ev.rsvps?.some(id => id.toString() === userData._id.toString());
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
                        <p style={styles.formLabel}>{editingId ? "EDIT EVENT" : "NEW EVENT"}</p>
                        <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                        <textarea placeholder="Describe the event..." value={description} onChange={e => setDescription(e.target.value)} style={styles.textarea} required />
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? "Saving..." : editingId ? "Save Changes" : "Post Event"}
                        </button>
                    </form>
                )}

                <div style={styles.list}>
                    {loading && <p style={styles.emptyMsg}>Loading events...</p>}
                    {!loading && events.length === 0 && <p style={styles.emptyMsg}>No events yet. Check back soon.</p>}
                    {events.map(ev => {
                        const expanded = expandedId === ev._id;
                        const going    = isGoing(ev);
                        const count    = ev.rsvps?.length || 0;

                        return (
                            <div key={ev._id} style={styles.card}>
                                <div style={styles.cardClickable} onClick={() => setExpandedId(expanded ? null : ev._id)}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={styles.cardMeta}>{ev.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(ev.createdAt)}</p>
                                        <h3 style={styles.cardTitle}>{ev.title}</h3>
                                        {!expanded && <p style={styles.cardDesc}>{ev.description?.slice(0, 120)}{ev.description?.length > 120 ? '...' : ''}</p>}
                                    </div>
                                    <div style={styles.cardRight}>
                                        {/* rsvp count badge — always visible */}
                                        {count > 0 && (
                                            <div style={{
                                                ...styles.rsvpBadge,
                                                background: going ? '#1a2e1a' : '#1e1e1e',
                                                borderColor: going ? '#4caf50' : '#333',
                                                color: going ? '#4caf50' : '#555',
                                            }}>
                                                {going ? '✓' : '◎'} {count}
                                            </div>
                                        )}
                                        <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {expanded && (
                                    <div style={styles.expandedBody}>
                                        <p style={styles.cardDescFull}>{ev.description}</p>

                                        {/* RSVP section */}
                                        <div style={styles.rsvpSection}>
                                            <div style={styles.rsvpInfo}>
                                                <span style={styles.rsvpCount}>
                                                    {count === 0
                                                        ? "No RSVPs yet"
                                                        : `${count} ${count === 1 ? 'person' : 'people'} going`}
                                                </span>
                                                {going && (
                                                    <span style={styles.rsvpYouBadge}>You're going!</span>
                                                )}
                                            </div>

                                            {userData ? (
                                                <button
                                                    style={{
                                                        ...styles.rsvpBtn,
                                                        background:  going ? '#1a2e1a' : '#fa4040',
                                                        borderColor: going ? '#4caf50' : '#fa4040',
                                                        color:       going ? '#4caf50' : '#fff',
                                                    }}
                                                    onClick={() => handleRsvp(ev._id)}
                                                    disabled={rsvpLoading === ev._id}
                                                >
                                                    {rsvpLoading === ev._id
                                                        ? '...'
                                                        : going ? '✓ Going — Cancel' : 'RSVP'}
                                                </button>
                                            ) : (
                                                <span style={styles.rsvpLoginHint}>Log in to RSVP</span>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <div style={styles.cardActions}>
                                                <button style={styles.editBtn} onClick={() => handleEdit(ev)}>Edit</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(ev._id)}>Delete</button>
                                            </div>
                                        )}

                                        <CommentSection targetType="event" targetId={ev._id} />
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
    page:         { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:       { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:       { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a" },
    eyebrow:      { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "5px", color: "#fa4040", margin: "0 0 10px 0" },
    pageTitle:    { fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: "bold", color: "#f5f0e8", margin: "0", letterSpacing: "-1px" },
    titleLine:    { width: "40px", height: "3px", background: "#fa4040", marginTop: "16px" },
    headerSub:    { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#555", letterSpacing: "2px", margin: "14px 0 0 0" },
    section:      { padding: "24px 32px 0" },
    newBtn:       { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fa404055", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtn:    { color: "#aaa", background: "#222", borderColor: "#444" },
    form:         { margin: "20px 32px", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
    formLabel:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:        { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    textarea:     { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%", minHeight: "100px", resize: "vertical" },
    submitBtn:    { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    list:         { padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "12px" },
    emptyMsg:     { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px" },
    card:         { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    cardClickable:{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", cursor: "pointer", gap: "12px" },
    cardRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
    expandIcon:   { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555" },
    rsvpBadge:    { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "1px", border: "1px solid", borderRadius: "20px", padding: "3px 8px" },
    expandedBody: { padding: "0 20px 20px" },
    cardMeta:     { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#444", margin: "0 0 8px 0" },
    cardTitle:    { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 6px 0", fontWeight: "bold" },
    cardDesc:     { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", margin: "0" },
    cardDescFull: { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 16px 0" },
    // RSVP section
    rsvpSection:  { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" },
    rsvpInfo:     { display: "flex", flexDirection: "column", gap: "4px" },
    rsvpCount:    { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#666", letterSpacing: "1px" },
    rsvpYouBadge: { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", color: "#4caf50" },
    rsvpBtn:      { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", border: "1px solid", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 },
    rsvpLoginHint:{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#444", letterSpacing: "2px" },
    cardActions:  { display: "flex", gap: "8px", marginBottom: "16px" },
    editBtn:      { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:    { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
};

export default Events;