import React, {useContext, useEffect, useState, useMemo, useRef} from 'react';
import axios from 'axios';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import MarkdownView from 'react-showdown';
import AnalogClock from '@/components/AnalogClock.jsx';

function EventsCalendar2() {
    const { addWindow, closeGroup } = useWindowManager();
    const { backendUrl } = useContext(AppContext);
    const [events, setEvents] = useState([]);
    const [calanderUp, setCalanderUp] = useState(false);
    const calander = useRef(null);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/events`);
                if (data.success) setEvents(data.events);
            } catch (err) {
                console.error(err.message);
            }
        };
        fetchEvents();
    }, [backendUrl]);

    function getDayOfWeek(date) {
        return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    }

    // Memoized event processing
    const { eventMap, eventDateObjects } = useMemo(() => {
        const eventMap = {};

        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const endDate = new Date(todayDate);
        endDate.setMonth(endDate.getMonth() + 6);
        const endDateStr = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        function addEventOnDate(date, ev) {
            const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const key = normalized.toDateString();

            if (!eventMap[key]) eventMap[key] = [];
            if (!eventMap[key].find(e => e._id === ev._id)) {
                eventMap[key].push(ev);
            }
        }

        events.forEach(ev => {
            // Fixed date events
            if (ev.dates) {
                ev.dates.forEach(d => addEventOnDate(new Date(d), ev));
            }

            // Recurring events (fixed)
            if (ev.repeatDays && ev.repeatDays.length > 0) {
                const isBiweekly = ev.recurrence === 'biweekly';
                const anchor = ev.startDate ? new Date(ev.startDate) : todayDate;

                const day = new Date(todayDate);

                while (day <= endDateStr) {
                    const dayOfWeek = getDayOfWeek(day);

                    if (ev.repeatDays.includes(dayOfWeek)) {
                        if (isBiweekly) {
                            const diffDays = Math.floor(
                                (day - anchor) / (1000 * 60 * 60 * 24)
                            );
                            const weekIndex = Math.floor(diffDays / 7);

                            if (weekIndex % 2 === 0) {
                                addEventOnDate(new Date(day), ev);
                            }
                        } else {
                            addEventOnDate(new Date(day), ev);
                        }
                    }

                    day.setDate(day.getDate() + 1);
                }
            }
        });

        const eventDateObjects = Object.keys(eventMap).map(k => new Date(k));

        return { eventMap, eventDateObjects };
    }, [events]);

    const eventModifiers = { hasEvent: eventDateObjects };

    const handleDayClick = (day) => {
        const key = day.toDateString();
        const dayEvents = eventMap[key] || [];

        if (dayEvents.length === 0) return;

        const groupId = `event-${key}`;
        closeGroup(groupId);

        dayEvents.forEach((ev, idx) => {
            if (ev.time) {
                const [h, m] = ev.time.split(':').map(Number);
                addWindow({
                    windowName: `${ev.title} - Time`,
                    spawnx: 150 + idx * 120,
                    spawny: 50 + idx * 20,
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
                spawnx: 200 + idx * 80,
                spawny: 150 + idx * 40,
                group: groupId,
                content: (
                    <MarkdownView
                        className="prose prose-invert bg-zinc-900 w-70 p-3"
                        markdown={ev.description}
                    />
                ),
            });

            if(ev.image){
                addWindow({
                    windowName: ev.title,
                    spawnx: 300 + idx * 80,
                    spawny: 250 + idx * 40,
                    group: groupId,
                    content: (
                        <img
                            className="aspect-auto object-cover w-55"
                            src={backendUrl + ev.image}
                        />
                    ),
                });
            }
        });
    };

    const handleMove = () => {
        if(calanderUp){
            calander.current.style.translate = '0px -350px'
        }else {
            calander.current.style.translate = '0px 0px'
        }
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div>

            <div ref={calander} className="bg-zinc-800 absolute -bottom-70 right-15 transition-all spring-duration-300 spring-bounce-60 rounded-t-2xl">
                <div
                    onClick={() =>
                    {
                        handleMove()
                        setCalanderUp(!calanderUp)
                    }} className="flex-colbg-zinc-900 p-3 text-xl justify-self-center"
                >
                    {
                        formatter.format(Date.now()) // "April 14, 2026"
                    }
                </div>
                <Calendar
                    mode="multiple"
                    selected={eventDateObjects}
                    onSelect={() => {}}
                    className="rounded-md border-0 text-white flex-col"
                    style={
                        {translate: '0px 0px'}}
                    onDayClick={handleDayClick}
                    modifiers={eventModifiers}
                    classNames={{
                        hasEvent:
                            'bg-red-500/30 !text-white font-bold border-2 border-red-500 rounded-full',
                    }}
                />
            </div>
        </div>
    );
}

export default EventsCalendar2;