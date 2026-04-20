import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    image:       { type: String, default: null },
    dates:       { type: [Date], default: [] },
    recurrence:  { type: String, enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'], default: 'none' },
    repeatDays:  { type: [String], enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], default: [] },
    time:        { type: String, default: null },
    author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rsvps:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const eventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default eventModel;
