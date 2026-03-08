import express from 'express';
import {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
} from "../controllers/postController.js";
import adminAuth from '../middleware/adminAuth.js';

const postRouter = express.Router();

//public
postRouter.get('/', getAllPosts);
postRouter.get('/:id', getPostById);

//admin
postRouter.post('/', adminAuth, createPost);
postRouter.put('/:id', adminAuth, updatePost);
postRouter.delete('/:id', adminAuth, deletePost);

export default postRouter;