import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminImages = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => { if (!userData) getUserData(); }, []);

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
            navigate('/');
            toast.error('Not an admin');
        } else if (userData) {
            fetchImages();
        }
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
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (name) => {
        if (!confirm(`Delete image "${name}"?`)) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/images/${name}`, { withCredentials: true });
            if (data.success) {
                setImages(prev => prev.filter(img => img.name !== name));
                toast.success('Image deleted');
            } else {
                toast.error(data.message);
            }
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

    return (
        <div style={styles.page}>
            <div style={styles.column}>
                <div style={styles.header}>
                    <p className='flex text-red-500 text-xl font-bold'>WSIN RADIO</p>
                    <button onClick={() => navigate('/admin')}
                            className='flex rounded-3xl p-1 px-2 m-1 bg-red-500 w-fit align-middle'>
                        <ArrowLeft /> Back
                    </button>
                    <h2 className='m-auto p-5 flex text-white text-6xl font-bold'>Manage Images</h2>
                </div>

                <div style={styles.body}>
                    {/* Upload form */}
                    <form onSubmit={handleUpload} style={styles.uploadForm}>
                        <p style={styles.formLabel}>UPLOAD IMAGE</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={styles.fileInput}
                        />
                        {previewUrl && (
                            <div style={styles.preview}>
                                <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                            </div>
                        )}
                        <button type="submit" style={styles.uploadBtn} disabled={uploading || !selectedFile}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>

                    {/* Image list */}
                    <p style={{ ...styles.formLabel, marginTop: '28px' }}>UPLOADED IMAGES ({images.length})</p>
                    <ScrollArea style={{ maxHeight: 500, marginTop: 12 }}>
                        {images.length === 0 && <p style={styles.empty}>No images uploaded yet.</p>}
                        <div style={styles.grid}>
                            {images.map(img => (
                                <div key={img.name} style={styles.imageCard}>
                                    <img
                                        src={`${backendUrl}/uploads/${img.name}`}
                                        alt={img.name}
                                        style={styles.thumb}
                                    />
                                    <div style={styles.imageCardInfo}>
                                        <p style={styles.imageName}>{img.name}</p>
                                        <p style={styles.imageMeta}>{formatSize(img.size)} · {formatDate(img.createdAt)}</p>
                                    </div>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(img.name)}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page:        { minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center" },
    column:      { width: "100%", maxWidth: "760px", minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.8)", borderLeft: "1px solid #2a2a2a", borderRight: "1px solid #2a2a2a" },
    header:      { background: "#322d2d", padding: "40px 32px 28px", borderBottom: "1px solid #3a3a3a", display: "flex", flexDirection: "column" },
    body:        { padding: "24px 32px" },
    uploadForm:  { background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
    formLabel:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "4px", color: "#555", margin: "0" },
    fileInput:   { fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#888", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "8px 12px" },
    preview:     { width: "100%", display: "flex", justifyContent: "center", background: "#111", borderRadius: "4px", overflow: "hidden" },
    previewImg:  { maxWidth: "100%", maxHeight: "200px", objectFit: "contain" },
    uploadBtn:   { fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "2px", color: "#fff", background: "#fa4040", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer", alignSelf: "flex-end" },
    empty:       { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", letterSpacing: "2px", textAlign: "center", padding: "40px 0" },
    grid:        { display: "flex", flexDirection: "column", gap: "10px" },
    imageCard:   { background: "#222", border: "1px solid #2e2e2e", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "16px" },
    thumb:       { width: "64px", height: "64px", objectFit: "cover", borderRadius: "4px", border: "1px solid #333", flexShrink: 0 },
    imageCardInfo: { flex: 1, minWidth: 0 },
    imageName:   { fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#bbb", margin: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    imageMeta:   { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#555", margin: "4px 0 0", letterSpacing: "1px" },
    deleteBtn:   { fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "2px", color: "#888", background: "transparent", border: "1px solid #333", borderRadius: "3px", padding: "6px 12px", cursor: "pointer", flexShrink: 0 },
};

export default AdminImages;
