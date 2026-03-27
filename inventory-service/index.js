const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (Inventory Service)'))
    .catch((err) => console.error('❌ Database connection error:', err));

// Inventory Model (Schema)
const inventorySchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    warehouseLocation: { type: String, default: 'Main Warehouse' },
    lastUpdated: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// --- Swagger Configuration ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'SwiftCart Inventory API',
            version: '1.0.0',
            description: 'API for managing product stock and warehouse levels',
        },
        servers: [{ url: 'http://localhost:8004' }, { url: 'http://localhost:8000/inventory' }],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Endpoints ---

/**
 * @openapi
 * /inventory/{productId}:
 * get:
 * summary: Get stock level for a specific product
 * parameters:
 * - in: path
 * name: productId
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Success
 * 404:
 * description: Product not found
 */
app.get('/inventory/:productId', async (req, res) => {
    try {
        const item = await Inventory.findOne({ productId: req.params.productId });
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Product ID not found in inventory' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @openapi
 * /inventory/update:
 * put:
 * summary: Update stock quantity (Increase or Decrease)
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * productId:
 * type: string
 * quantityChange:
 * type: number
 * responses:
 * 200:
 * description: Inventory updated successfully
 */
app.put('/inventory/update', async (req, res) => {
    const { productId, quantityChange } = req.body;
    try {
        const item = await Inventory.findOne({ productId });
        if (item) {
            item.stockQuantity += quantityChange;
            // Prevent negative stock
            if (item.stockQuantity < 0) item.stockQuantity = 0;
            
            item.lastUpdated = Date.now();
            await item.save();
            res.status(200).json({ message: 'Inventory updated successfully!', updatedItem: item });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Inventory Microservice is online and healthy.');
});

// Port Configuration
const PORT = 8004;
app.listen(PORT, () => {
    console.log(`🚀 Inventory Service is running on http://localhost:${PORT}`);
    console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
});