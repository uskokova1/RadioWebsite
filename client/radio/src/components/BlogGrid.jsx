import React, { useState, useContext, useEffect } from 'react';
import { ImageIcon, FolderOpen } from 'lucide-react';
import axios from "axios";
import { AppContext } from "@/context/AppContext.jsx";

const BlogGrid = ({ onVariableChange }) => {
    const { backendUrl } = useContext(AppContext);
    const [blogGroups, setBlogGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/bloggroup');
            setBlogGroups(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event, group) => {
        onVariableChange(group);
    };

    if (loading) {
        return <div className="text-sm text-zinc-400 p-3">Loading...</div>;
    }

    if (blogGroups.length === 0) {
        return <div className="text-sm text-zinc-400 p-3">No blog groups found.</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900 h-50 w-70 overflow-auto">
            {blogGroups.map((group) => (
                <div
                    key={group._id}
                    onClick={(e) => handleClick(e, group)}
                    className="flex flex-col items-center cursor-pointer hover:scale-105 transition-all spring-duration-300 spring-bounce-60"
                >
                    {group.coverImage ? (
                        <div className="w-full aspect-square rounded border border-zinc-700 overflow-hidden bg-zinc-800">
                            <img
                                src={`${backendUrl}${group.coverImage}`}
                                alt={group.name}
                                className="w-full h-full object-cover"
                                draggable={false}
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-square rounded flex items-center justify-center">
                            <FolderOpen className="w-10 h-10 text-zinc-500" />
                        </div>
                    )}
                    <span className="text-xs text-zinc-300 mt-1 truncate w-full text-center px-1">
                        {group.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default BlogGrid;
