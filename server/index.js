const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/dbConn.js');
const mongoose = require('mongoose');
const {mongo} = require("mongoose");
const cookieParser = require('cookie-parser');

const dotenv = require('dotenv') //initializes environment variables from .env file
dotenv.config({ path: './server/.env' });

const app = express();
const PORT = 3000;

app.use(cors()) //by default, allows any cross-origin-resource sharing     look it up xd
app.use(express.json());
app.use(cookieParser());

app.use('/users', require('./routes/userRoutes'));
app.use('/auth', require('./routes/authRoutes'));


//app.use(express.static('blah blah'))
// to run the frontend,  run npm run dev in client/radio folder
// the line above can be uncommented when we run npm run build which will compile react files so we can serve them from the nodejs server instead of localy



connectDB()
//starts server
mongoose.connection.once('open', () => {
  console.log('MongoDB Connected');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})

mongoose.connection.on('error', (err) => {
  console.log(err);
})