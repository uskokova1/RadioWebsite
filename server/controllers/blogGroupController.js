import BlogGroup from '../models/blogGroupModel.js';
import postModel from '../models/postModel.js';

export const getBlogGroups = async (req, res) => {
    try {
        const groups = await BlogGroup.find({ status: true }).populate('createdBy', 'firstName lastName');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createBlogGroup = async (req, res) => {
    try {
        const user = { id: req.userId };
        const { name, description, coverImage } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const exists = await BlogGroup.findOne({ slug });
        if (exists) {
            return res.status(400).json({ message: 'A blog group with this name already exists' });
        }

        const blogGroup = new BlogGroup({
            name,
            description,
            coverImage,
            slug,
            createdBy: user.id
        });

        await blogGroup.save();
        res.status(201).json(blogGroup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getBlogGroupById = async (req, res) => {
    try {
        const group = await BlogGroup.findById(req.params.id).populate('createdBy', 'firstName lastName');
        if (!group) {
            return res.status(404).json({ message: 'Blog group not found' });
        }
        const posts = await postModel.find({ blogGroup: req.params.id, status: 'published' }).populate('author', 'firstName lastName').sort({ createdAt: -1 });
        res.json({ ...group.toObject(), posts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateBlogGroup = async (req, res) => {
    try {
        const user = { id: req.userId };
        const group = await BlogGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Blog group not found' });
        }

        const { name, description, coverImage } = req.body;
        if (name !== group.name) {
            group.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }

        group.name = name || group.name;
        group.description = description ?? group.description;
        group.coverImage = coverImage ?? group.coverImage;
        await group.save();
        res.json(group);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteBlogGroup = async (req, res) => {
    try {
        const group = await BlogGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Blog group not found' });
        }

        await BlogGroup.findByIdAndDelete(req.params.id);
        await postModel.deleteMany({ blogGroup: req.params.id });
        res.json({ message: 'Blog group and its posts deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
