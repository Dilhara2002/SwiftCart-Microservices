const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// Define routes for microservices
const routes = {
    '/users': 'http://localhost:8001',
    '/products': 'http://localhost:8002',
    '/orders': 'http://localhost:8003',
    '/inventory': 'http://localhost:8004',
};

// Connect each route to the API Gateway
for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({ 
        target, 
        changeOrigin: true,
        pathRewrite: { [`^${path}`]: '' } 
    }));
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});