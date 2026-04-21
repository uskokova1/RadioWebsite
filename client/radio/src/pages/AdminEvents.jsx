import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Plus, X, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminEvents = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

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
        if (userData && userData.role === 'admin') fetchEvents();
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
                    <CardTitle className="text-2xl font-semibold">Event Management</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                    <Button
                        size="sm"
                        variant={showForm ? "outline" : "default"}
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                    >
                        {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Event</>}
                    </Button>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? 'Edit Event' : 'New Event'}
                            </p>
                            <Input
                                placeholder="Event Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                placeholder="Event description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="min-h-[120px]"
                                required
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                            {events.length} event{events.length !== 1 ? 's' : ''}
                        </p>
                        <ScrollArea className="h-[320px] pr-3">
                            {loading && <p className="text-center text-xs text-zinc-500 py-8">Loading...</p>}
                            {!loading && events.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-8">No events yet.</p>
                            )}
                            <div className="space-y-2">
                                {events.map(ev => {
                                    const expanded = expandedId === ev._id;
                                    return (
                                        <div
                                            key={ev._id}
                                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3 p-3">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                                    onClick={() => setExpandedId(expanded ? null : ev._id)}
                                                >
                                                    <div className="size-1.5 rounded-full bg-red-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{ev.title}</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                                                            {ev.author?.username || 'WSIN'} · {formatDate(ev.createdAt)}
                                                        </p>
                                                    </div>
                                                </button>
                                                <div className="flex gap-1 shrink-0">
                                                    <Button variant="outline" size="icon-xs" title="Edit" onClick={() => handleEdit(ev)}>
                                                        <Pencil />
                                                    </Button>
                                                    <Button variant="destructive" size="icon-xs" title="Delete" onClick={() => handleDelete(ev._id)}>
                                                        <Trash2 />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => setExpandedId(expanded ? null : ev._id)}
                                                    >
                                                        {expanded ? <ChevronUp /> : <ChevronDown />}
                                                    </Button>
                                                </div>
                                            </div>
                                            {expanded && (
                                                <div className="border-t border-zinc-800 px-4 py-3">
                                                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                        {ev.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminEvents;
