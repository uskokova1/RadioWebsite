import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Markdown from 'react-showdown';
import { ChevronDown, ChevronUp, Plus, X, Pencil, Trash2, ArrowLeft } from "lucide-react";

import { AppContext } from "../context/AppContext.jsx";
import CommentSection from "../components/CommentSection.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

function Blog() {
    const { backendUrl, userData, blogGroups } = useContext(AppContext);
    const isAdmin = userData && userData.role === 'admin';

    const stored = localStorage.getItem("selectedBlogGroup");
    const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
    const [selectedBlogGroup, setSelectedBlogGroup] = useState(parsed);

    useEffect(() => {
        if (!selectedBlogGroup || typeof selectedBlogGroup !== 'object') return;
        if (selectedBlogGroup.name) return;
        const full = blogGroups.find(g => g._id === selectedBlogGroup._id);
        if (full) setSelectedBlogGroup(full);
    }, [blogGroups, selectedBlogGroup]);

    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [selectedImagePath, setSelectedImagePath] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [showForm, setShowForm]       = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [expandedId, setExpandedId]   = useState(null);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setUploadedImages(data.images);
        } catch (err) { console.error(err.message); }
    };

    useEffect(() => { fetchImages(); }, []);
    useEffect(() => { fetchPosts(); }, [selectedBlogGroup]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = selectedBlogGroup
                ? `${backendUrl}/api/posts/blog/${selectedBlogGroup._id}`
                : `${backendUrl}/api/posts`;
            const { data } = await axios.get(url);
            if (data.success) setPosts(data.posts);
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setTitle(""); setDescription(""); setSelectedImagePath(null);
        setShowForm(false); setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBlogGroup) return toast.error("Select a blog group first");
        setSubmitting(true);
        try {
            const body = { title, description, image: selectedImagePath, blogGroupId: selectedBlogGroup._id };
            const res = editingId
                ? await axios.put(`${backendUrl}/api/posts/${editingId}`, body, { withCredentials: true })
                : await axios.post(`${backendUrl}/api/posts`, body, { withCredentials: true });

            if (res.data.success) {
                if (editingId) setPosts(posts.map(p => p._id === editingId ? res.data.post : p));
                else setPosts([res.data.post, ...posts]);
                toast.success(editingId ? "Post updated" : "Post created");
                resetForm();
            } else toast.error(res.data.message);
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (post) => {
        setTitle(post.title);
        setDescription(post.description);
        setSelectedImagePath(post.image || null);
        setEditingId(post._id);
        setShowForm(true);
        fetchImages();
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
            if (data.success) {
                setPosts(posts.filter(p => p._id !== id));
                toast.success("Post deleted");
                if (expandedId === id) setExpandedId(null);
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const headerLabel = selectedBlogGroup ? selectedBlogGroup.name.toUpperCase() : "ALL";
    const canPost = isAdmin && selectedBlogGroup;

    return (
        <div className="w-full h-full bg-zinc-950 text-white">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedBlogGroup(null); setExpandedId(null); localStorage.removeItem("selectedBlogGroup"); }}
                        >
                            <ArrowLeft className="size-4" /> All Groups
                        </Button>
                    </div>
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        {headerLabel}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">WSIN Blog</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    {canPost && (
                        <Button
                            variant={showForm ? "outline" : "default"}
                            size="sm"
                            onClick={() => showForm ? resetForm() : setShowForm(true)}
                        >
                            {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New Post</>}
                        </Button>
                    )}

                    {canPost && showForm && (
                        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {editingId ? "Edit Post" : "New Post"}
                            </p>

                            <Input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />

                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Image (optional)</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImagePath(null)}
                                        className={[
                                            "flex h-16 w-16 items-center justify-center rounded-md border text-xs",
                                            selectedImagePath === null
                                                ? "border-red-500 bg-red-500/15 text-red-400"
                                                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
                                        ].join(' ')}
                                    >
                                        None
                                    </button>
                                    {uploadedImages.map(img => {
                                        const selected = selectedImagePath === `/uploads/${img.name}`;
                                        return (
                                            <button
                                                type="button"
                                                key={img.name}
                                                onClick={() => setSelectedImagePath(`/uploads/${img.name}`)}
                                                className={[
                                                    "relative h-16 w-16 overflow-hidden rounded-md border transition-all",
                                                    selected
                                                        ? "border-red-500 ring-2 ring-red-500/40"
                                                        : "border-zinc-700 hover:border-zinc-500",
                                                ].join(' ')}
                                            >
                                                <img
                                                    src={`${backendUrl}/uploads/${img.name}`}
                                                    alt={img.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
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

                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Saving..." : editingId ? "Save Changes" : "Post"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <ScrollArea className="h-[440px] pr-3">
                        <div className="space-y-3">
                            {loading && <p className="text-center text-xs text-zinc-500 py-8">Loading posts...</p>}
                            {!loading && posts.length === 0 && (
                                <p className="text-center text-xs text-zinc-500 py-8">No posts yet.</p>
                            )}
                            {posts.map(post => {
                                const expanded = expandedId === post._id;
                                const gName = blogGroups.find(g => g._id === post.blogGroup)?.name;
                                return (
                                    <Card key={post._id} size="sm" className="bg-zinc-900/60 ring-zinc-800">
                                        <CardHeader
                                            className="cursor-pointer"
                                            onClick={() => setExpandedId(expanded ? null : post._id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    {gName && !selectedBlogGroup && (
                                                        <span className="inline-block text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5 mb-1">
                                                            {gName}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-zinc-500">
                                                        {post.author?.username || 'WSIN'} · {formatDate(post.createdAt)}
                                                    </p>
                                                    <CardTitle className="text-base mt-1 break-words">{post.title}</CardTitle>
                                                    {!expanded && post.description && (
                                                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                            {post.description.slice(0, 140)}
                                                            {post.description.length > 140 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                {expanded
                                                    ? <ChevronUp className="size-4 text-zinc-500 shrink-0 mt-1" />
                                                    : <ChevronDown className="size-4 text-zinc-500 shrink-0 mt-1" />
                                                }
                                            </div>
                                        </CardHeader>

                                        {expanded && (
                                            <CardContent className="space-y-3 pt-0">
                                                {post.image && (
                                                    <img
                                                        src={backendUrl + post.image}
                                                        alt={post.title}
                                                        className="w-full max-h-64 object-cover rounded-md"
                                                    />
                                                )}
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <Markdown
                                                        markdown={post.description}
                                                        options={{ tables: true, strikethrough: true, ghCodeBlocks: true }}
                                                    />
                                                </div>
                                                {isAdmin && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                                                            <Pencil className="size-4" /> Edit
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(post._id)}>
                                                            <Trash2 className="size-4" /> Delete
                                                        </Button>
                                                    </div>
                                                )}
                                                <CommentSection targetType="post" targetId={post._id} />
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

export default Blog;
