import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import Markdown from 'react-showdown';
import { Plus, X, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminBlog = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage]             = useState('');
    const [blogGroups, setBlogGroups]   = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [editingId, setEditingId]    = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]  = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') {
            fetchPosts();
            fetchImages();
            fetchBlogGroups();
        }
    }, [userData]);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    const fetchBlogGroups = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/bloggroup', { withCredentials: true });
            setBlogGroups(data);
        } catch (err) { console.error(err.message); }
    };

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/posts');
            if (data.success) setPosts(data.posts);
        } catch (err) { console.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => { setTitle(''); setDescription(''); setImage(''); setSelectedGroup(''); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { title, description, image, blogGroupId: selectedGroup };
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/posts/${editingId}`, payload, { withCredentials: true });
                if (data.success) { setPosts(posts.map(p => p._id === editingId ? data.post : p)); toast.success('Post updated'); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/posts`, payload, { withCredentials: true });
                if (data.success) { setPosts([data.post, ...posts]); toast.success('Post created'); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (post) => {
        setTitle(post.title); setDescription(post.description);
        setImage(post.image || '');
        setSelectedGroup(post.blogGroup?._id || post.blogGroup || '');
        setEditingId(post._id); setShowForm(true); setExpandedId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
            if (data.success) { setPosts(posts.filter(p => p._id !== id)); toast.success('Post deleted'); }
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <ScrollArea className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="pt-4 border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Blog Management</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                    <Button
                        size="sm"
                        variant={showForm ? "outline" : "default"}
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                    >
                        {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Post</>}
                    </Button>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? 'Edit Post' : 'New Post'}
                            </p>
                            <Input
                                placeholder="Post Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                            <div>
                                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                                    Blog Group <span className="text-zinc-600">· required</span>
                                </p>
                                <select
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 text-sm text-white px-3 py-2 outline-none focus:border-red-500"
                                >
                                    <option value="">Select a group...</option>
                                    {blogGroups.map(group => (
                                        <option key={group._id} value={group._id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-zinc-500">
                                    Content <span className="text-zinc-600">· Markdown supported</span>
                                </p>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <Textarea
                                        placeholder="Write something..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="min-h-[220px]"
                                        required
                                    />
                                    <div className="prose prose-invert prose-sm max-w-none min-h-[220px] rounded-md border border-zinc-800 bg-zinc-900 p-3 overflow-auto">
                                        {!description
                                            ? <p className="text-zinc-600 italic">Preview will appear here…</p>
                                            : <Markdown markdown={description} options={{ tables: true, strikethrough: true, ghCodeBlocks: true }} />
                                        }
                                    </div>
                                </div>
                            </div>
                            <ImagePicker value={image} onChange={setImage} />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Post'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                            {posts.length} post{posts.length !== 1 ? 's' : ''}
                        </p>
                        <div className="h-[320px] pr-3">
                            {loading && <p className="text-center text-xs text-zinc-500 py-8">Loading...</p>}
                            {!loading && posts.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-8">No posts yet.</p>
                            )}
                            <div className="space-y-2">
                                {posts.map(post => {
                                    const expanded = expandedId === post._id;
                                    return (
                                        <div
                                            key={post._id}
                                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3 p-3">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                                    onClick={() => setExpandedId(expanded ? null : post._id)}
                                                >
                                                    <div className="size-1.5 rounded-full bg-red-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                                                            {post.author?.username || 'WSIN'} · {formatDate(post.createdAt)}
                                                        </p>
                                                    </div>
                                                </button>
                                                <div className="flex gap-1 shrink-0">
                                                    <Button variant="outline" size="icon-xs" title="Edit" onClick={() => handleEdit(post)}>
                                                        <Pencil />
                                                    </Button>
                                                    <Button variant="destructive" size="icon-xs" title="Delete" onClick={() => handleDelete(post._id)}>
                                                        <Trash2 />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        onClick={() => setExpandedId(expanded ? null : post._id)}
                                                    >
                                                        {expanded ? <ChevronUp /> : <ChevronDown />}
                                                    </Button>
                                                </div>
                                            </div>
                                            {expanded && (
                                                <div className="border-t border-zinc-800 px-4 py-3">
                                                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                        {post.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>
        </div>
    );
};

export default AdminBlog;
