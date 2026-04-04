import express from 'express';
import {
    getBlogGroups,
    createBlogGroup,
    getBlogGroupById,
    updateBlogGroup,
    deleteBlogGroup,
} from '../controllers/blogGroupController.js';
import authMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getBlogGroups);
router.post('/', authMiddleware, createBlogGroup);
router.get('/:id', getBlogGroupById);
router.put('/:id', authMiddleware, updateBlogGroup);
router.delete('/:id', authMiddleware, deleteBlogGroup);

export default router;