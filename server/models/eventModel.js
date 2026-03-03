import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title : {type: String, required: true},
    description : {type: String, required: true},
    thumbnail : {type: String, default: ''}, //dynamic store image url
    author : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, { timestamps: true });

const eventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);