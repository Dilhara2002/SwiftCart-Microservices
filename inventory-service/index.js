const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (your Atlas link should be placed here)
// mongoose.connect(process.env.MONGO_URI);

// Inventory Schema
const inventorySchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true },
    warehouseLocation: String,
    lastUpdated: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// 1. Check stock quantity for a product (Get Stock for a Product)
app.get('/inventory/:productId', async (req, res) => {
    try {
        const item = await Inventory.findOne({ productId: req.params.productId });
        if (item) res.json(item);
        else res.status(404).json({ message: 'Product not found in inventory' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Update stock quantity (Update Stock)
app.put('/inventory/update', async (req, res) => {
    const { productId, quantityChange } = req.body; // quantityChange can be -5 or +10
    try {
        const item = await Inventory.findOne({ productId });
        if (item) {
            item.stockQuantity += quantityChange;
            item.lastUpdated = Date.now();
            await item.save();
            res.json({ message: 'Inventory updated!', updatedItem: item });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Inventory Service is Working on Port 8004');
});

const PORT = 8004;
app.listen(PORT, () => {
    console.log(`Inventory Service running on port ${PORT}`);
});