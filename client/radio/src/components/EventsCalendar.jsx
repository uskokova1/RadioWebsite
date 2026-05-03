import React, { useContext, useEffect, useState, useMemo } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import axios from 'axios';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import MarkdownView from 'react-showdown';
import AnalogClock from '@/components/AnalogClock.jsx';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDayOfWeek(date) {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

function buildEventMap(events) {
    const eventMap = {};
    const today    = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDate   = new Date(todayDate);
    endDate.setMonth(endDate.getMonth() + 6);

    function addEventOnDate(date, ev) {
        const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const key = normalized.toDateString();
        if (!eventMap[key]) eventMap[key] = [];
        if (!eventMap[key].find(e => e._id === ev._id)) eventMap[key].push(ev);
    }

    events.forEach(ev => {
        if (ev.dates) ev.dates.forEach(d => addEventOnDate(new Date(d), ev));

        if (ev.repeatDays && ev.repeatDays.length > 0) {
            const isBiweekly = ev.recurrence === 'biweekly';
            const anchor = ev.startDate ? new Date(ev.startDate) : todayDate;
            const day = new Date(todayDate);
            while (day <= endDate) {
                const dow = getDayOfWeek(day);
                if (ev.repeatDays.includes(dow)) {
                    if (isBiweekly) {
                        const diffDays  = Math.floor((day - anchor) / 86400000);
                        const weekIndex = Math.floor(diffDays / 7);
                        if (weekIndex % 2 === 0) addEventOnDate(new Date(day), ev);
                    } else {
                        addEventOnDate(new Date(day), ev);
                    }
                }
                day.setDate(day.getDate() + 1);
            }
        }
    });

    return eventMap;
}

// ─── RSVP pill ───────────────────────────────────────────────────────────────

function RsvpButton({ ev, backendUrl, userData }) {
    const [rsvps, setRsvps]     = useState(ev.rsvps || []);
    const [loading, setLoading] = useState(false);

    const isGoing = userData?._id
        ? rsvps.some(id => id.toString() === userData._id.toString())
        : false;

    const handleRsvp = async () => {
        if (!userData) return;
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/events/${ev._id}/rsvp`,
                {}, { withCredentials: true }
            );
            if (data.success) {
                setRsvps(prev =>
                    data.isGoing
                        ? [...prev, userData._id]
                        : prev.filter(id => id.toString() !== userData._id.toString())
                );
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex items-center justify-between rounded bg-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-400">
                {rsvps.length === 0
                    ? 'No RSVPs yet'
                    : `${rsvps.length} ${rsvps.length === 1 ? 'person' : 'people'} going`}
            </span>
            {userData ? (
                <button
                    onClick={handleRsvp}
                    disabled={loading}
                    className={[
                        'flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                        isGoing
                            ? 'border border-green-500/50 text-green-400 hover:bg-green-500/10'
                            : 'bg-red-500 text-white hover:bg-red-600',
                    ].join(' ')}
                >
                    {loading ? '…' : isGoing ? <><Check className="size-3" /> Going</> : 'RSVP'}
                </button>
            ) : (
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Log in to RSVP
                </span>
            )}
        </div>
    );
}

// ─── Self-contained calendar window ──────────────────────────────────────────
// Defined OUTSIDE EventsCalendar so React never replaces the component type on
// re-render (which would cause an unmount/remount storm).

function CalendarWindowContent() {
    const { backendUrl, userData }    = useContext(AppContext);
    const { addWindow, closeGroup }   = useWindowManager();
    const [events, setEvents]         = useState([]);

    // Fetch fresh events every time this window is opened (component mounts)
    useEffect(() => {
        axios.get(`${backendUrl}/api/events`)
            .then(({ data }) => { if (data.success) setEvents(data.events); })
            .catch(console.error);
    }, [backendUrl]);

    const { eventMap, eventDateObjects } = useMemo(() => {
        const eventMap = buildEventMap(events);
        const eventDateObjects = Object.keys(eventMap).map(k => new Date(k));

        return { eventMap, eventDateObjects };
    }, [events]);

    const eventModifiers = { hasEvent: eventDateObjects };

    const handleDayClick = (day) => {
        const key       = day.toDateString();
        const dayEvents = eventMap[key] || [];
        if (dayEvents.length === 0) return;

        const groupId = `event-${key}`;
        closeGroup(groupId);

        dayEvents.forEach((ev, idx) => {
            if (ev.time) {
                const [h, m] = ev.time.split(':').map(Number);
                addWindow({
                    windowName: `${ev.title} - Time`,
                    spawnx: window.innerWidth/4,
                    spawny: window.innerHeight/2,
                    group: groupId,
                    content: (
                        <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900">
                            <AnalogClock hours={h} minutes={m} />
                            <p className="text-zinc-400 text-xs font-mono tracking-wider">{ev.time}</p>
                        </div>
                    ),
                });
            }

            addWindow({
                windowName: ev.title,
                spawnx: window.innerWidth/2,
                spawny: window.innerHeight/4,
                group: groupId,
                content: (
                    <div className="bg-zinc-900 w-72 space-y-3 p-3">
                        {ev.image && (
                            <img
                                className="w-full max-h-40 object-cover rounded"
                                src={backendUrl + ev.image}
                                alt={ev.title}
                            />
                        )}
                        <div className="prose prose-invert prose-sm max-w-none">
                            <MarkdownView
                                markdown={ev.description}
                                options={{ tables: true, strikethrough: true }}
                            />
                        </div>
                        <RsvpButton ev={ev} backendUrl={backendUrl} userData={userData} />
                    </div>
                ),
            });
        });
    };

    return (
        <div className="bg-zinc-900">
            <Calendar
                mode="multiple"
                selected={eventDateObjects}
                onSelect={() => {}}
                className="rounded-md border-0 text-white w-70"
                onDayClick={handleDayClick}
                modifiers={eventModifiers}
                classNames={{
                    hasEvent: 'bg-red-500/30 !text-white font-bold border-2 border-red-500 rounded-full',
                }}
            />
        </div>
    );
}

// ─── Sidebar / floating button ────────────────────────────────────────────────

function EventsCalendar({ headless = false, toggle }) {
    const { addWindow, closeGroup } = useWindowManager();
    // true = "already open" so the first useEffect call (on mount) hits the
    // else-branch (no-op close) and resets the flag to false, leaving the
    // calendar in the correct "closed" state without opening anything.
    const [openAlready, setOpenAlready] = useState(true);

    const handleToggle = () => {
        if (!openAlready) {
            setOpenAlready(true);
            addWindow({
                windowName: 'Events Calendar',
                spawnx: window.innerWidth  / 4,
                spawny: window.innerHeight / 4,
                group: 'calendar',
                // Fresh component every open → fetches latest events on mount
                content: <CalendarWindowContent />,
            });
        } else {
            setOpenAlready(false);
            closeGroup('calendar');
        }
    };

    useEffect(() => {
        handleToggle();
    }, [toggle]);

    return (
        <div>
            {!headless && (
                <button
                    onClick={handleToggle}
                    title="Calendar"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl
                               border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg
                               backdrop-blur transition-all hover:scale-110 hover:border-red-500
                               hover:text-red-400"
                >
                    <CalendarDays className="size-6" />
                </button>
            )}
        </div>
    );
}

export default EventsCalendar;