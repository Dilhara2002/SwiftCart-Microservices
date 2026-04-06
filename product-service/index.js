const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 DNS fix
// const dns = require('dns');
// dns.setServers(['1.1.1.1']);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (Product Service)'))
    .catch((err) => console.error('❌ Database connection error:', err));

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Product name is required'],
        trim: true, 
        minlength: [3, 'Product name must be at least 3 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be a negative value']
    }, 
    category: { 
        type: String, 
        required: true,
        trim: true 
    },
    stock: { 
        type: Number, 
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'], 
        validate: {
            validator: Number.isInteger, 
            message: 'Stock must be an integer (cannot have decimals)'
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Product = mongoose.model('Product', productSchema);

// --- 100% Error-Free Swagger Configuration ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'SwiftCart Product API',
            version: '1.0.0',
            description: 'API for managing SwiftCart products',
        },
        servers: [{ url: 'http://localhost:8002' }, { url: 'http://localhost:8000' }],
        paths: {
            '/products/add-product': {
                post: {
                    summary: 'Add a new product',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        price: { type: 'number' },
                                        category: { type: 'string' },
                                        stock: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { '201': { description: 'Product added successfully' } }
                },
                
            },
            '/products': {
            get: {
                    summary: 'Get all products',
                    responses: { '200': { description: 'A list of products' } }
                }
        }
    }
    },
    apis: [], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(['/api-docs', '/products/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Endpoints (Original Routes) ---

app.post('/products/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('Product Microservice is online and healthy.'));

const PORT = 8002;
app.listen(PORT, () => {
    console.log(`🚀 Product Service is running on http://localhost:${PORT}`);
    console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
});