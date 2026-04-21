import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import MarkdownView from 'react-showdown';

import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Avatar } from '@/components/ui/avatar.jsx';
import BlogGrid from '@/components/BlogGrid.jsx';
import CommentSection from '@/components/CommentSection.jsx';
import Login from '@/pages/Login.jsx';

import { CONTACTS_GROUP, buildContactWindows } from '@/components/ContactsButton.jsx';

const BLOGS_GROUP = 1;
const LOGIN_GROUP = 5;

// ─── Drag engine ─────────────────────────────────────────────────────────────
// Click = no drag  (mousedown + mouseup with <5px movement) → calls onActivate
// Drag  = move freely around the screen
function DraggableIcon({ src, title, initialX, initialY, onActivate }) {
    const [pos, setPos]   = useState({ x: initialX, y: initialY });
    const dragging        = useRef(false);
    const origin          = useRef({ x: 0, y: 0 });
    const startPos        = useRef({ x: 0, y: 0 });
    const moved           = useRef(false);
    // Keep a ref so the window-event handlers always see the latest toggle fn
    const activateRef     = useRef(onActivate);
    activateRef.current   = onActivate;

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return;
            const dx = e.clientX - origin.current.x;
            const dy = e.clientY - origin.current.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
            setPos({ x: startPos.current.x + dx, y: startPos.current.y + dy });
        };
        const onUp = () => {
            if (dragging.current && !moved.current) activateRef.current();
            dragging.current = false;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        };
    }, []);

    const onMouseDown = (e) => {
        dragging.current  = true;
        moved.current     = false;
        origin.current    = { x: e.clientX, y: e.clientY };
        startPos.current  = { ...pos };
        e.preventDefault();
    };

    return (
        <div
            onMouseDown={onMouseDown}
            title={title}
            style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 5 }}
            className="w-24 h-24 select-none cursor-grab active:cursor-grabbing drop-shadow-2xl
                       transition-filter hover:drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"
        >
            <video autoPlay muted loop src={src} className="w-full h-full" draggable={false} />
        </div>
    );
}

// ─── Floating Contact ─────────────────────────────────────────────────────────
export function FloatingContact() {
    const { backendUrl }                     = useContext(AppContext);
    const { addWindow, closeGroup, windows } = useWindowManager();
    const [members, setMembers]              = useState([]);
    const [randomY, setRandomY]              = useState([]);

    useEffect(() => {
        axios.get(`${backendUrl}/api/contacts`)
             .then(({ data }) => { if (data.success) setMembers(data.contacts); })
             .catch(console.error);
    }, [backendUrl]);

    useEffect(() => {
        setRandomY(members.map(() => Math.random() * 300));
    }, [members]);

    const toggle = () => {
        if (!members.length) return;
        if (windows.some(w => w.group === CONTACTS_GROUP)) {
            closeGroup(CONTACTS_GROUP);
        } else {
            buildContactWindows(members, randomY, backendUrl).forEach(w => addWindow(w));
        }
    };

    return (
        <DraggableIcon
            src="/contact.webm"
            title="About Us — drag me!"
            initialX={260}
            initialY={140}
            onActivate={toggle}
        />
    );
}

// ─── Floating Blog ────────────────────────────────────────────────────────────
export function FloatingBlog() {
    const { backendUrl }                     = useContext(AppContext);
    const { addWindow, closeGroup, windows } = useWindowManager();

    // local ref so openPost doesn't cause stale closure issues
    const whichPostOpen = useRef(null);

    const openPost = (post) => {
        closeGroup(whichPostOpen.current?._id);
        whichPostOpen.current = post;
        addWindow({
            windowName: post.title, spawnx: 200, spawny: 80, group: post._id,
            content: <img className="aspect-square object-cover w-65" draggable={false}
                          src={backendUrl + post.image} alt={post.title} />,
        });
        addWindow({
            windowName: post.title, spawnx: 500, spawny: 150, group: post._id,
            content: <MarkdownView className="prose prose-invert bg-zinc-900 w-70 p-3"
                                   markdown={post.description} />,
        });
        addWindow({
            windowName: post.title, spawnx: 200, spawny: 350, group: post._id,
            content: <CommentSection targetType="post" targetId={post._id} />,
        });
    };

    const handleGroupSelect = async (group) => {
        closeGroup(whichPostOpen.current?._id);
        whichPostOpen.current = null;
        try {
            const { data } = await axios.get(`${backendUrl}/api/posts/blog/${group._id}`);
            const posts = data.success ? data.posts : [];
            closeGroup(BLOGS_GROUP);
            addWindow({
                windowName: `${group.name} — Posts`,
                spawnx: 300, spawny: 200, group: BLOGS_GROUP,
                content: (
                    <div className="bg-zinc-900 w-60 min-h-32 max-h-96 overflow-y-auto">
                        {posts.length === 0 && (
                            <p className="text-zinc-400 text-sm p-3">No posts in this group yet.</p>
                        )}
                        {posts.map(post => (
                            <div key={post._id} className="p-1.5">
                                <Card className="w-full bg-zinc-900 border-zinc-800 text-white cursor-pointer"
                                      onClick={() => openPost(post)}>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{post.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>
                        ))}
                    </div>
                ),
            });
        } catch (err) { toast.error(err.message); }
    };

    const toggle = () => {
        if (windows.some(w => w.group === BLOGS_GROUP)) {
            closeGroup(BLOGS_GROUP);
        } else {
            addWindow({
                windowName: 'Blog Groups', spawnx: 300, spawny: 200, group: BLOGS_GROUP,
                content: <BlogGrid onVariableChange={handleGroupSelect} />,
            });
        }
    };

    return (
        <DraggableIcon
            src="/clipboard.webm"
            title="Blog — drag me!"
            initialX={480}
            initialY={170}
            onActivate={toggle}
        />
    );
}

// ─── Floating Login ───────────────────────────────────────────────────────────
export function FloatingLogin() {
    const { addWindow, closeGroup, windows } = useWindowManager();

    const toggle = () => {
        if (windows.some(w => w.group === LOGIN_GROUP)) {
            closeGroup(LOGIN_GROUP);
        } else {
            addWindow({
                windowName: 'Sign In', spawnx: 300, spawny: 200, group: LOGIN_GROUP,
                content: <Login />,
            });
        }
    };

    return (
        <DraggableIcon
            src="/login.webm"
            title="Login — drag me!"
            initialX={700}
            initialY={130}
            onActivate={toggle}
        />
    );
}
