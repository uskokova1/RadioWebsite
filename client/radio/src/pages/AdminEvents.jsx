import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const AdminEvents = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [events, setEvents]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId]     = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => { if (!userData) getUserData(); }, []);
    useEffect(() => {
        if (userData && userData.role !== 'admin') { navigate('/'); toast.error('Not an admin'); }
        else if (userData) fetchEvents();
    }, [userData]);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/events');
            if (data.success) setEvents(data.events);
        } catch (err) { console.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => { setTitle(''); setDescription(''); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/events/${editingId}`, { title, description }, { withCredentials: true });
                if (data.success) { setEvents(events.map(ev => ev._id === editingId ? data.event : ev)); toast.success('Event updated'); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/events`, { title, description }, { withCredentials: true });
                if (data.success) { setEvents([data.event, ...events]); toast.success('Event created'); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (ev) => {
        setTitle(ev.title); setDescription(ev.description);
        setEditingId(ev._id); setShowForm(true); setExpandedId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/events/${id}`, { withCredentials: true });
            if (data.success) { setEvents(events.filter(ev => ev._id !== id)); toast.success('Event deleted'); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')} className='flex rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft /> Back
                    </button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>Event Management</h2>
                </div>

                <div style={styles.body}>
                    {/* form toggle */}
                    <button
                        style={{ ...styles.newBtn, ...(showForm ? styles.cancelBtnStyle : {}) }}
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                    >
                        {showForm ? '✕ Cancel' : '+ New Event'}
                    </button>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <p style={styles.formLabel}>{editingId ? 'EDITING EVENT' : 'NEW EVENT'}</p>
                            <input
                                placeholder="Event Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <textarea
                                placeholder="Event description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={styles.textarea}
                                required
                            />
                            <button type="submit" style={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                            </button>
                        </form>
                    )}

                    {/* stats bar */}
                    <div style={styles.statsBar}>
                        <span style={styles.statChip}>{events.length} EVENTS</span>
                    </div>

                    {/* event list */}
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && events.length === 0 && <p style={styles.empty}>No events yet.</p>}

                    <div style={styles.list}>
                        {events.map(ev => {
                            const expanded = expandedId === ev._id;
                            return (
                                <div key={ev._id} style={styles.card}>
                                    {/* card header — always visible */}
                                    <div style={styles.cardRow}>
                                        <div style={styles.cardLeft} onClick={() => setExpandedId(expanded ? null : ev._id)}>
                                            <div style={styles.cardDot} />
                                            <div>
                                                <p style={styles.cardTitle}>{ev.title}</p>
                                                <p style={styles.cardMeta}>
                                                    {ev.author?.username || 'WSIN'} · {formatDate(ev.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={styles.cardActions}>
                                            <button style={styles.editBtn} onClick={() => handleEdit(ev)}>Edit</button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(ev._id)}>Delete</button>
                                            <span style={styles.chevron} onClick={() => setExpandedId(expanded ? null : ev._id)}>
                                                {expanded ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* expanded description */}
                                    {expanded && (
                                        <div style={styles.cardExpanded}>
                                            <p style={styles.cardDesc}>{ev.description}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page:           { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:         { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:         { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", display: "flex", flexDirection: "column" },
    body:           { padding: "24px 32px" },
    newBtn:         { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fa404055", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtnStyle: { color: "#aaa", background: "#222", borderColor: "#444" },
    form:           { margin: "16px 0", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
    formLabel:      { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:          { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    textarea:       { fontFamily: "'Georgia', serif", fontSize: "14px", color: "#ccc", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%", minHeight: "100px", resize: "vertical" },
    submitBtn:      { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    statsBar:       { display: "flex", gap: "10px", margin: "20px 0 12px 0" },
    statChip:       { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "3px", color: "#555", background: "#222", border: "1px solid #2e2e2e", borderRadius: "3px", padding: "4px 10px" },
    empty:          { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", letterSpacing: "2px", textAlign: "center", padding: "40px 0" },
    list:           { display: "flex", flexDirection: "column", gap: "8px" },
    card:           { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", overflow: "hidden" },
    cardRow:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" },
    cardLeft:       { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", flex: 1, minWidth: 0 },
    cardDot:        { width: "6px", height: "6px", borderRadius: "50%", background: "#fa4040", flexShrink: 0 },
    cardTitle:      { fontFamily: "'Georgia', serif", fontSize: "15px", color: "#f5f0e8", margin: "0 0 2px 0", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "380px" },
    cardMeta:       { fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "2px", color: "#555", margin: "0" },
    cardActions:    { display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 },
    editBtn:        { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
    deleteBtn:      { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "1px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "4px 10px", cursor: "pointer" },
    chevron:        { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", cursor: "pointer", padding: "0 4px" },
    cardExpanded:   { padding: "0 16px 16px 34px", borderTop: "1px solid #2a2a2a" },
    cardDesc:       { fontFamily: "'Georgia', serif", fontSize: "13px", color: "#888", lineHeight: "1.6", margin: "12px 0 0 0" },
};

export default AdminEvents;