import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

import './config/dotenv.js'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import postRouter from './routes/postRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import contactRouter from './routes/contactRoutes.js';
import {generalRateLimiter} from "./middleware/rateLimiter.js";


const app = express();
const port = process.env.PORT || 4000;
connectDB()

app.use(express.json());
app.use(cookieParser());
app.use(generalRateLimiter);

const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

app.use('/api/auth',     authRouter)
app.use('/api/user',     userRouter)
app.use('/api/posts',    postRouter)
app.use('/api/events',   eventRouter)
app.use('/api/comments', commentRouter)
app.use('/api/contacts', contactRouter)

app.get('/', (req, res) => {})

// radio metadata access
app.get('/api/stream/status', async (req, res) => {
  try {
    const response = await fetch(`https://broadcast.shoutcheap.com/proxy/wsinradi/stream.xspf?_=${Date.now()}`);
    const text = await response.text();

    const listenersMatch = text.match(/Current Listeners: (\d+)/);
    const listeners = listenersMatch ? parseInt(listenersMatch[1]) : null;

    res.json({ success: true, listeners });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})
