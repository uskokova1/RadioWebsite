import postModel from '../models/postModel.js';
import BlogGroup from '../models/blogGroupModel.js';

export const getBlogGroupPosts = async (req, res) => {
    try {
        const groupId = req.params.id;
        const posts = await postModel.find({ blogGroup: groupId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        return res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//GET /api/posts public
export const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel
            .find({})
            .populate('author', 'username')
            .sort({createdAt: -1});

        return res.json({success: true, posts});
    }catch (err){
        return res.json({success: false, message: err.message});
    }
};

//GET /api/posts/:id public
export const getPostById = async (req, res) => {
    try {
        const post = await postModel
            .findById(req.params.id)
            .populate('author', 'username');

        if (!post) {
            return res.json({success: false, message:'Post not found'});
        }

        return res.json({success: true, post});
    }catch(err){
        return res.json({success: false, message: err.message});
    }
};

// POST /api/posts
export const createPost = async (req, res) => {
    req.body.userId = req.userId;
    const { userId, title, description, image, blogGroupId } = req.body;

    if (!title || !description || !blogGroupId) {
        return res.json({ success: false, message: 'Title, description and blog group required' });
    }

    const group = await BlogGroup.findById(blogGroupId);
    if (!group) {
        return res.json({ success: false, message: 'Blog group not found' });
    }

    try {
        const post = new postModel({ title, description, author: userId, image, blogGroup: blogGroupId });
        await post.save();
        await post.populate('author', 'username');
        return res.json({ success: true, post });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// PUT /api/posts/:id
export const updatePost = async (req, res) => {
    const { title, description, image, blogGroupId } = req.body;

    try {
        const post = await postModel.findById(req.params.id);
        if (!post) return res.json({ success: false, message: 'Post not found' });

        if (title) post.title = title;
        if (description) post.description = description;
        post.image = image;
        if (blogGroupId) post.blogGroup = blogGroupId;

        await post.save();
        await post.populate('author', 'username');
        return res.json({ success: true, post });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// DELETE /api/posts/:id admin only
export const deletePost = async (req, res) => {
    try {
        const post = await postModel.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.json({ success: false, message: 'Post not found' });
        }

        return res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};
