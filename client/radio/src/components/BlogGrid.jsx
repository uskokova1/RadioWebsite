import React, {useState} from 'react';
import { BookOpen, ImageIcon, MessageCircle } from 'lucide-react'; // Icons for your grid

const BlogGrid = ({onVariableChange}) => {
    const blogPosts = [
        {
            id: 1,
            windowName: "Post 1", // Title of the window
            text: "This is a description of Post 1.", // Text content
        },
        {
            id: 2,
            windowName: "Post 2", // Title of the window
            text: "This is a description of Post 2.", // Text content
        },
        {
            id: 3,
            windowName: "Post 3", // Title of the window
            text: "This is a description of Post 3.", // Text content
        },
    ];

    const handleChange = (event, postid) => {
        // Call the parent's callback function with the new value
        onVariableChange(postid);
    };

    return (
        <>
        {blogPosts.map(post => (
                <div className="w-50 h-20 grid grid-cols-3 gap-4 p-4 bg-gray-500">
                    <ImageIcon onClick={(e) => handleChange(e,post.id)}
                               className='hover:scale-110 transition-all spring-duration-300 spring-bounce-60'
                    />
                    <h1>{post.id}</h1>
            </div>
        ))}
        </>
    );
};

export default BlogGrid;