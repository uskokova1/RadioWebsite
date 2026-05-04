import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    emoji: { type: String, required: true },       // '👍' '❤️' etc.
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false })

const commentSchema = new mongoose.Schema({
    text:       { type: String, required: true, maxlength: 500 },
    author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },   // post._id or event._id
    targetType: { type: String, enum: ['post', 'event'], required: true },
    reactions:  {
        type: [reactionSchema],
        default: () => [
            { emoji: '👍', users: [] },
            { emoji: '❤️', users: [] },
            { emoji: '😂', users: [] },
            { emoji: '🔥', users: [] },
            { emoji: '😮', users: [] },
        ],
    },
    flaggedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const commentModel = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default commentModel;