import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
} from '../controllers/eventController.js';
import adminAuth from '../middleware/adminAuth.js';
import userAuth  from '../middleware/userAuth.js';

const eventRouter = express.Router();

// public
eventRouter.get('/',    getAllEvents);
eventRouter.get('/:id', getEventById);

// user
eventRouter.post('/:id/rsvp', userAuth, rsvpEvent);

// admin
eventRouter.post('/',      adminAuth, createEvent);
eventRouter.put('/:id',    adminAuth, updateEvent);
eventRouter.delete('/:id', adminAuth, deleteEvent);

export default eventRouter;