import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const EMPTY_FORM = { name: '', position: '', email: '', link: '', initials: '' };

const AdminContacts = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [contacts, setContacts]   = useState([]);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm]   = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/');
            toast.error('Not an admin');
        } else if (userData) {
            fetchContacts();
        }
    }, [userData]);

    const fetchContacts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/contacts');
            if (data.success) setContacts(data.contacts);
        } catch (err) { console.error(err.message); }
    };

    const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/contacts/${editingId}`, form, { withCredentials: true });
                if (data.success) {
                    setContacts(contacts.map(c => c._id === editingId ? data.contact : c));
                    toast.success('Contact updated');
                    resetForm();
                } else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/contacts`, form, { withCredentials: true });
                if (data.success) {
                    setContacts([...contacts, data.contact]);
                    toast.success('Contact added');
                    resetForm();
                } else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (c) => {
        setForm({ name: c.name, position: c.position, email: c.email, link: c.link || '', initials: c.initials });
        setEditingId(c._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/contacts/${id}`, { withCredentials: true });
            if (data.success) { setContacts(contacts.filter(c => c._id !== id)); toast.success('Contact deleted'); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')}
                            className='flex rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft /> Back
                    </button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>Manage Contacts</h2>
                </div>

                <div style={styles.body}>
                    <button
                        style={{ ...styles.newBtn, ...(showForm ? styles.cancelBtn : {}) }}
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                    >
                        {showForm ? '✕ Cancel' : '+ Add Contact'}
                    </button>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <p style={styles.formLabel}>{editingId ? 'EDIT CONTACT' : 'NEW CONTACT'}</p>
                            {['name', 'position', 'email', 'initials', 'link'].map(field => (
                                <input
                                    key={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1) + (field === 'link' ? ' (optional)' : '')}
                                    value={form[field]}
                                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                                    style={styles.input}
                                    required={field !== 'link'}
                                />
                            ))}
                            <button type="submit" style={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Contact'}
                            </button>
                        </form>
                    )}

                    <div style={styles.list}>
                        {contacts.length === 0 && <p style={styles.empty}>No contacts yet.</p>}
                        {contacts.map(c => (
                            <div key={c._id} style={styles.card}>
                                <div style={styles.cardLeft}>
                                    <div style={styles.avatar}><span style={styles.avatarText}>{c.initials}</span></div>
                                    <div>
                                        <p style={styles.cardName}>{c.name}</p>
                                        <p style={styles.cardPos}>{c.position}</p>
                                        <p style={styles.cardEmail}>{c.email}</p>
                                    </div>
                                </div>
                                <div style={styles.cardActions}>
                                    <button style={styles.editBtn} onClick={() => handleEdit(c)}>Edit</button>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(c._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page:        { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:      { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:      { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", display: "flex", flexDirection: "column" },
    body:        { padding: "24px 32px" },
    newBtn:      { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fa4040", background: "#241212", border: "1px solid #fa404055", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" },
    cancelBtn:   { color: "#aaa", background: "#222", borderColor: "#444" },
    form:        { margin: "16px 0", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
    formLabel:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    input:       { fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#f5f0e8", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "10px 12px", outline: "none", width: "100%" },
    submitBtn:   { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    list:        { marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" },
    empty:       { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", letterSpacing: "2px", textAlign: "center", padding: "40px 0" },
    card:        { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    cardLeft:    { display: "flex", gap: "16px", alignItems: "center" },
    avatar:      { width: "48px", height: "48px", borderRadius: "50%", background: "#322d2d", border: "2px solid #fa4040", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText:  { fontFamily: "'Courier New', monospace", fontSize: "14px", color: "#fa4040", fontWeight: "bold" },
    cardName:    { fontFamily: "'Georgia', serif", fontSize: "15px", color: "#f5f0e8", margin: "0 0 2px 0", fontWeight: "bold" },
    cardPos:     { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#666", letterSpacing: "2px", margin: "0 0 2px 0" },
    cardEmail:   { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#555", margin: "0" },
    cardActions: { display: "flex", gap: "8px" },
    editBtn:     { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#fa4040", background: "transparent", border: "1px solid #fa404044", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
    deleteBtn:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer" },
};

export default AdminContacts;