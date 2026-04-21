import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import MarkdownView from 'react-showdown';

import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Avatar } from '@/components/ui/avatar.jsx';
import BlogGrid from '@/components/BlogGrid.jsx';
import CommentSection from '@/components/CommentSection.jsx';
import Login from '@/pages/Login.jsx';

import { CONTACTS_GROUP, buildContactWindows } from '@/components/ContactsButton.jsx';
import {Book} from "lucide-react";
import { motion } from 'motion/react';


const BLOGS_GROUP = 1;
const HOME_GROUP = 6;
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
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, mass: 1, damping:5}}
            >
                <video autoPlay
                       muted
                       loop
                       src={src}
                       className="w-full h-full hover:scale-116
                       transition-transform spring-duration-300 spring-bounce-60"
                       draggable={false} />
            </motion.div>
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
function BlogNavWindow({ post, posts, onNavigate }) {
    const currentIndex = posts.findIndex(p => p._id === post._id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < posts.length - 1;

    return (
        <div className="flex items-center gap-4 p-2 bg-zinc-900">
            <button
                disabled={!hasPrev}
                onClick={() => onNavigate(posts[currentIndex - 1])}
                className={`px-3 py-1 text-sm ${hasPrev ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 cursor-not-allowed'}`}
            >
                ← Previous
            </button>
            <span className="text-zinc-400 text-sm">{currentIndex + 1} / {posts.length}</span>
            <button
                disabled={!hasNext}
                onClick={() => onNavigate(posts[currentIndex + 1])}
                className={`px-3 py-1 text-sm ${hasNext ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 cursor-not-allowed'}`}
            >
                Next →
            </button>
        </div>
    );
}

export function FloatingBlog() {
    const { backendUrl, fetchBlogPosts } = useContext(AppContext);
    const { addWindow, closeGroup, windows } = useWindowManager();

    const currentPosts = useRef([]);
    const whichGroupOpen = useRef(null);

    const openPost = (post, posts) => {
        currentPosts.current = posts;
        closeGroup(whichGroupOpen.current);
        whichGroupOpen.current = post._id;

        if(post.image){
            addWindow({
                windowName: post.title,
                spawnx: window.innerWidth/6, spawny: window.innerHeight/4,
                group: post._id,
                content: <img className='aspect-square object-cover w-65' draggable={false} src={backendUrl + post.image} />
            });
        }
        addWindow({
            windowName: post.title,
            spawnx: window.innerWidth*2/6, spawny: window.innerHeight/4,
            group: post._id,
            content: <MarkdownView className='prose prose-invert bg-zinc-900 w-70 p-3' markdown={post.description} />
        });
        addWindow({
            windowName: post.title,
            spawnx: window.innerWidth*3/6, spawny: window.innerHeight*2/5,
            group: post._id,
            content: <CommentSection targetType="post" targetId={post._id} />
        });
        addWindow({
            windowName: 'Navigation',
            spawnx: window.innerWidth*3/6, spawny: window.innerHeight/4,
            group: post._id,
            content: <BlogNavWindow post={post} posts={posts} onNavigate={(p) => openPost(p, posts)} />
        });
    };

    const handleGroupSelect = async (group) => {
        closeGroup(whichGroupOpen.current);
        whichGroupOpen.current = null;
        const posts = await fetchBlogPosts(group._id);
        currentPosts.current = posts;
        closeGroup(BLOGS_GROUP);
        addWindow({
            windowName: `${group.name} — Posts`,
            spawnx: 300, spawny: 200,
            group: BLOGS_GROUP,
            content: (
                <div className='bg-zinc-900 w-60 min-h-32 max-h-96 overflow-y-auto'>
                    {posts.length === 0 && <p className="text-zinc-400 text-sm p-3">No posts in this group yet.</p>}
                    {posts.map((post) => (
                        <div key={post._id} className="p-1.5">
                            <Card className="w-full bg-zinc-900 border-zinc-800 text-white cursor-pointer"
                                  onClick={() => openPost(post, posts)}>
                                <Book className='absolute right-5 hover:scale-110 transition-all spring-duration-300 spring-bounce-60' />
                                <CardHeader>
                                    <CardTitle className="text-sm">{post.title}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    ))}
                </div>
            )
        });
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
            initialX={760}
            initialY={55}
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
            initialX={920}
            initialY={55}
            onActivate={toggle}
        />
    );
}

// ─── Floating Home ───────────────────────────────────────────────────────────
export function FloatingHome() {
    const { addWindow, closeGroup, windows } = useWindowManager();

    const toggle = () => {
        if (windows.some(w => w.group === HOME_GROUP)) {
            closeGroup(HOME_GROUP);
        } else {
            addWindow({
                windowName: 'Home', spawnx: 300, spawny: 200, group: HOME_GROUP,
                content: (
                    <div className='w-100'>
                        <p>
                            Welcome to <b>WSIN,</b> Southern Connecticut State University's
                            student-run radio station, broadcasting straight from Room 210 in the
                            Adanti Student Center! We bring you a <b>diverse mix of music, podcasts,
                            and student-led content,</b> making sure there's always something fresh to tune into.
                        </p>
                    </div>
                ),
            });
        }
    };

    return (
        <DraggableIcon
            src="/earth.webm"
            title="Home — drag me!"
            initialX={920}
            initialY={355}
            onActivate={toggle}
        />
    );
}