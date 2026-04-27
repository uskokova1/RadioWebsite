import express from 'express';
import {
    getComments,
    getAllComments,
    createComment,
    deleteComment,
    reactToComment,
    flagComment,
    unflagComment,
} from '../controllers/commentController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { moderateComment } from '../middleware/commentModerator.js';

const commentRouter = express.Router();

// specific routes MUST come before wildcard routes

// admin
commentRouter.get('/all',          adminAuth, getAllComments);

// react and flag — before /:targetType/:targetId wildcard
commentRouter.post('/:id/react',   userAuth, reactToComment);
commentRouter.post('/:id/flag',    userAuth, flagComment);

// admin delete — before /:id wildcard
commentRouter.delete('/admin/:id', adminAuth, (req, res, next) => {
    req.body.isAdmin = true;
    next();
}, deleteComment);

// admin unflag — before /:id wildcard
commentRouter.delete('/admin/:id/unflag', adminAuth, unflagComment);

// wildcard GET — public
commentRouter.get('/:targetType/:targetId', getComments);

// wildcard POST — create comment
commentRouter.post('/:targetType/:targetId', userAuth, moderateComment, createComment);

// delete own comment
commentRouter.delete('/:id', userAuth, deleteComment);

export default commentRouter;