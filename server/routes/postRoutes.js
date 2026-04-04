import express from 'express';
import {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getBlogGroupPosts,
} from "../controllers/postController.js";
import adminAuth from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';


const postRouter = express.Router();

//public
postRouter.get('/', getAllPosts);
postRouter.get('/blog/:id', getBlogGroupPosts);
postRouter.get('/:id', getPostById);

//admin
postRouter.post('/', adminAuth, upload.single('image'), createPost);
postRouter.put('/:id', adminAuth, upload.single('image'), updatePost);
postRouter.delete('/:id', adminAuth, deletePost);

export default postRouter;