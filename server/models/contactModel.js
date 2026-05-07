import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    position: { type: String, required: true },
    email:    { type: String, required: true },
    link:     { type: String, default: null },
    image:    { type: String, default: null },
    initials: { type: String, default: null },
}, { timestamps: true });

const contactModel = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
export default contactModel;