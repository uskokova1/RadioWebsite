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
import {ScrollArea} from "@/components/ui/scroll-area.jsx";


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
                spawnx: window.innerWidth/4-100, spawny: 80,
                group: post._id,
                content: <img className='aspect-square object-cover w-65' draggable={false} src={backendUrl + post.image} />
            });
            addWindow({
                windowName: post.title,
                spawnx: window.innerWidth/3, spawny: 150,
                group: post._id,
                content:
                    <ScrollArea className='w-[20vw] p-3 h-[75vh]'>
                    <MarkdownView
                    style={{
                        backgroundColor: 'rgba(0, 0,0, 0.1)',
                        backdropFilter: 'blur(55px)',
                    }}
                    className='prose prose-invert' markdown={post.description} />
                    </ScrollArea>
                    });
            addWindow({
                windowName: post.title,
                spawnx: window.innerWidth*3/4-200, spawny: 350,
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
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(55px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                        className='w-60 min-h-32 max-h-96 overflow-y-auto'>
                        {posts.length === 0 && <p className="text-zinc-400 text-sm p-3">No posts in this group yet.</p>}
                        {posts.map((post) => (
                            <div key={post._id} className="p-1.5">
                                <Card
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        backdropFilter: 'blur(55px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                    className="w-full bg-zinc-900 border-zinc-800 text-white cursor-pointer"
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
        <div>
            <video
                autoPlay={true}
                muted={true}
                loop={true}
                src='/clipboard.webm'
                onClick={handleToggle}
                className='absolute left-5 top-75 scale-60
                hover:scale-65 transition-all spring-duration-300 spring-bounce-60'
            />
        </div>
    );
};

export default BlogButton;
