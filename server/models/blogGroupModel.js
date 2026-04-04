import mongoose from 'mongoose';

const blogGroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

const blogGroupModel = mongoose.models.BlogGroup || mongoose.model('BlogGroup', blogGroupSchema);
export default blogGroupModel;
