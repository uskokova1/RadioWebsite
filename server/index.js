import dns from "node:dns/promises";
import https from 'https';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

dns.setServers(["1.1.1.1"]);

import './config/dotenv.js'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./config/mongodb.js";
import userModel from './models/userModel.js';
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

const privateKey = fs.readFileSync('./server/localhost+1-key.pem', 'utf8');
const certificate = fs.readFileSync('./server/localhost+1.pem', 'utf8');
const httpsServer = https.createServer({
  key: privateKey,
  cert: certificate
}, app);

const io = new SocketIOServer(httpsServer, {
  cors: {
    origin: ['https://localhost:5173'],
    credentials: true
  }
});

const chatMessages = [];
const MAX_MESSAGES = 10;
let hostActive = false;

const authenticateSocket = async (socket) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.match(/token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id).select('username role');
    return user ? { id: user._id, username: user.username, role: user.role } : null;
  } catch {
    return null;
  }
};

io.on('connection', async (socket) => {
  socket.user = await authenticateSocket(socket);
  socket.emit('chat-history', chatMessages);
  if (hostActive) socket.emit('host-status', true);

  socket.on('chat-message', (text) => {
    if (!socket.user || !text?.trim()) return;
    const message = {
      id: Date.now(),
      userId: socket.user.id,
      username: socket.user.username,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    chatMessages.push(message);
    if (chatMessages.length > MAX_MESSAGES) chatMessages.shift();
    io.emit('chat-message', message);
  });

  socket.on('toggle-host', () => {
    if (socket.user?.role !== 'admin') return;
    hostActive = !hostActive;
    io.emit('host-status', hostActive);
  });

  socket.on('delete-message', ({ id }) => {
    if (socket.user?.role !== 'admin') return;
    const idx = chatMessages.findIndex(m => m.id === id);
    if (idx !== -1) {
      chatMessages.splice(idx, 1);
      io.emit('delete-message', { id });
    }
  });

  socket.on('disconnect', () => {});
});

httpsServer.listen(8443);
