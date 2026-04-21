import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { toast } from 'react-toastify';
import { Users, CalendarPlus, Pencil, Flag, Mail, Image as ImageIcon, Layers } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Lazy-load every sub-page so the admin window opens instantly and each
// panel only downloads its code when first opened.
const ShowUsers     = lazy(() => import('@/pages/ShowUsers.jsx'));
const AdminEvents   = lazy(() => import('@/pages/AdminEvents.jsx'));
const AdminBlog     = lazy(() => import('@/pages/AdminBlog.jsx'));
const AdminComments = lazy(() => import('@/pages/AdminComments.jsx'));
const AdminContacts = lazy(() => import('@/pages/AdminContacts.jsx'));
const AdminImages   = lazy(() => import('@/pages/AdminImages.jsx'));
const AdminBlogs    = lazy(() => import('@/pages/AdminBlogs.jsx'));

const AdminDashboard = () => {
    const { userData, getUserData } = useContext(AppContext);
    const { addWindow, closeGroup, windows } = useWindowManager();

    useEffect(() => {
        if (!userData) getUserData();
    }, []);

    const isAdmin = userData && userData.role === 'admin';

    useEffect(() => {
        if (userData && !isAdmin) {
            toast.error('Not an admin');
        }
    }, [userData, isAdmin]);

    const openPanel = (groupId, name, content) => {
        const open = windows.some(w => w.group === groupId);
        if (open) {
            closeGroup(groupId);
            return;
        }
        addWindow({
            windowName: name,
            spawnx: 420, spawny: 120,
            group: groupId,
            content: (
                <div className="w-[680px] h-[580px]">
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                            Loading…
                        </div>
                    }>
                        {content}
                    </Suspense>
                </div>
            ),
        });
    };

    const cards = [
        { title: 'User Management',    desc: 'View and manage all users',           groupId: 'admin-users',    icon: Users,       Component: ShowUsers },
        { title: 'Event Management',   desc: 'Create and edit events',               groupId: 'admin-events',   icon: CalendarPlus, Component: AdminEvents },
        { title: 'Blog Posts',         desc: 'Create and edit individual posts',     groupId: 'admin-blog',     icon: Pencil,      Component: AdminBlog },
        { title: 'Blog Groups',        desc: 'Manage groups, move posts between them', groupId: 'admin-blogs',  icon: Layers,      Component: AdminBlogs },
        { title: 'Comment Moderation', desc: 'Review and remove comments',           groupId: 'admin-comments', icon: Flag,        Component: AdminComments },
        { title: 'Manage Contacts',    desc: 'Add, edit and remove contacts',        groupId: 'admin-contacts', icon: Mail,        Component: AdminContacts },
        { title: 'Image Manager',      desc: 'Upload and delete images',             groupId: 'admin-images',   icon: ImageIcon,   Component: AdminImages },
    ];

    if (!isAdmin) {
        return (
            <div className="w-full h-full bg-zinc-950 text-white">
                <Card className="w-full max-w-none rounded-none border-0 bg-zinc-950 h-full">
                    <CardHeader className="border-b border-zinc-800 pb-4">
                        <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                            Admin
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold">Access denied</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-zinc-400">You must be an administrator to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">
                        Signed in as <span className="text-zinc-300">{userData?.username || userData?.name}</span>
                    </p>
                </CardHeader>

                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cards.map(card => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.groupId}
                                    type="button"
                                    onClick={() => openPanel(card.groupId, card.title, <card.Component />)}
                                    className="group text-left rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-red-500 hover:bg-red-500/5"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 text-red-400 shrink-0 group-hover:bg-red-500/20">
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-white truncate">{card.title}</p>
                                            <p className="text-xs text-zinc-400 line-clamp-2">{card.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
