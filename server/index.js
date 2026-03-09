import './config/dotenv.js'
//dotenv.config({path: './server/.env'});
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import postRouter from './routes/postRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import {generalRateLimiter} from "./middleware/rateLimiter.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB()

app.use(express.json());
app.use(cookieParser());
app.use(generalRateLimiter);


const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/events', eventRouter)

app.get('/', (req, res) => {})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})