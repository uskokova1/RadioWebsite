import React, {useContext, useEffect, useState} from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { House, Book } from 'lucide-react';
import axios from "axios";
import {toast} from "react-toastify";
import {AppContext} from "@/context/AppContext.jsx";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import { WindowManagerProvider, WindowManager, useWindowManager } from '@/context/WindowManager.jsx';


const BlogButton = () => {
    const { addWindow, closeGroup} = useWindowManager();
    const [openAlready, setOpenAlready] = useState(false);

    const { backendUrl } = useContext(AppContext);

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/posts');
            if (data.success) {
                setPosts(data.posts);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div>
            <Book
                className='absolute left-5 top-25 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'
                onClick={(e) => {
                    if(!openAlready){
                        setOpenAlready(true);
                        addWindow({
                    windowName: 'Blogs',
                    spawnx: 300,
                    spawny: 300,
                    group: 1,
                    content:
                        <div className='bg-zinc-900'>
                        {loading && <p>Loading posts...</p>}
                        {!loading && posts.length === 0 && <p>No posts yet.</p>}
                        {posts.map((post) => (
                            <div key={post._id}>
                                <Card
                                    className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                                    <Book onClick={(e) => openPost(e,post._id)}
                                          className='absolute right-5 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>
                                    <CardHeader>
                                        <CardTitle className="">
                                            {post.title}
                                        </CardTitle>
                                        <CardDescription className=" text-zinc-400">
                                            {post.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="text-zinc-400">
                                        {post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}
                                    </CardFooter>
                                </Card>
                            </div>
                        ))}
                    </div>
                })
                    }else{
                    setOpenAlready(false)
                    closeGroup(1)
                    }}}
            />

        </div>
    );
};

export default BlogButton;