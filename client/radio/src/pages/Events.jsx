import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Markdown from 'react-showdown';
import { ChevronDown, ChevronUp, Plus, X, Pencil, Trash2, Check, Clock, CalendarDays } from "lucide-react";

import { AppContext } from "../context/AppContext.jsx";
import CommentSection from "../components/CommentSection.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";

const DAYS = [
    { short: 'Mon', val: 'mon' },
    { short: 'Tue', val: 'tue' },
    { short: 'Wed', val: 'wed' },
    { short: 'Thu', val: 'thu' },
    { short: 'Fri', val: 'fri' },
    { short: 'Sat', val: 'sat' },
    { short: 'Sun', val: 'sun' },
];

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

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const resetForm = () => {
        setTitle(""); setDescription(""); setSelectedImagePath(null);
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
            const res = editingId
                ? await axios.put(`${backendUrl}/api/events/${editingId}`, body, { withCredentials: true })
                : await axios.post(`${backendUrl}/api/events`, body, { withCredentials: true });

            if (res.data.success) {
                if (editingId) setEvents(events.map(ev => ev._id === editingId ? res.data.event : ev));
                else setEvents([res.data.event, ...events]);
                toast.success(editingId ? "Event updated" : "Event created");
                resetForm();
            } else toast.error(res.data.message);
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
            if (data.success) {
                setEvents(events.filter(ev => ev._id !== id));
                toast.success("Event deleted");
                if (expandedId === id) setExpandedId(null);
            } else toast.error(data.message);
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
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setRsvpLoading(null); }
    };

    const isGoing = (ev) => {
        if (!userData?._id) return false;
        return ev.rsvps?.some(id => id.toString() === userData._id.toString());
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN RADIO
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Events</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">What's happening at the station.</p>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {isAdmin && (
                        <Button
                            variant={showForm ? "outline" : "default"}
                            size="sm"
                            onClick={() => showForm ? resetForm() : (setShowForm(true), fetchImages())}
                        >
                            {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Event</>}
                        </Button>
                    )}

                    {isAdmin && showForm && (
                        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? "Edit Event" : "New Event"}
                            </p>

                            <Input
                                type="text"
                                placeholder="Event Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />

                            {/* Schedule */}
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Schedule</p>
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

                            {/* Repeats */}
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Repeats</p>
                                <Button
                                    type="button"
                                    variant={recurrence === 'weekly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRecurrence(recurrence === 'weekly' ? 'none' : 'weekly')}
                                >
                                    Weekly
                                </Button>
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
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

                            {/* Image */}
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

                            {/* Description */}
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
                                    {submitting ? "Saving..." : editingId ? "Save Changes" : "Post Event"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <ScrollArea className="h-[380px] pr-3">
                        <div className="space-y-3">
                            {loading && <p className="text-center text-xs text-zinc-500 py-8">Loading events...</p>}
                            {!loading && events.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-8">No events yet. Check back soon.</p>
                            )}
                            {events.map(ev => {
                                const expanded = expandedId === ev._id;
                                const going    = isGoing(ev);
                                const count    = ev.rsvps?.length || 0;

                                return (
                                    <Card key={ev._id} size="sm" className="bg-zinc-900/60 ring-zinc-800">
                                        <CardHeader
                                            className="cursor-pointer"
                                            onClick={() => setExpandedId(expanded ? null : ev._id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-zinc-500">
                                                        {ev.author?.username || 'WSIN'} · {formatDate(ev.createdAt)}
                                                    </p>
                                                    <CardTitle className="text-base mt-1 break-words">{ev.title}</CardTitle>
                                                    {!expanded && ev.description && (
                                                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                            {ev.description.slice(0, 140)}
                                                            {ev.description.length > 140 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    {count > 0 && (
                                                        <span className={[
                                                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                                                            going
                                                                ? "border-green-500/60 bg-green-500/10 text-green-400"
                                                                : "border-zinc-700 bg-zinc-900 text-zinc-400",
                                                        ].join(' ')}>
                                                            {going ? <Check className="size-3" /> : null} {count}
                                                        </span>
                                                    )}
                                                    {expanded
                                                        ? <ChevronUp className="size-4 text-zinc-500" />
                                                        : <ChevronDown className="size-4 text-zinc-500" />
                                                    }
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {expanded && (
                                            <CardContent className="space-y-3 pt-0">
                                                {ev.image && (
                                                    <img
                                                        src={`${backendUrl}${ev.image}`}
                                                        alt={ev.title}
                                                        className="w-full max-h-64 object-cover rounded-md"
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

                                                {/* RSVP */}
                                                <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 p-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-zinc-400">
                                                            {count === 0
                                                                ? "No RSVPs yet"
                                                                : `${count} ${count === 1 ? 'person' : 'people'} going`}
                                                        </span>
                                                        {going && (
                                                            <span className="text-[10px] uppercase tracking-widest text-green-400">
                                                                You're going
                                                            </span>
                                                        )}
                                                    </div>
                                                    {userData ? (
                                                        <Button
                                                            size="sm"
                                                            variant={going ? "outline" : "default"}
                                                            disabled={rsvpLoading === ev._id}
                                                            onClick={() => handleRsvp(ev._id)}
                                                            className={going ? "border-green-500/50 text-green-400 hover:bg-green-500/10" : "bg-red-500 hover:bg-red-600 text-white"}
                                                        >
                                                            {rsvpLoading === ev._id ? '...' : going ? (<><Check className="size-4" /> Going</>) : 'RSVP'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                                                            Log in to RSVP
                                                        </span>
                                                    )}
                                                </div>

                                                {isAdmin && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>
                                                            <Pencil className="size-4" /> Edit
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ev._id)}>
                                                            <Trash2 className="size-4" /> Delete
                                                        </Button>
                                                    </div>
                                                )}

                                                <CommentSection targetType="event" targetId={ev._id} />
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default Events;
