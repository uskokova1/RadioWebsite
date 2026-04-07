import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rsvps:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const eventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default eventModel;