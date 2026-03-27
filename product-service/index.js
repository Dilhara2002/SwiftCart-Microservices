const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (User Service)'))
    .catch((err) => console.error('❌ Database connection error:', err));

// User Model (Schema)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Customer' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- Swagger Configuration ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'SwiftCart User API',
            version: '1.0.0',
            description: 'API for managing user registration and profiles',
        },
        servers: [{ url: 'http://localhost:8001' }],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Endpoints ---

/**
 * @openapi
 * /users/register:
 * post:
 * summary: Register a new user
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 201:
 * description: User created successfully
 */
app.post('/users/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @openapi
 * /users:
 * get:
 * summary: Get all registered users
 * responses:
 * 200:
 * description: A list of users
 */
app.get('/users', async (req, res) => {
    try {
        // Exclude password from the results for security
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('User Microservice is online and healthy.');
});

// Port Configuration
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`🚀 User Service is running on http://localhost:${PORT}`);
    console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
});