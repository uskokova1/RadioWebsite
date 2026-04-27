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
import {Home, Instagram} from 'lucide-react';

import { CONTACTS_GROUP, buildContactWindows } from '@/components/ContactsButton.jsx';
import {Book} from "lucide-react";
import { motion } from 'motion/react';
import {Calendar} from "@/components/ui/calendar.jsx";
import EventsCalendar from "@/components/EventsCalendar.jsx";



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
            className="w-44 h-44 select-none cursor-grab active:cursor-grabbing drop-shadow-2xl
                       transition-filter hover:drop-shadow-[0_0_42px_rgba(244,63,94,0.5)]"
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
            initialX={window.innerWidth/2}
            initialY={window.innerHeight/7 * 5}
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
            initialX={window.innerWidth/6}
            initialY={window.innerHeight/7 * 5}
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
            initialX={window.innerWidth/8 * 6}
            initialY={window.innerHeight/5 * 3}
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
                windowName: 'Home', spawnx: window.innerWidth/2.3, spawny: window.innerHeight/5, group: HOME_GROUP,
                content: (
                    <p className='prose prose-invert m-5 group-prose-strong:text-red-500 w-100'>
                        🎶 Love music? We play all genres and are always looking for new recommendations to add to our rotation.
                        <br/>
                        🎙 Want to get involved? Record your own podcast or curate a custom playlist to air during select times.
                        <br/>
                        📡 Looking for a space to share your voice? WSIN is more than a station—it’s a platform for creativity, conversation, and community.
                        <br/>
                        Whether you’re here to listen, create, or connect, WSIN is your place to turn it up and be heard!
                    </p>
                )
            })
            addWindow({
                windowName: 'More', spawnx: window.innerWidth/2, spawny: window.innerHeight*2/3, group: HOME_GROUP,
                content: (
                    <div className='mx-auto w-full justify-evenly align-middle p-2'>
                        <a className='flex-row my-2 prose prose-invert flex text-2xl text-blue-400 underline '
                           href="https://owlconnect.southernct.edu/organization/wsinradio">
                            owlconnect
                        </a>
                        <a className='flex-row my-2 prose prose-invert flex text-2xl text-blue-400 underline '
                           href="https://radio.garden/listen/wsin-1590-am/UXQb3kOs">
                            radio.garden
                        </a>
                        <a className='text-2xl my-2 text-blue-400 underline flex'
                            href='https://www.instagram.com/wsinradio/'>
                            Instagram
                            <Instagram className='flex-row translate-y-2 flex text-2xl ' />
                        </a>
                        {/*<button onClick={() => {*/}
                        {/*    addWindow({*/}
                        {/*        windowName: 'Home', spawnx: 900, spawny: 300,*/}
                        {/*        group: HOME_GROUP,*/}
                        {/*        content: (*/}
                        {/*            <div className='w-100 text-xl items-center justify-center m-4'>*/}
                        {/*                <p className='prose prose-invert'>*/}
                        {/*                    The primary purpose of WSIN 1590 Radio Station shall be to serve the Southern Connecticut State University community through the broadcast medium. It shall inform the campus of student and University activities and news events; provide entertainment suited to the tastes of the student body as a whole; and promote student participation and unity within the University community. In addition, WSIN Radio Station shall provide practical experience for students planning to enter the fields of radio broadcasting, broadcast news, and sales.*/}
                        {/*                </p>*/}
                        {/*            </div>*/}
                        {/*        ),*/}
                        {/*    })*/}
                        {/*}}>*/}
                        {/*    Our purpose*/}
                        {/*</button>*/}
                    </div>
                )
            })
            addWindow({
                windowName: 'About', spawnx: window.innerWidth/5, spawny: window.innerHeight/5, group: HOME_GROUP,
                content: (
                    <div className='w-100 text-xl items-center justify-center'>
                        <img className='w-100'
                             src='/homepicture.jpg' />
                        <div className='prose prose-invert m-5 group-prose-strong:text-red-500'>
                            <p className='text-2xl text-center'>Welcome to <b>WSIN!</b> </p>
                            Southern Connecticut State University's
                            student-run radio station, broadcasting straight from Room 210 in the
                            Adanti Student Center! We bring you a <b>diverse mix of music, podcasts,
                            and student-led content,</b> making sure there's always something fresh to tune into.
                        </div>
                        </div>
                ),
            });
        }
    };

    return (
        <DraggableIcon
            src="/earth.webm"
            title="Home — drag me!"
            initialX={window.innerWidth/7}
            initialY={window.innerHeight/7}
            onActivate={toggle}
        />
    );
}

// ─── Floating Contact ─────────────────────────────────────────────────────────
export function FloatingCalander() {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const [openAlready, setOpenAlready] = useState(false);

    const toggle = () => {
        if (!openAlready) {
            setOpenAlready(true);
        } else {
            setOpenAlready(false);
        }
    };
    return (
        <>
        <EventsCalendar headless={true} toggle={openAlready}/>
    <DraggableIcon
            src="/calander.webm"
            title="Events — drag me!"
            initialX={window.innerWidth/4 * 3}
            initialY={window.innerHeight/7 * 3}
            onActivate={toggle}
        />
    </>
    );
}