import './config/dotenv.js'
//dotenv.config({path: './server/.env'});
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB()

app.use(express.json());
app.use(cookieParser());


const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin: allowedOrigins, credentials: true}));

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})