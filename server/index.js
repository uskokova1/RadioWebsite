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


app.use('/uploads', express.static('./server/uploads/'))
/*
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(join(__dirname, 'uploads')));
 */

app.get('/', (req, res) => {})
/*
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})
 */


import https from 'https';
import fs from 'fs';

const privateKey = fs.readFileSync('./server/localhost+1-key.pem', 'utf8');
const certificate = fs.readFileSync('./server/localhost+1.pem', 'utf8');
https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(8443);
