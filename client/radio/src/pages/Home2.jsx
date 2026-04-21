import React, { useContext } from 'react';
import { Disc3 } from 'lucide-react';

import BlogButton from '@/components/BlogButton.jsx';
import ContactsButton from '@/components/ContactsButton.jsx';
import EventsCalendar from '@/components/EventsCalendar.jsx';
import EventsCalendar2 from '@/components/EventsCalandar2.jsx';
import ProfileButton from '@/components/ProfileButton.jsx';
import AccountButton from '@/components/AccountButton.jsx';
import RadioButton from '@/components/RadioButton.jsx';
import EventsFormButton from '@/components/EventsFormButton.jsx';
import AdminButton from '@/components/AdminButton.jsx';
import AuthButton from '@/components/AuthButton.jsx';

import { WindowManager } from '@/context/WindowManager.jsx';
import { AppContext } from '@/context/AppContext.jsx';

const App = () => {
    const { userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    return (
        <div className='polka relative min-h-screen min-w-screen z-90 overflow-hidden'>

            <WindowManager />

            {/* Brand chip top-left */}
            <div className="absolute left-5 top-3 flex items-center gap-2 text-zinc-300 select-none pointer-events-none">
                <Disc3 className="size-5 text-red-500" />
                <span className="text-xs uppercase tracking-[0.3em] font-semibold">WSIN</span>
            </div>

            {/* Existing buttons */}
            <EventsCalendar />     {/* top-35 */}
            <ContactsButton />     {/* top-45 */}
            <BlogButton />         {/* top-75 */}

            {/* New page access buttons (conditional on login) */}
            <ProfileButton />      {/* top-135 */}
            <AccountButton />      {/* top-165 */}
            <RadioButton />        {/* top-195 */}
            <EventsFormButton />   {/* top-225 */}

            {/* Admin-only */}
            <AdminButton />        {/* top-255 */}

            {/* Secondary calendar widget */}
            <EventsCalendar2 />

            {/* Floating auth button bottom-right */}
            <AuthButton />

            {/* Status chip top-right */}
            <div className="absolute top-3 right-5 flex items-center gap-2 text-xs text-zinc-400">
                <span className={`inline-block size-2 rounded-full ${userData ? 'bg-green-500' : 'bg-zinc-600'}`} />
                {userData
                    ? <span><span className="text-zinc-300 font-medium">{userData.username || 'User'}</span>{isAdmin && <span className="ml-1 text-red-400">· admin</span>}</span>
                    : <span>Not signed in</span>}
            </div>
        </div>
    );
};

export default App;
