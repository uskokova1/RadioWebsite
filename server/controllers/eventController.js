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

        if (!event) return res.json({ success: false, message: 'Event not found' });
        return res.json({ success: true, event });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/events admin only
export const createEvent = async (req, res) => {
    const {title, description, image, dates, recurrence, repeatDays, time} = req.body;
    req.body.userId = req.userId;

    if (!title || !description) {
        return res.json({ success: false, message: 'Title and description required' });
    }

    const { userId } = req.body;

    try {
        const event = new eventModel({ title, description, author: userId, image: image || null, dates: dates || [], recurrence: recurrence || 'none', repeatDays: repeatDays || [], time: time || null });
        await event.save();
        await event.populate('author', 'username');
        return res.json({ success: true, event });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// PUT /api/events/:id admin only
export const updateEvent = async (req, res) => {
    const { title, description, image, dates, recurrence, repeatDays, time } = req.body;

    try {
        const event = await eventModel.findById(req.params.id);
        if (!event) return res.json({ success: false, message: 'Event not found' });

        if (title) event.title = title;
        if (description) event.description = description;
        if (image !== undefined) event.image = image;
        if (dates !== undefined) event.dates = dates;
        if (recurrence !== undefined) event.recurrence = recurrence;
        if (repeatDays !== undefined) event.repeatDays = repeatDays;
        if (time !== undefined) event.time = time;

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
        if (!event) return res.json({ success: false, message: 'Event not found' });
        return res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/events/:id/rsvp  — userAuth, toggles rsvp on/off
export const rsvpEvent = async (req, res) => {
    try {
        const { userId } = req.body;
        const event = await eventModel.findById(req.params.id);
        if (!event) return res.json({ success: false, message: 'Event not found' });

        const idx = event.rsvps.findIndex(id => id.toString() === userId.toString());
        if (idx === -1) {
            event.rsvps.push(userId);   // add rsvp
        } else {
            event.rsvps.splice(idx, 1); // remove rsvp
        }

        await event.save();

        return res.json({
            success: true,
            rsvpCount: event.rsvps.length,
            isGoing:   idx === -1,  // true if we just added, false if we just removed
        });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};