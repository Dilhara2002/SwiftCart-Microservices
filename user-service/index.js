const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI);

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real application, this should be hashed
    role: { type: String, default: 'Customer' }
});

const User = mongoose.model('User', userSchema);

// 1. Register a new user
app.post('/users/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('User Service is Working on Port 8001');
});

const PORT = 8001;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});