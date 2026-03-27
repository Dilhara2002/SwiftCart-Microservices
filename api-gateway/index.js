const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

/**
 * MICROSERVICES CONFIGURATION
 * Maps incoming request paths to the internal microservice URLs.
 */
const services = [
    {
        path: '/users',
        target: 'http://localhost:8001',
    },
    {
        path: '/products',
        target: 'http://localhost:8002',
    },
    {
        path: '/orders',
        target: 'http://localhost:8003',
    },
    {
        path: '/inventory',
        target: 'http://localhost:8004',
    }
];

// Setting up Proxy for each Microservice
services.forEach(({ path, target }) => {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        // pathRewrite is removed so microservices receive the full path (e.g., /users/register)
        // which matches their internal routing.
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Gateway]: Routing ${req.method} request from ${req.originalUrl} to ${target}`);
        },
        onError: (err, req, res) => {
            console.error(`[Gateway]: Error connecting to service at ${target}`, err.message);
            res.status(502).json({ message: "Service is currently unavailable." });
        }
    }));
});

// Health check endpoint for the Gateway
app.get('/', (req, res) => {
    res.status(200).json({
        message: "SwiftCart API Gateway is running.",
        active_services: services.map(s => s.path)
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 API GATEWAY STARTED ON PORT: ${PORT}`);
    console.log(`🔗 Entry Point: http://localhost:${PORT}`);
    console.log(`--------------------------------------------------`);
});