import contactModel from '../models/contactModel.js';

// GET /api/contacts  — public
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await contactModel.find().sort({ createdAt: 1 });
        return res.json({ success: true, contacts });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// POST /api/contacts  — adminAuth
export const createContact = async (req, res) => {
    try {
        const { name, position, email, link, initials, image } = req.body;
        if (!name || !position || !email) {
            return res.json({ success: false, message: 'name, position, and email required' });
        }
        const contact = new contactModel({
            name, position, email,
            link: link || null,
            image: image || null,
            initials: initials || null,
        });
        await contact.save();
        return res.json({ success: true, contact });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// PUT /api/contacts/:id  — adminAuth
export const updateContact = async (req, res) => {
    try {
        const contact = await contactModel.findById(req.params.id);
        if (!contact) return res.json({ success: false, message: 'Contact not found' });

        const { name, position, email, link, initials, image } = req.body;
        if (name)     contact.name     = name;
        if (position) contact.position = position;
        if (email)    contact.email    = email;
        if (initials !== undefined)  contact.initials  = initials;
        contact.link  = link !== undefined  ? link  : contact.link;
        contact.image = image !== undefined ? image : contact.image;

        await contact.save();
        return res.json({ success: true, contact });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

// DELETE /api/contacts/:id  — adminAuth
export const deleteContact = async (req, res) => {
    try {
        const contact = await contactModel.findByIdAndDelete(req.params.id);
        if (!contact) return res.json({ success: false, message: 'Contact not found' });
        return res.json({ success: true, message: 'Contact deleted' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};