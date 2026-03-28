const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 DNS fix
const dns = require('dns');
dns.setServers(['1.1.1.1']);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (User Service)'))
    .catch((err) => console.error('❌ Database connection error:', err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Customer' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- 100% Error-Free Swagger Configuration ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'SwiftCart User API',
            version: '1.0.0',
            description: 'API for managing user registration and profiles',
        },
        servers: [{ url: 'http://localhost:8001' }, { url: 'http://localhost:8000' }],
        paths: {
            '/users/register': {
                post: {
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        role: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { '201': { description: 'User created successfully' } }
                }
            },
            '/users': {
                get: {
                    summary: 'Get all registered users',
                    responses: { '200': { description: 'A list of users' } }
                }
            }
        }
    },
    apis: [], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(['/api-docs', '/users/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Endpoints (Original Routes) ---

app.post('/users/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('User Microservice is online and healthy.'));

const PORT = 8001;
app.listen(PORT, () => {
    console.log(`🚀 User Service is running on http://localhost:${PORT}`);
    console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
});