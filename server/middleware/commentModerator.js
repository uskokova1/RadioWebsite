import { Filter } from 'bad-words';

const filter = new Filter();

// In-memory spam map: key = `${userId}:${targetId}`, value = timestamp of last comment
const lastCommentTime = new Map();
const COOLDOWN_MS = 10 * 60 * 1000; // 1 comment per 10 minutes per user per target

export const moderateComment = (req, res, next) => {
    const { text } = req.body;
    const userId   = req.body.userId;                       // set by userAuth
    const targetId = req.params.targetId;

    // --- profanity check ---
    if (!text || typeof text !== 'string') {
        return res.json({ success: false, message: 'Comment text is required' });
    }
    if (filter.isProfane(text)) {
        return res.json({ success: false, message: 'Comment contains inappropriate language' });
    }

    // --- spam check ---
    const key  = `${userId}:${targetId}`;
    const last = lastCommentTime.get(key);
    const now  = Date.now();

    if (last && now - last < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 60000);
        return res.json({
            success: false,
            message: `Please wait ${remaining} more minute(s) before commenting again`,
        });
    }

    lastCommentTime.set(key, now);
    next();
};