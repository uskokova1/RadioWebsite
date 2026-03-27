import express from 'express';
import {
    getAllContacts,
    createContact,
    updateContact,
    deleteContact,
} from '../controllers/contactController.js';
import adminAuth from '../middleware/adminAuth.js';

const contactRouter = express.Router();

contactRouter.get('/',      getAllContacts);
contactRouter.post('/',     adminAuth, createContact);
contactRouter.put('/:id',   adminAuth, updateContact);
contactRouter.delete('/:id',adminAuth, deleteContact);

export default contactRouter;