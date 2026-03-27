const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (your Atlas link should be placed here)
// mongoose.connect(process.env.MONGO_URI);

app.get('/', (req, res) => {
    res.send('Product Service is Working!');
});

// Important: Product service runs on port 8002
const PORT = 8002; 
app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});