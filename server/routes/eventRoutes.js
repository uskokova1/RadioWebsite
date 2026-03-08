import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/eventController.js';
import adminAuth from '../middleware/adminAuth.js';

const eventRouter = express.Router();

//public
eventRouter.get('/',    getAllEvents);
eventRouter.get('/:id', getEventById);

//admin
eventRouter.post('/',      adminAuth, createEvent);
eventRouter.put('/:id',    adminAuth, updateEvent);
eventRouter.delete('/:id', adminAuth, deleteEvent);

export default eventRouter;