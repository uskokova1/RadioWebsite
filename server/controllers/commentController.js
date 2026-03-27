import commentModel from '../models/commentModel.js';

// GET /api/comments/:targetType/:targetId  — public
export const getComments = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const comments = await commentModel
            .find({ targetType, targetId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return res.json({ success: true, comments });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// GET /api/comments/all  — admin only, returns everything with optional ?flagged=true filter
export const getAllComments = async (req, res) => {
    try {
        const query = req.query.flagged === 'true'
            ? { 'flaggedBy.0': { $exists: true } }   // at least one flag
            : {};

        const comments = await commentModel
            .find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return res.json({ success: true, comments });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/comments/:targetType/:targetId  — userAuth + moderateComment
export const createComment = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const { userId, text } = req.body;

        const comment = new commentModel({ text, author: userId, targetId, targetType });
        await comment.save();
        await comment.populate('author', 'username');

        return res.json({ success: true, comment });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// DELETE /api/comments/:id  — userAuth (admin or own comment)
export const deleteComment = async (req, res) => {
    try {
        const { userId } = req.body;
        const comment = await commentModel.findById(req.params.id).populate('author', 'username role');

        if (!comment) return res.json({ success: false, message: 'Comment not found' });

        // allow if own comment or admin
        const isOwn   = comment.author._id.toString() === userId;
        const isAdmin = req.body.isAdmin;   // set by adminAuth when used on that route

        if (!isOwn && !isAdmin) {
            return res.json({ success: false, message: 'Not authorized' });
        }

        await commentModel.findByIdAndDelete(req.params.id);
        return res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/comments/:id/react  — userAuth
export const reactToComment = async (req, res) => {
    try {
        const { userId, emoji } = req.body;
        const comment = await commentModel.findById(req.params.id);
        if (!comment) return res.json({ success: false, message: 'Comment not found' });

        const reaction = comment.reactions.find(r => r.emoji === emoji);
        if (!reaction) return res.json({ success: false, message: 'Invalid emoji' });

        const idx = reaction.users.indexOf(userId);
        if (idx === -1) {
            reaction.users.push(userId);    // add reaction
        } else {
            reaction.users.splice(idx, 1);  // toggle off
        }

        await comment.save();
        return res.json({ success: true, reactions: comment.reactions });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/comments/:id/flag  — userAuth
export const flagComment = async (req, res) => {
    try {
        const { userId } = req.body;
        const comment = await commentModel.findById(req.params.id);
        if (!comment) return res.json({ success: false, message: 'Comment not found' });

        if (comment.flaggedBy.includes(userId)) {
            return res.json({ success: false, message: 'Already flagged' });
        }

        comment.flaggedBy.push(userId);
        await comment.save();
        return res.json({ success: true, message: 'Comment flagged' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};