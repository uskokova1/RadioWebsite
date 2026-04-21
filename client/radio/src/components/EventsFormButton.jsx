import React, { useContext } from 'react';
import { CalendarPlus } from 'lucide-react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import Events from '@/pages/Events.jsx';

const EVENTS_FORM_GROUP = 'events-form';

const EventsFormButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { userData } = useContext(AppContext);

    // any logged-in user can see the events list; admins can manage
    if (!userData) return null;

    const handleToggle = () => {
        const open = windows.some(w => w.group === EVENTS_FORM_GROUP);
        if (open) {
            closeGroup(EVENTS_FORM_GROUP);
        } else {
            addWindow({
                windowName: 'Events',
                spawnx: 340, spawny: 100,
                group: EVENTS_FORM_GROUP,
                content: (
                    <div className="w-[620px] h-[560px]">
                        <Events />
                    </div>
                ),
            });
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Events"
            className="absolute left-5 top-[660px] z-[200] flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <CalendarPlus className="size-6" />
        </button>
    );
};

export default EventsFormButton;
