import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

const isImage = (name) => {
    const ext = path.extname(name).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.jfif'].includes(ext);
};

const fileStats = (name) => {
    const fullPath = path.join(uploadDir, name);
    const stat = fs.statSync(fullPath);
    return { name, size: stat.size, createdAt: stat.birthtime, modifiedAt: stat.mtime };
};

// GET /api/images — list all images
export const getAllImages = async (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir).filter(isImage).map(fileStats);
        return res.json({ success: true, images: files });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// DELETE /api/images/:filename — delete an image
export const deleteImage = async (req, res) => {
    const filename = req.params.filename;
    const fullPath = path.join(uploadDir, filename);

    if (!fs.existsSync(fullPath)) {
        return res.json({ success: false, message: 'Image not found' });
    }

    try {
        fs.unlinkSync(fullPath);
        return res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/images/upload — upload a new image
export const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: 'No file uploaded' });
    }
    try {
        return res.json({ success: true, image: fileStats(req.file.filename) });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};
