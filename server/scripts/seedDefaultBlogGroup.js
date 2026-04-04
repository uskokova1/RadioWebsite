import BlogGroup from '../models/blogGroupModel.js';
import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';

export const seedDefaultBlogGroup = async () => {
    try {
        const existing = await BlogGroup.findOne({ slug: 'default' });
        console.log(existing);

        await PostModel.updateMany(
            { blogGroup: { $exists: false } },
            { $set: { blogGroup: existing._id } }
        );

        console.log('Seeded default blog group:', existing.name, '— assigned', PostModel.collection.name + ' posts');
    } catch (err) {
        console.error('Seed default blog group failed:', err.message);
    }
};