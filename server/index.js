const express = require('express');
const cors = require('cors')

const app = express();
const PORT = 3000;

app.use(cors()) //by default, allows any cross-origin-resource sharing     look it up xd

//app.use(express.static('blah blah'))
// to run the frontend,  run npm run dev in client/radio folder
// the line above can be uncommented when we run npm run build which will compile react files so we can serve them from the nodejs server instead of localy

app.get('/api/test', (req, res) => {
  //res.sendFile("Test Message!");
  res.send(JSON.stringify("test message!"));
});

//starts server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
