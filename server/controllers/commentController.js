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

// GET /api/comments/all  — admin only
export const getAllComments = async (req, res) => {
    try {
        const query = req.query.flagged === 'true'
            ? { 'flaggedBy.0': { $exists: true } }
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

// DELETE /api/comments/:id  — userAuth (own) or adminAuth
export const deleteComment = async (req, res) => {
    try {
        const { userId } = req.body;
        const comment = await commentModel.findById(req.params.id).populate('author', 'username');

        if (!comment) return res.json({ success: false, message: 'Comment not found' });

        const isOwn   = comment.author._id.toString() === userId.toString();
        const isAdmin = req.body.isAdmin;

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

        // compare as strings — ObjectId !== string without this
        const idx = reaction.users.findIndex(id => id.toString() === userId.toString());
        if (idx === -1) {
            reaction.users.push(userId);
        } else {
            reaction.users.splice(idx, 1);
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

        // compare as strings
        const alreadyFlagged = comment.flaggedBy.some(id => id.toString() === userId.toString());
        if (alreadyFlagged) {
            return res.json({ success: false, message: 'Already flagged' });
        }

        comment.flaggedBy.push(userId);
        await comment.save();
        return res.json({ success: true, message: 'Comment flagged' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};