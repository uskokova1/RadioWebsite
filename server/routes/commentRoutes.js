import express from 'express';
import {
    getComments,
    getAllComments,
    createComment,
    deleteComment,
    reactToComment,
    flagComment,
} from '../controllers/commentController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { moderateComment } from '../middleware/commentModerator.js';

const commentRouter = express.Router();

// public
commentRouter.get('/:targetType/:targetId', getComments);

// admin — all comments + flagged filter via ?flagged=true
commentRouter.get('/all', adminAuth, getAllComments);

// userAuth
commentRouter.post('/:targetType/:targetId', userAuth, moderateComment, createComment);
commentRouter.post('/:id/react',             userAuth, reactToComment);
commentRouter.post('/:id/flag',              userAuth, flagComment);

// delete — userAuth checks ownership; admin route sets isAdmin flag
commentRouter.delete('/:id',       userAuth, deleteComment);
commentRouter.delete('/admin/:id', adminAuth, (req, res, next) => {
    req.body.isAdmin = true;
    next();
}, deleteComment);

export default commentRouter;