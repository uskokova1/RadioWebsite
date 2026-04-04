import express from 'express';
import {
    getAllImages,
    deleteImage,
    uploadImage,
} from '../controllers/imageController.js';
import adminAuth from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';

const imageRouter = express.Router();

// all admin-only
imageRouter.get('/',          adminAuth, getAllImages);
imageRouter.post('/upload',   adminAuth, upload.single('image'), uploadImage);
imageRouter.delete('/:filename', adminAuth, deleteImage);

export default imageRouter;
