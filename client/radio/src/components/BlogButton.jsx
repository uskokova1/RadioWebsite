import React, {useContext, useEffect, useState} from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { House, Book } from 'lucide-react';
import axios from "axios";
import {toast} from "react-toastify";
import {AppContext} from "@/context/AppContext.jsx";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import { WindowManagerProvider, WindowManager, useWindowManager } from '@/context/WindowManager.jsx';
import MarkdownView from "react-showdown";
import CommentSection from "@/components/CommentSection.jsx";


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

    let whichPostOpen = null
    const openPost = (e, post) => {

        if(post._id == whichPostOpen?._id){
            closeGroup(post._id);
            whichPostOpen = null
        }
        else{
            closeGroup(whichPostOpen?._id);
            whichPostOpen = post;

            addWindow({
                windowName: post.title,
                spawnx: 200,
                spawny: 80,
                group: post._id,
                content: <img className='aspect-square object-cover w-65'
                              draggable={false}
                              src={backendUrl + post.image}
                />
            })
            addWindow({
                windowName: post.title,
                spawnx: 500,
                spawny: 150,
                group: post._id,
                content: <MarkdownView className='prose prose-invert bg-zinc-900 w-70 p-3' markdown={post.description} />
            })
            addWindow({
                windowName: post.title,
                spawnx: 200,
                spawny: 350,
                group: post._id,
                content: <CommentSection
                    targetType="post"
                    targetId={post._id}
                />
            })

        }
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div>
            <Book
                className='absolute left-40 top-275 w-20 h-20 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'
                onClick={(e) => {
                    if(!openAlready){
                        setOpenAlready(true);
                        addWindow({
                    windowName: 'Blogs',
                    spawnx: 300,
                    spawny: 200,
                    group: 1,
                    content:
                        <div className='bg-zinc-900 w-60'>
                        {loading && <p>Loading posts...</p>}
                        {!loading && posts.length === 0 && <p>No posts yet.</p>}
                        {posts.map((post) => (
                            <div key={post._id}>
                                <Card
                                    className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                                    <Book onClick={(e) => openPost(e,post)}
                                          className='absolute right-5 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>
                                    <CardHeader>
                                        <CardTitle className="">
                                            {post.title}
                                        </CardTitle>
                                        {/*
                                        <CardDescription className=" text-zinc-400">
                                            {post.description}
                                        </CardDescription>
                                        */}
                                    </CardHeader>
                                    {/*
                                    <CardFooter className="text-zinc-400">
                                        {post.author?.username || 'WSIN'}&nbsp;·&nbsp;{formatDate(post.createdAt)}
                                    </CardFooter>
                                    */}
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