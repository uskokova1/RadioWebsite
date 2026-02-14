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

app.get('/api/test', (req, res) => {
  //res.sendFile("Test Message!");
  res.send(JSON.stringify("test message!"));
});

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


//code below is nowhere near done fr xd
/*
// Generating JWT
app.post("/user/generateToken", (req, res) => {
  // Validate User Here
  // Then generate JWT Token

  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
    time: Date(),
    userId: 12,
  }

  const token = jwt.sign(data, jwtSecretKey);

  res.send(token);
});

// Verification of JWT
app.get("/user/validateToken", (req, res) => {
  // Tokens are generally passed in header of request
  // Due to security reasons.

  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const token = req.header(tokenHeaderKey);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.send("Successfully Verified");
    } else {
      // Access Denied
      return res.status(401).send(error);
    }
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
});
 */
