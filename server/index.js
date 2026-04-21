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
import imageRouter from './routes/imageRoutes.js';
import blogGroupRouter from './routes/blogGroupRoutes.js';
import {generalRateLimiter} from "./middleware/rateLimiter.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB()

app.use(express.json());
app.use(cookieParser());
app.use(generalRateLimiter);

const allowedOrigins = ['https://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

app.use('/api/auth',     authRouter)
app.use('/api/user',     userRouter)
app.use('/api/posts',    postRouter)
app.use('/api/events',   eventRouter)
app.use('/api/comments', commentRouter)
app.use('/api/contacts', contactRouter)
app.use('/api/images',    imageRouter)
app.use('/api/bloggroup', blogGroupRouter)

app.use('/uploads', express.static('./server/uploads/'))

app.get('/', (req, res) => {})

// radio metadata proxy
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

import https from 'https';
import fs from 'fs';

const privateKey = fs.readFileSync('./server/localhost+1-key.pem', 'utf8');
const certificate = fs.readFileSync('./server/localhost+1.pem', 'utf8');
https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(8443);
