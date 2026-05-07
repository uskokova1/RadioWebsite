import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import Markdown from 'react-showdown';
import axios from 'axios';
import { Plus, X, Pencil, Trash2, ChevronDown, ChevronUp, Clock, CalendarDays } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import CommentSection from '@/components/CommentSection.jsx';

const DAYS = [
    { short: 'Mon', val: 'mon' },
    { short: 'Tue', val: 'tue' },
    { short: 'Wed', val: 'wed' },
    { short: 'Thu', val: 'thu' },
    { short: 'Fri', val: 'fri' },
    { short: 'Sat', val: 'sat' },
    { short: 'Sun', val: 'sun' },
];

const AdminEvents = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

    const [events, setEvents]             = useState([]);
    const [loading, setLoading]             = useState(true);
    const [title, setTitle]                = useState('');
    const [description, setDescription]    = useState('');
    const [selectedImagePath, setSelectedImagePath] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [eventDates, setEventDates]       = useState([]);
    const [recurrence, setRecurrence]       = useState('none');
    const [repeatDays, setRepeatDays]      = useState([]);
    const [eventTime, setEventTime]        = useState('');
    const [editingId, setEditingId]         = useState(null);
    const [showForm, setShowForm]           = useState(false);
    const [submitting, setSubmitting]       = useState(false);
    const [expandedId, setExpandedId]     = useState(null);

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

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const resetForm = () => {
        setTitle(''); setDescription(''); setSelectedImagePath(null);
        setEventDates([]); setRecurrence('none'); setRepeatDays([]);
        setEventTime(''); setShowForm(false); setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const body = {
                title, description,
                image: selectedImagePath,
                dates: recurrence !== 'none' ? [] : eventDates,
                recurrence,
                repeatDays: recurrence !== 'none' ? repeatDays : [],
                time: eventTime || null,
            };
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/events/${editingId}`, body, { withCredentials: true });
                if (data.success) { setEvents(events.map(ev => ev._id === editingId ? data.event : ev)); toast.success('Event updated'); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/events`, body, { withCredentials: true });
                if (data.success) { setEvents([data.event, ...events]); toast.success('Event created'); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (ev) => {
        setTitle(ev.title); setDescription(ev.description);
        setSelectedImagePath(ev.image || null);
        setEventDates((ev.dates || []).map(d => new Date(d)));
        setRecurrence(ev.recurrence || 'none');
        setRepeatDays(ev.repeatDays || []);
        setEventTime(ev.time || '');
        setEditingId(ev._id); setShowForm(true); setExpandedId(null);
        fetchImages();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/events/${id}`, { withCredentials: true });
            if (data.success) { setEvents(events.filter(ev => ev._id !== id)); toast.success('Event deleted'); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 flex">
                    <div className='absolute right-0 px-5'>
                    <Button
                        size="sm"
                        variant={showForm ? "outline" : "default"}
                        onClick={() => showForm ? resetForm() : (setShowForm(true), fetchImages())}
                    >
                        {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Event</>}
                    </Button>
                    </div>
                    <CardTitle className="text-2xl font-semibold">Event Management</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">


                    {showForm && (
                        <ScrollArea className="h-[420px] pr-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? 'Edit Event' : 'New Event'}
                            </p>

                            <Input
                                type="text"
                                placeholder="Event Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />

                            <div className="flex justify-between space-y-2">
                                <div>
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Repeats
                                </p>
                                <Button
                                    type="button"
                                    variant={recurrence === 'weekly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRecurrence(recurrence === 'weekly' ? 'none' : 'weekly')}
                                >
                                    Weekly
                                </Button>
                                </div>

                                <div>
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Time <span className="text-zinc-600">· optional</span>
                                </p>
                                <Input
                                    type="time"
                                    value={eventTime}
                                    onChange={e => setEventTime(e.target.value)}
                                    className="w-40"
                                />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="flex-row text-xs uppercase tracking-widest text-zinc-500">Schedule</p>
                                {recurrence === 'weekly' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {DAYS.map(d => {
                                            const selected = repeatDays.includes(d.val);
                                            return (
                                                <button
                                                    key={d.val}
                                                    type="button"
                                                    onClick={() => setRepeatDays(prev =>
                                                        prev.includes(d.val)
                                                            ? prev.filter(x => x !== d.val)
                                                            : [...prev, d.val]
                                                    )}
                                                    className={[
                                                        "rounded-md border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors",
                                                        selected
                                                            ? "border-red-500 bg-red-500/15 text-red-400"
                                                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
                                                    ].join(' ')}
                                                >
                                                    {d.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2 flex justify-center">
                                        <Calendar
                                            mode="multiple"
                                            selected={eventDates}
                                            onSelect={setEventDates}
                                            className="rounded-md border-0 text-white"
                                        />
                                    </div>
                                )}
                            </div>


                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Image <span className="text-zinc-600">· optional</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImagePath(null)}
                                        className={[
                                            "flex h-16 w-16 items-center justify-center rounded-md border text-xs",
                                            selectedImagePath === null
                                                ? "border-red-500 bg-red-500/15 text-red-400"
                                                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
                                        ].join(' ')}
                                    >
                                        None
                                    </button>
                                    {uploadedImages.map(img => {
                                        const selected = selectedImagePath === `/uploads/${img.name}`;
                                        return (
                                            <button
                                                type="button"
                                                key={img.name}
                                                onClick={() => setSelectedImagePath(`/uploads/${img.name}`)}
                                                className={[
                                                    "relative h-16 w-16 overflow-hidden rounded-md border transition-all",
                                                    selected
                                                        ? "border-red-500 ring-2 ring-red-500/40"
                                                        : "border-zinc-700 hover:border-zinc-500",
                                                ].join(' ')}
                                            >
                                                <img
                                                    src={`${backendUrl}/uploads/${img.name}`}
                                                    alt={img.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Description <span className="text-zinc-600">· Markdown supported</span>
                                </p>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <Textarea
                                        placeholder="Describe the event..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="min-h-[180px]"
                                        required
                                    />
                                    <div className="prose prose-invert prose-sm max-w-none min-h-[180px] rounded-md border border-zinc-800 bg-zinc-900 p-3 overflow-auto">
                                        {!description
                                            ? <p className="text-zinc-600 italic">Preview will appear here…</p>
                                            : <Markdown markdown={description} options={{ tables: true, strikethrough: true, ghCodeBlocks: true }} />
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                                </Button>
                            </div>
                        </form>
                        </ScrollArea>
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                            {events.length} event{events.length !== 1 ? 's' : ''}
                        </p>
                        <ScrollArea className="h-[400px] pr-3">
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
                                                <div className="border-t border-zinc-800 px-4 py-3 space-y-3">
                                                    {ev.image && (
                                                        <img
                                                            src={`${backendUrl}${ev.image}`}
                                                            alt={ev.title}
                                                            className="w-full max-h-48 object-cover rounded-md"
                                                        />
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {ev.dates && ev.dates.length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-0.5">
                                                                <CalendarDays className="size-3" /> {formatDate(ev.dates[0])}
                                                            </span>
                                                        )}
                                                        {ev.recurrence === 'weekly' && ev.repeatDays?.map(d => (
                                                            <span key={d} className="text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-0.5">
                                                                {d}
                                                            </span>
                                                        ))}
                                                        {ev.recurrence && ev.recurrence !== 'none' && (
                                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5">
                                                                {ev.recurrence}
                                                            </span>
                                                        )}
                                                        {ev.time && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5">
                                                                <Clock className="size-3" /> {ev.time}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <Markdown
                                                            markdown={ev.description}
                                                            options={{ tables: true, strikethrough: true, ghCodeBlocks: true }}
                                                        />
                                                    </div>

                                                    <CommentSection targetType="event" targetId={ev._id} />
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