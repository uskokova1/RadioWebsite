import React, {useContext, useEffect, useState} from 'react';
import DraggableWindow from '@/components/DraggableWindow.jsx';
import { House, Book } from 'lucide-react';
import BlogGrid from "@/components/BlogGrid.jsx";
import axios from "axios";
import {toast} from "react-toastify";
import {AppContext} from "@/context/AppContext.jsx";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.jsx";

const BlogButton = () => {
    const [showWindow, setShowWindow] = useState(1)
    const [postOpen, setPostOpen] = useState(false)

    const handleSwitch = (e, n) => {
        if(n == showWindow) {setShowWindow(null)}
        else{
            setShowWindow(n)
        }
    }
    const openPost= (e, postid) => {
        setPostOpen(postid)
    }

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
            <Book onClick={(e) => handleSwitch(e,0)}
                  className='absolute left-5 top-25 hover:scale-110 transition-all spring-duration-300 spring-bounce-60'/>
            <DraggableWindow visible={showWindow == 0}>
                <div spawnx={300} spawny={300} windowName='Blogs' className='bg-zinc-900'>
                    {loading && <p>Loading posts...</p>}
                    {!loading && posts.length === 0 && <p>No posts yet.</p>}
                    {posts.map((post) => (
                        <>
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
                        </>
                    ))}
                </div>
                {/* <BlogGrid windowName='blogs' spawnx={50} spawny={90} onVariableChange={setShowWindow}/> */}
            </DraggableWindow>
            {postOpen && (
            <DraggableWindow visible={true}>

            </DraggableWindow>
                )}
        </div>
    );
};

export default BlogButton;