import eventModel from '../models/eventModel.js';

// GET /api/events public
export const getAllEvents = async (req, res) => {
    try {
        const events = await eventModel
            .find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return res.json({ success: true, events });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// GET /api/events/:id public
export const getEventById = async (req, res) => {
    try {
        const event = await eventModel
            .findById(req.params.id)
            .populate('author', 'username');

        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }

        return res.json({ success: true, event });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/events admin only
export const createEvent = async (req, res) => {
    const { userId, title, description } = req.body;

    if (!title || !description) {
        return res.json({ success: false, message: 'Title and description required' });
    }

    try {
        const event = new eventModel({ title, description, author: userId });
        await event.save();
        await event.populate('author', 'username');

        return res.json({ success: true, event });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// PUT /api/events/:id admin only
export const updateEvent = async (req, res) => {
    const { title, description } = req.body;

    try {
        const event = await eventModel.findById(req.params.id);

        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }

        if (title)       event.title       = title;
        if (description) event.description = description;

        await event.save();
        await event.populate('author', 'username');

        return res.json({ success: true, event });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// DELETE /api/events/:id admin only
export const deleteEvent = async (req, res) => {
    try {
        const event = await eventModel.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }

        return res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};