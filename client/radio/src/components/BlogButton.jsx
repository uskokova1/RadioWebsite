import React, { useContext, useState, useRef } from 'react';
import { Book } from 'lucide-react';
import { AppContext } from "@/context/AppContext.jsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import MarkdownView from "react-showdown";
import CommentSection from "@/components/CommentSection.jsx";
import BlogGrid from "@/components/BlogGrid.jsx";


const BLOGS_GROUP = 1;

const BlogNavWindow = ({ post, posts, onNavigate }) => {
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
};

const BlogButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const { backendUrl, fetchBlogPosts } = useContext(AppContext);
    const [lastGroup, setLastGroup] = useState(null);

    const currentPosts = useRef([]);
    const whichPostOpen = useRef(null);

    const openPost = (post, posts) => {
        currentPosts.current = posts;
        closeGroup(whichPostOpen.current);
        whichPostOpen.current = post._id;

        if(post.image){
        addWindow({
            windowName: post.title,
            spawnx: window.innerWidth/6, spawny: window.innerHeight/4,
            group: post._id,
            content: <img className='aspect-square object-cover w-72' draggable={false} src={backendUrl + post.image} />
        });
        }
        addWindow({
            windowName: post.title,
            spawnx: window.innerWidth*2/6-50, spawny: window.innerHeight/4,
            group: post._id,
            content: <MarkdownView className='prose prose-invert bg-zinc-900 w-90 p-3' markdown={post.description} />
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
        closeGroup(whichPostOpen.current);
        whichPostOpen.current = null;
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

    const handleToggle = () => {
        const groupOpen = windows.some(win => win.group === BLOGS_GROUP);
        if (!groupOpen) {
            setLastGroup(null);
            addWindow({
                windowName: 'Blog Groups',
                spawnx: 300, spawny: 200,
                group: BLOGS_GROUP,
                content: (
                    <BlogGrid onVariableChange={handleGroupSelect} />
                )
            });
        } else {
            closeGroup(BLOGS_GROUP);
        }
    };

    return (
        <button
            onClick={handleToggle}
            title="Blog"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-300 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-red-500 hover:text-red-400"
        >
            <Book className="size-6" />
        </button>
    );
};

export default BlogButton;
