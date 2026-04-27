import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useWindowManager } from '@/context/WindowManager.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Upload, Trash2, Eye } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {ScrollArea} from "@/components/ui/scroll-area.jsx";

const AdminImages = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const { addWindow } = useWindowManager();

    const [images, setImages]         = useState([]);
    const [uploading, setUploading]   = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role === 'admin') fetchImages();
    }, [userData]);

    const fetchImages = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/images', { withCredentials: true });
            if (data.success) setImages(data.images);
            else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return toast.error('No file selected');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            const { data } = await axios.post(backendUrl + '/api/images/upload', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.success) {
                toast.success('Image uploaded');
                setPreviewUrl(null);
                setSelectedFile(null);
                e.target.reset();
                fetchImages();
            } else toast.error(data.message);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally { setUploading(false); }
    };

    const handleDelete = async (name) => {
        if (!confirm(`Delete image "${name}"?`)) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/images/${name}`, { withCredentials: true });
            if (data.success) {
                setImages(prev => prev.filter(img => img.name !== name));
                toast.success('Image deleted');
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    const isAdmin = userData && userData.role === 'admin';
    if (!isAdmin) {
        return <div className="w-full h-full bg-zinc-950 text-zinc-400 p-4 text-sm">Admins only.</div>;
    }

    return (
        <div className="w-full h-full bg-zinc-950 text-white overflow-hidden">
            <Card className="w-full max-w-none rounded-none border-0 ring-0 bg-zinc-950 h-full flex flex-col">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardDescription className="uppercase tracking-widest text-xs text-red-500">
                        WSIN Admin
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">Manage Images</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col h-full overflow-hidden">
                    <form onSubmit={handleUpload} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex-1 text-sm text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:uppercase file:tracking-widest file:font-medium file:bg-red-500/15 file:text-red-400 hover:file:bg-red-500/25 bg-zinc-900 rounded-md border border-zinc-800 p-2"
                        />
                        <Button type="submit" disabled={uploading || !selectedFile}>
                            <Upload className="size-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </form>
                    {previewUrl && (
                        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2">
                            <img src={previewUrl} alt="Preview" className="w-full max-h-32 object-contain rounded" />
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-h-0">
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                            Uploaded Images ({images.length})
                        </p>
                        <ScrollArea className="flex-1 overflow-y-auto pr-3 min-h-0">
                            <div className="space-y-2">
                                {images.length === 0 && (
                                    <p className="text-center text-xs text-zinc-500 py-8">No images uploaded yet.</p>
                                )}
                                {images.map(img => (
                                    <div
                                        key={img.name}
                                        className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                                    >
                                        <img
                                            src={`${backendUrl}/uploads/${img.name}`}
                                            alt={img.name}
                                            className="h-14 w-14 object-cover rounded-md border border-zinc-800 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-zinc-200 truncate">{img.name}</p>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                                {formatSize(img.size)} · {formatDate(img.createdAt)}
                                            </p>
                                        </div>
                                        <div className="min-w-0 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => addWindow({
                                                    windowName: img.name,
                                                    spawnx: window.innerWidth / 4,
                                                    spawny: window.innerHeight / 4,
                                                    content: <img src={`${backendUrl}/uploads/${img.name}`} alt={img.name} className="w-65 h-full object-contain" />,
                                                })}
                                                title="Preview"
                                            >
                                                <Eye />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon-xs"
                                                onClick={() => handleDelete(img.name)}
                                                title="Delete"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminImages;
