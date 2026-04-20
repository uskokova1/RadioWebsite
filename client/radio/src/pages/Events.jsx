import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { Calendar } from "@/components/ui/calendar";
import Markdown from 'react-showdown';
import CommentSection from "../components/CommentSection.jsx";

function Events() {
    const { backendUrl, userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const [events, setEvents]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [selectedImagePath, setSelectedImagePath] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [eventDates, setEventDates]   = useState([]);
    const [recurrence, setRecurrence]   = useState('none');
    const [repeatDays, setRepeatDays]   = useState([]);
    const [eventTime, setEventTime]     = useState('');
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);
    const [rsvpLoading, setRsvpLoading] = useState(null);

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/events');
            if (data.success) setEvents(data.events);
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setTitle(""); setDescription(""); setSelectedImagePath(null);
        setEventDates([]); setRecurrence('none'); setRepeatDays([]);
        setEventTime(''); setShowForm(false); setEditingId(null);
    };

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const body = {
                title,
                description,
                image: selectedImagePath,
                dates: recurrence !== 'none' ? [] : eventDates,
                recurrence,
                repeatDays: recurrence !== 'none' ? repeatDays : [],
                time: eventTime || null,
            };
            if (editingId !== null) {
                const { data } = await axios.put(`${backendUrl}/api/events/${editingId}`, body, { withCredentials: true });
                if (data.success) { setEvents(events.map(ev => ev._id === editingId ? data.event : ev)); toast.success("Event updated"); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/events`, body, { withCredentials: true });
                if (data.success) { setEvents([data.event, ...events]); toast.success("Event created"); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (ev) => {
        setTitle(ev.title);
        setDescription(ev.description);
        setSelectedImagePath(ev.image || null);
        setEventDates((ev.dates || []).map(d => new Date(d)));
        setRecurrence(ev.recurrence || 'none');
        setRepeatDays(ev.repeatDays || []);
        setEventTime(ev.time || '');
        setEditingId(ev._id);
        setShowForm(true);
        fetchImages();
    };

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
                                onClick={() => showForm ? resetForm() : (setShowForm(true), fetchImages())}>
                            {showForm ? "✕ Cancel" : "+ New Event"}
                        </button>
                    </div>
                )}

                {isAdmin && showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <p style={styles.formLabel}>{editingId ? "EDIT EVENT" : "NEW EVENT"}</p>
                        <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />

                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>EVENT SCHEDULE</p>
                            {recurrence === 'weekly' ? (
                                <div style={{ display: "flex", gap: "6px", padding: "6px 0" }}>
                                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => {
                                        const val = d.toLowerCase();
                                        const selected = repeatDays.includes(val);
                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setRepeatDays(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])}
                                                style={{
                                                    ...styles.dayChip,
                                                    background:  selected ? "#241212" : "#1a1a1a",
                                                    borderColor: selected ? "#fa4040" : "#333",
                                                    color:       selected ? "#fa4040" : "#666",
                                                }}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "center", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "8px" }}>
                                    <Calendar
                                        mode="multiple"
                                        selected={eventDates}
                                        onSelect={setEventDates}
                                        className="rounded-md border-0 text-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>REPEATS</p>
                            <div style={styles.recurrenceRow}>
                                {[{ value: 'weekly', label: 'Weekly' }].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRecurrence(recurrence === opt.value ? 'none' : opt.value)}
                                        style={{
                                            ...styles.recurrenceBtn,
                                            background:  recurrence === opt.value ? "#241212" : "#1a1a1a",
                                            borderColor: recurrence === opt.value ? "#fa4040" : "#333",
                                            color:       recurrence === opt.value ? "#fa4040" : "#666",
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>EVENT TIME (optional)</p>
                            <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} style={styles.input} />
                        </div>

                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>EVENT IMAGE (optional)</p>
                            <div style={styles.imagePicker}>
                                <div
                                    style={{ ...styles.imagePickerItem, ...(selectedImagePath === null ? styles.imagePickerSelected : {}) }}
                                    onClick={() => setSelectedImagePath(null)}
                                >
                                    None
                                </div>
                                {uploadedImages.map(img => (
                                    <div
                                        key={img.name}
                                        style={{ ...styles.imagePickerItem, ...(selectedImagePath === `/uploads/${img.name}` ? styles.imagePickerSelected : {}) }}
                                        onClick={() => setSelectedImagePath(`/uploads/${img.name}`)}
                                    >
                                        <img src={`${backendUrl}/uploads/${img.name}`} alt={img.name} style={styles.imagePickerThumb} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ ...styles.formLabel, marginBottom: 8 }}>DESCRIPTION <span style={{ color: "#444" }}>— Markdown supported</span></p>
                            <div style={styles.editorWrap}>
                                <textarea
                                    placeholder="Describe the event..."
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
                                        {count > 0 && (
                                            <div style={{
                                                ...styles.rsvpBadge,
                                                background:  going ? '#1a2e1a' : '#1e1e1e',
                                                borderColor: going ? '#4caf50' : '#333',
                                                color:       going ? '#4caf50' : '#555',
                                            }}>
                                                {going ? '✓' : '◎'} {count}
                                            </div>
                                        )}
                                        <span style={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {expanded && (
                                    <div style={styles.expandedBody}>
                                        {(ev.image || (ev.dates && ev.dates.length > 0) || (ev.recurrence && ev.recurrence !== 'none')) && (
                                            <div style={styles.eventMeta}>
                                                {ev.image && (
                                                    <img
                                                        src={`${backendUrl}${ev.image}`}
                                                        alt={ev.title}
                                                        className="aspect-square object-cover w-65 rounded-lg mb-3"
                                                    />
                                                )}
                                                {((ev.dates && ev.dates.length > 0) || (ev.recurrence && ev.recurrence !== 'none')) && (
                                                    <div style={styles.eventDayRow}>
                                                        {ev.dates && ev.dates.length > 0 && (
                                                            <span style={styles.dateBadge}>{formatDate(ev.dates[0])}</span>
                                                        )}
                                                        {ev.recurrence === 'weekly' && ev.repeatDays && ev.repeatDays.length > 0 && (
                                                            <div style={{ display: "flex", gap: "4px" }}>
                                                                {ev.repeatDays.map(d => (
                                                                    <span key={d} style={styles.dayBadge}>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {ev.recurrence && ev.recurrence !== 'none' && (
                                                            <span style={styles.recurrenceBadge}>{ev.recurrence.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="prose prose-invert" style={styles.markdownBody}>
                                            <Markdown
                                                markdown={ev.description}
                                                options={{ tables: true, strikethrough: true, ghCodeBlocks: true }}
                                            />
                                        </div>

                                        <div style={styles.rsvpSection}>
                                            <div style={styles.rsvpInfo}>
                                                <span style={styles.rsvpCount}>
                                                    {count === 0
                                                        ? "No RSVPs yet"
                                                        : `${count} ${count === 1 ? 'person' : 'people'} going`}
                                                </span>
                                                {going && <span style={styles.rsvpYouBadge}>You're going!</span>}
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
                                                    {rsvpLoading === ev._id ? '...' : going ? '✓ Going — Cancel' : 'RSVP'}
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
    page:        { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:      { width: "100%", maxWidth: "1100px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
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
    submitBtn:   { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    list:        { padding: "20px 32px 48px", display: "flex", flexDirection: "column", gap: "12px" },
    emptyMsg:    { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#444", letterSpacing: "2px", textAlign: "center", marginTop: "40px" },
    card:        { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    cardClickable:{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", cursor: "pointer", gap: "12px" },
    cardRight:   { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
    expandIcon:  { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555" },
    rsvpBadge:   { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "1px", border: "1px solid", borderRadius: "20px", padding: "3px 8px" },
    expandedBody:{ padding: "0 20px 20px" },
    cardMeta:    { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "4px", color: "#444", margin: "0 0 8px 0" },
    cardTitle:   { fontFamily: "'Georgia', serif", fontSize: "20px", color: "#f5f0e8", margin: "0 0 6px 0", fontWeight: "bold" },
    cardDesc:    { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", margin: "0" },
    cardDescFull:{ fontFamily: "'Georgia', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 16px 0" },
    cardActions: { display: "flex", gap: "8px", marginBottom: "16px" },
    editBtn:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    dayChip:     { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "1px", border: "1px solid #333", borderRadius: "4px", padding: "6px 10px", cursor: "pointer" },
    recurrenceRow: { display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px" },
    recurrenceBtn: { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "1px", border: "1px solid #333", borderRadius: "4px", padding: "6px 10px", cursor: "pointer" },
    recurrenceBadge: { fontFamily: "'Courier New', monospace", fontSize: "8px", letterSpacing: "1px", color: "#fc8484", background: "#1f1515", border: "1px solid #fa404022", borderRadius: "3px", padding: "3px 6px" },
    dayBadge: { fontFamily: "'Courier New', monospace", fontSize: "8px", letterSpacing: "1px", color: "#fa4040", background: "#241212", border: "1px solid #fa404044", borderRadius: "3px", padding: "3px 6px" },
    imagePicker: { display: "flex", flexWrap: "wrap", gap: "8px", padding: "8px" },
    imagePickerItem: { width: "60px", height: "60px", cursor: "pointer", padding: "2px", border: "2px solid #333", borderRadius: "4px", overflow: "hidden" },
    imagePickerSelected: { borderColor: "#fa4040", background: "#241212" },
    imagePickerThumb: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "3px" },
    editorWrap:  { display: "flex", gap: "16px", alignItems: "flex-start" },
    editorTextarea: { flex: 1, fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "12px", outline: "none", minHeight: "280px", resize: "vertical" },
    previewPane: { flex: 1, minHeight: "280px", overflowY: "auto", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "12px" },
    eventMeta:   { marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" },
    eventDayRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
    dateBadge:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fa4040", background: "#241212", border: "1px solid #fa404044", borderRadius: "3px", padding: "4px 10px" },
    markdownBody:{ marginBottom: "16px" },
    rsvpSection: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" },
    rsvpInfo:    { display: "flex", flexDirection: "column", gap: "4px" },
    rsvpCount:   { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#666", letterSpacing: "1px" },
    rsvpYouBadge:{ fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", color: "#4caf50" },
    rsvpBtn:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", border: "1px solid", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 },
    rsvpLoginHint:{ fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#444", letterSpacing: "2px" },
};

export default Events;
