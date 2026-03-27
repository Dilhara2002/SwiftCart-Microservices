const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (put your Atlas link here)
// mongoose.connect(process.env.MONGO_URI);

// Order structure (Schema)
const orderSchema = new mongoose.Schema({
    userId: String,
    products: [{ productId: String, quantity: Number }],
    totalAmount: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// 1. Create a new order
app.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Order Service is Working on Port 8003');
});

// According to the assignment, the port should be 8003
const PORT = 8003;
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});