import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "@/context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import {
    Folder, FolderOpen, FileText, Plus, Pencil, Trash2,
    Save, X, ChevronDown, ChevronRight,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

function AdminBlogs() {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");

    const [editingGroup, setEditingGroup] = useState(null);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupDesc, setEditGroupDesc] = useState("");
    const [createPostGroup, setCreatePostGroup] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editPostTitle, setEditPostTitle] = useState("");
    const [editPostDesc, setEditPostDesc] = useState("");
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostDesc, setNewPostDesc] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    const [currImg, setCurrImg] = useState(null);

    const [draggingPost, setDraggingPost] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') {
            fetchTreeData();
            fetchImages();
        }
    }, [userData]);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const fetchTreeData = async () => {
        try {
            const { data: groups } = await axios.get(`${backendUrl}/api/bloggroup`);
            const tree = await Promise.all(groups.map(async (g) => {
                const { data } = await axios.get(`${backendUrl}/api/posts/blog/${g._id}`);
                return { group: g, posts: data.success ? data.posts : [], expanded: true };
            }));
            setTreeData(tree);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, post) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ postId: post._id, fromGroupId: post.blogGroup }));
        e.dataTransfer.effectAllowed = "move";
        setDraggingPost(post._id);
    };
    const handleDragEnter = (e, groupId) => { e.preventDefault(); setDropTarget(groupId); };
    const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const handleDragEnd   = () => { setDraggingPost(null); setDropTarget(null); };
    const handleDrop = async (e, targetGroupId) => {
        e.preventDefault();
        setDropTarget(null);
        setDraggingPost(null);
        try {
            const { postId, fromGroupId } = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (fromGroupId === targetGroupId) return;
            const { data } = await axios.put(
                `${backendUrl}/api/posts/${postId}`,
                { blogGroupId: targetGroupId },
                { withCredentials: true }
            );
            if (data.success) { toast.success("Post moved"); fetchTreeData(); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    // ---- Group CRUD ----
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/bloggroup`, { name: newGroupName, description: newGroupDesc, coverImage: currImg }, { withCredentials: true });
            if (data._id) {
                toast.success("Blog group created");
                setNewGroupName(""); setNewGroupDesc(""); setCurrImg(null); setShowNewGroup(false);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteGroup = async (id) => {
        if (!confirm("Delete this blog group and ALL its posts?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/bloggroup/${id}`, { withCredentials: true });
            if (data.message) { toast.success("Group deleted"); fetchTreeData(); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleSaveGroup = async (id) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/bloggroup/${id}`, { name: editGroupName, description: editGroupDesc, coverImage: currImg }, { withCredentials: true });
            if (data._id) { toast.success("Group updated"); setEditingGroup(null); fetchTreeData(); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const toggleGroup = (id) => {
        setTreeData(treeData.map(t => t.group._id === id ? { ...t, expanded: !t.expanded } : t));
    };

    // ---- Post CRUD ----
    const handleCreatePost = async (groupId) => {
        if (!newPostTitle.trim() || !newPostDesc.trim()) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/posts`, { title: newPostTitle, description: newPostDesc, blogGroupId: groupId }, { withCredentials: true });
            if (data.success) {
                toast.success("Post created");
                setNewPostTitle(""); setNewPostDesc(""); setCreatePostGroup(null);
                fetchTreeData();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Delete this post?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${postId}`, { withCredentials: true });
            if (data.success) { toast.success("Post deleted"); fetchTreeData(); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleSavePost = async (postId) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/posts/${postId}`, { title: editPostTitle, description: editPostDesc }, { withCredentials: true });
            if (data.success) { toast.success("Post updated"); setEditingPost(null); fetchTreeData(); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    const ImagePicker = ({ value, onChange }) => (
        <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
                Cover image <span className="text-zinc-600">· optional</span>
            </p>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className={[
                        "flex h-12 w-12 items-center justify-center rounded-md border text-[10px]",
                        !value
                            ? "border-red-500 bg-red-500/15 text-red-400"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
                    ].join(' ')}
                >
                    None
                </button>
                {uploadedImages.map(img => {
                    const path = `/uploads/${img.name}`;
                    const selected = value === path;
                    return (
                        <button
                            type="button"
                            key={img.name}
                            onClick={() => onChange(path)}
                            className={[
                                "h-12 w-12 overflow-hidden rounded-md border",
                                selected ? "border-red-500 ring-2 ring-red-500/40" : "border-zinc-700 hover:border-zinc-500",
                            ].join(' ')}
                        >
                            <img src={`${backendUrl}${path}`} alt={img.name} className="h-full w-full object-cover" />
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Blog Groups</CardTitle>
                    <CardDescription className="absolute text-lg right-5">Drag to move blogs</CardDescription>
                    <Button
                        className='absolute right-5 top-25'
                        size="sm"
                        variant={showNewGroup ? "outline" : "default"}
                        onClick={() => {
                            if (showNewGroup) {
                                setShowNewGroup(false); setNewGroupName(""); setNewGroupDesc(""); setCurrImg(null);
                            } else setShowNewGroup(true);
                        }}
                    >
                        {showNewGroup ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Group</>}
                    </Button>
                </CardHeader>

                <CardContent className="space-y-3">

                    {showNewGroup && (
                        <form onSubmit={handleCreateGroup} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">New Blog Group</p>
                            <Input placeholder="Group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                            <Textarea placeholder="Description (optional)" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className="min-h-[80px]" />
                            <ImagePicker value={currImg} onChange={setCurrImg} />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm"
                                    onClick={() => { setShowNewGroup(false); setNewGroupName(""); setNewGroupDesc(""); setCurrImg(null); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm">Create</Button>
                            </div>
                        </form>
                    )}

                    <ScrollArea className="h-[420px] pr-3">
                        {loading && <p className="text-center text-xs text-zinc-500 py-8">Loading...</p>}
                        {!loading && treeData.length === 0 && (
                            <p className="text-center text-xs text-zinc-500 py-8">No blog groups yet.</p>
                        )}

                        <div className="space-y-2">
                            {treeData.map(({ group, posts, expanded }) => {
                                const isEditing = editingGroup === group._id;
                                const isCreatingPost = createPostGroup === group._id;
                                const isDropTarget = dropTarget === group._id;

                                return (
                                    <div
                                        key={group._id}
                                        className={[
                                            "rounded-lg border bg-zinc-900/60 overflow-hidden",
                                            isDropTarget ? "border-red-500 ring-2 ring-red-500/30" : "border-zinc-800",
                                        ].join(' ')}
                                        onDragEnter={e => handleDragEnter(e, group._id)}
                                        onDragOver={handleDragOver}
                                        onDrop={e => handleDrop(e, group._id)}
                                    >
                                        {/* Group row */}
                                        <div className="flex items-center gap-2 p-3">
                                            <button
                                                type="button"
                                                onClick={() => !isEditing && toggleGroup(group._id)}
                                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                            >
                                                {expanded
                                                    ? <ChevronDown className="size-4 text-zinc-500 shrink-0" />
                                                    : <ChevronRight className="size-4 text-zinc-500 shrink-0" />}
                                                {expanded
                                                    ? <FolderOpen className="size-4 text-red-400 shrink-0" />
                                                    : <Folder className="size-4 text-red-400 shrink-0" />}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-white truncate">{group.name}</p>
                                                    {group.description && (
                                                        <p className="text-[10px] text-zinc-500 truncate">{group.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 shrink-0">
                                                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                                                </span>
                                            </button>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="outline" size="icon-xs" title="Edit"
                                                    onClick={() => {
                                                        setEditingGroup(group._id);
                                                        setEditGroupName(group.name);
                                                        setEditGroupDesc(group.description || '');
                                                        setCurrImg(group.coverImage || null);
                                                    }}>
                                                    <Pencil />
                                                </Button>
                                                <Button variant="destructive" size="icon-xs" title="Delete"
                                                    onClick={() => handleDeleteGroup(group._id)}>
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Group edit form */}
                                        {isEditing && (
                                            <div className="border-t border-zinc-800 p-3 space-y-3 bg-zinc-950/40">
                                                <Input placeholder="Group name" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} required />
                                                <Textarea placeholder="Description" value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} className="min-h-[60px]" />
                                                <ImagePicker value={currImg} onChange={setCurrImg} />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingGroup(null)}>
                                                        <X className="size-4" /> Cancel
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleSaveGroup(group._id)}>
                                                        <Save className="size-4" /> Save
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Posts */}
                                        {expanded && (
                                            <div className="border-t border-zinc-800 p-2 space-y-1.5 bg-zinc-950/40">
                                                {posts.map(post => {
                                                    const isEditingPost = editingPost === post._id;
                                                    const isDragging = draggingPost === post._id;
                                                    if (isEditingPost) {
                                                        return (
                                                            <div key={post._id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 space-y-2 ml-4">
                                                                <Input value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} placeholder="Title" />
                                                                <Textarea value={editPostDesc} onChange={e => setEditPostDesc(e.target.value)} placeholder="Content" className="min-h-[80px]" />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => setEditingPost(null)}>
                                                                        <X className="size-4" /> Cancel
                                                                    </Button>
                                                                    <Button size="sm" onClick={() => handleSavePost(post._id)}>
                                                                        <Save className="size-4" /> Save
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div
                                                            key={post._id}
                                                            draggable
                                                            onDragStart={e => handleDragStart(e, post)}
                                                            onDragEnd={handleDragEnd}
                                                            className={[
                                                                "flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-2 ml-4 cursor-grab hover:border-red-500/60 transition-colors",
                                                                isDragging ? "opacity-40 cursor-grabbing" : "",
                                                            ].join(' ')}
                                                        >
                                                            <FileText className="size-3.5 text-zinc-500 shrink-0" />
                                                            <span className="text-sm text-zinc-200 truncate flex-1">{post.title}</span>
                                                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">
                                                                {formatDate(post.createdAt)}
                                                            </span>
                                                            <Button variant="outline" size="icon-xs" title="Edit"
                                                                onClick={() => { setEditingPost(post._id); setEditPostTitle(post.title); setEditPostDesc(post.description); }}>
                                                                <Pencil />
                                                            </Button>
                                                            <Button variant="destructive" size="icon-xs" title="Delete"
                                                                onClick={() => handleDeletePost(post._id)}>
                                                                <Trash2 />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}

                                                {/* New post form */}
                                                {isCreatingPost ? (
                                                    <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 space-y-2 ml-4">
                                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                                            New post in {group.name}
                                                        </p>
                                                        <Input placeholder="Post title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required />
                                                        <Textarea placeholder="Post content" value={newPostDesc} onChange={e => setNewPostDesc(e.target.value)} className="min-h-[80px]" required />
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm"
                                                                onClick={() => { setCreatePostGroup(null); setNewPostTitle(""); setNewPostDesc(""); }}>
                                                                <X className="size-4" /> Cancel
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleCreatePost(group._id)}>
                                                                <Plus className="size-4" /> Create
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="ml-4">
                                                        <Button variant="outline" size="sm" onClick={() => setCreatePostGroup(group._id)}>
                                                            <Plus className="size-4" /> Add Post
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminBlogs;
