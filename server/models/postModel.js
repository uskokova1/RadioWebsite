import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {type: String, required: true },
    description: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, { timestamps: true }); //this gives us created at/uploaded at

const postModel = mongoose.models.Post || mongoose.model('Post', postSchema);

export default postModel;