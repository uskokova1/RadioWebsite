import { useState } from "react";

function Blog() {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId !== null) {
            // this the edit logic - we replace with db update call later
            setPosts(posts.map(post =>
                post.id === editingId ? { ...post, title, description } : post
            ));
            setEditingId(null);
        } else {
            // THIS be the creation logic - replace later
            const newPost = {
                id: Date.now(),
                title,
                description,
                // author: currentUser.id  THIS SPOT FOR HOOK UP POST TO SPECIFIC ACCOUNT LATER
            };
            setPosts([...posts, newPost]);
        }
        setTitle("");
        setDescription("");
        setShowForm(false);
    };

    //setting the table
    const handleEdit = (post) => {
        setTitle(post.title);
        setDescription(post.description);
        setEditingId(post.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        // post deletion logic TO BE EDITED LATER GAMER
        setPosts(posts.filter(post => post.id !== id));
    };

    return (
        <>
            <h2>Blogs</h2>

            <button onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(""); setDescription(""); }}>
                {showForm ? "✕ Cancel" : "+ New Post"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button type="submit">{editingId !== null ? "Save Changes" : "Post"}</button>
                </form>
            )}

            <div>
                {posts.length === 0 && <p>No posts yet!</p>}
                {posts.map(post => (
                    <div key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <button onClick={() => handleEdit(post)}>Edit</button>
                        <button onClick={() => handleDelete(post.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Blog;