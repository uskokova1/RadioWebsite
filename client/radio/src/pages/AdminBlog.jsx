import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
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
    const [editingId, setEditingId]     = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') fetchPosts();
    }, [userData]);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/posts');
            if (data.success) setPosts(data.posts);
        } catch (err) { console.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => { setTitle(''); setDescription(''); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const { data } = await axios.put(`${backendUrl}/api/posts/${editingId}`, { title, description }, { withCredentials: true });
                if (data.success) { setPosts(posts.map(p => p._id === editingId ? data.post : p)); toast.success('Post updated'); resetForm(); }
                else toast.error(data.message);
            } else {
                const { data } = await axios.post(`${backendUrl}/api/posts`, { title, description }, { withCredentials: true });
                if (data.success) { setPosts([data.post, ...posts]); toast.success('Post created'); resetForm(); }
                else toast.error(data.message);
            }
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (post) => {
        setTitle(post.title); setDescription(post.description);
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

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
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
                            <Textarea
                                placeholder="Write something..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="min-h-[120px]"
                                required
                            />
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
                        <ScrollArea className="h-[320px] pr-3">
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
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBlog;
