import postModel from '../models/postModel.js';

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

// POST /api/posts admin only
export const createPost = async (req, res) => {
    const { userId, title, description } = req.body;

    if (!title || !description) {
        return res.json({ success: false, message: 'Title and description required' });
    }

    try {
        const post = new postModel({ title, description, author: userId });
        await post.save();
        await post.populate('author', 'username');

        return res.json({ success: true, post });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// PUT /api/posts/:id admin only
export const updatePost = async (req, res) => {
    const { title, description } = req.body;

    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.json({ success: false, message: 'Post not found' });
        }

        if (title)       post.title       = title;
        if (description) post.description = description;

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