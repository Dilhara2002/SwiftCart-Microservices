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
    .then(() => console.log('✅ Connected to MongoDB Atlas (Order Service)'))
    .catch((err) => console.error('❌ Database connection error:', err));

// Order Model (Schema)
const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{ 
        productId: { type: String, required: true }, 
        quantity: { type: Number, required: true } 
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- Swagger Configuration ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'SwiftCart Order API',
            version: '1.0.0',
            description: 'API for processing and managing customer orders',
        },
        servers: [{ url: 'http://localhost:8003' }, { url: 'http://localhost:8000/orders' }],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Endpoints ---

/**
 * @openapi
 * /orders:
 * post:
 * summary: Place a new order
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * userId:
 * type: string
 * products:
 * type: array
 * items:
 * type: object
 * properties:
 * productId:
 * type: string
 * quantity:
 * type: number
 * totalAmount:
 * type: number
 * responses:
 * 201:
 * description: Order created successfully
 */
app.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            order: savedOrder 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @openapi
 * /orders:
 * get:
 * summary: Retrieve all orders
 * responses:
 * 200:
 * description: A list of orders
 */
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Order Microservice is online and healthy.');
});

// Port Configuration
const PORT = 8003;
app.listen(PORT, () => {
    console.log(`🚀 Order Service is running on http://localhost:${PORT}`);
    console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
});