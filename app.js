// Import express module
const express = require('express');

const app = express();
const PORT = 80;

app.use(express.static('public')) //serves files from public directory

app.get('/', (req, res) => {
  res.sendFile("test.html", { root: "public" });
});

//starts server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

