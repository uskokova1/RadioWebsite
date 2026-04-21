import React, { useContext, useState } from 'react';
import { Book } from 'lucide-react';
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext.jsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { useWindowManager } from '@/context/WindowManager.jsx';
import MarkdownView from "react-showdown";
import CommentSection from "@/components/CommentSection.jsx";
import BlogGrid from "@/components/BlogGrid.jsx";


const BLOGS_GROUP = 1;

const BlogButton = () => {
    const { addWindow, closeGroup, windows } = useWindowManager();
    const [lastGroup, setLastGroup] = useState(null);
    const { backendUrl } = useContext(AppContext);

    let whichPostOpen = null;

    const openPost = (post) => {
        if (post._id == whichPostOpen?._id) {
            closeGroup(post._id);
            whichPostOpen = null;
        } else {
            closeGroup(whichPostOpen?._id);
            whichPostOpen = post;

            addWindow({
                windowName: post.title,
                spawnx: 200, spawny: 80,
                group: post._id,
                content: <img className='aspect-square object-cover w-65' draggable={false} src={backendUrl + post.image} />
            });
            addWindow({
                windowName: post.title,
                spawnx: 500, spawny: 150,
                group: post._id,
                content: <MarkdownView className='prose prose-invert bg-zinc-900 w-70 p-3' markdown={post.description} />
            });
            addWindow({
                windowName: post.title,
                spawnx: 200, spawny: 350,
                group: post._id,
                content: <CommentSection targetType="post" targetId={post._id} />
            });
        }
    };

    const handleGroupSelect = async (group) => {
        closeGroup(whichPostOpen?._id);
        whichPostOpen = null;

        try {
            const { data } = await axios.get(`${backendUrl}/api/posts/blog/${group._id}`);
            const posts = data.success ? data.posts : [];

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
                                      onClick={() => openPost(post)}>
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
        } catch (err) {
            toast.error(err.message);
        }
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
