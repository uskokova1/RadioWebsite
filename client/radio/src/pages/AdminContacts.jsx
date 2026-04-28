import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const EMPTY_FORM = { name: '', position: '', email: '', link: '', initials: '', image: '' };

const AdminContacts = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

    const [contacts, setContacts]             = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [form, setForm]                     = useState(EMPTY_FORM);
    const [editingId, setEditingId]           = useState(null);
    const [showForm, setShowForm]             = useState(false);
    const [submitting, setSubmitting]         = useState(false);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') fetchContacts();
    }, [userData]);

    const fetchContacts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/contacts');
            if (data.success) setContacts(data.contacts);
        } catch (err) { console.error(err.message); }
    };

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = editingId
                ? await axios.put(`${backendUrl}/api/contacts/${editingId}`, form, { withCredentials: true })
                : await axios.post(`${backendUrl}/api/contacts`, form, { withCredentials: true });

            if (res.data.success) {
                if (editingId) setContacts(contacts.map(c => c._id === editingId ? res.data.contact : c));
                else setContacts([...contacts, res.data.contact]);
                toast.success(editingId ? 'Contact updated' : 'Contact added');
                resetForm();
            } else toast.error(res.data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (c) => {
        setForm({
            name: c.name, position: c.position, email: c.email,
            link: c.link || '', initials: c.initials || '', image: c.image || '',
        });
        setEditingId(c._id);
        setShowForm(true);
        fetchImages();
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/contacts/${id}`, { withCredentials: true });
            if (data.success) { setContacts(contacts.filter(c => c._id !== id)); toast.success('Contact deleted'); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Manage Contacts</CardTitle>
                    <Button
                        className='absolute right-5 top-15'
                        size="sm"
                        variant={showForm ? "outline" : "default"}
                        onClick={() => showForm ? resetForm() : (setShowForm(true), fetchImages())}
                    >
                        {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> Add Contact</>}
                    </Button>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">

                    {showForm && (
                        <ScrollArea className="h-[400px] pr-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? 'Edit Contact' : 'New Contact'}
                            </p>
                            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            <Input placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required />
                            <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            <Input placeholder="Link (optional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
                            <Input placeholder="Initials (optional)" value={form.initials} onChange={e => setForm({ ...form, initials: e.target.value })} />

                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Image <span className="text-zinc-600">· optional</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, image: '' })}
                                        className={[
                                            "flex h-14 w-14 items-center justify-center rounded-full border text-[10px]",
                                            form.image === ''
                                                ? "border-red-500 bg-red-500/15 text-red-400"
                                                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
                                        ].join(' ')}
                                    >
                                        None
                                    </button>
                                    {uploadedImages.map(img => {
                                        const selected = form.image === `/uploads/${img.name}`;
                                        return (
                                            <button
                                                type="button"
                                                key={img.name}
                                                onClick={() => setForm({ ...form, image: `/uploads/${img.name}` })}
                                                className={[
                                                    "h-14 w-14 overflow-hidden rounded-full border",
                                                    selected ? "border-red-500 ring-2 ring-red-500/40" : "border-zinc-700 hover:border-zinc-500",
                                                ].join(' ')}
                                            >
                                                <img src={`${backendUrl}/uploads/${img.name}`} alt={img.name} className="h-full w-full object-cover" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Contact'}
                                </Button>
                            </div>
                        </form>
                        </ScrollArea>
                    )}

                    <ScrollArea className="h-[340px] pr-3">
                        <div className="space-y-2">
                            {contacts.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-8">No contacts yet.</p>
                            )}
                            {contacts.map(c => (
                                <div
                                    key={c._id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-500 bg-zinc-900 overflow-hidden shrink-0">
                                            {c.image ? (
                                                <img src={`${backendUrl}${c.image}`} alt={c.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-semibold text-red-400">{c.initials || '?'}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">{c.position}</p>
                                            <p className="text-xs text-zinc-400 truncate">{c.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button variant="outline" size="icon-xs" title="Edit" onClick={() => handleEdit(c)}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="destructive" size="icon-xs" title="Delete" onClick={() => handleDelete(c._id)}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminContacts;
