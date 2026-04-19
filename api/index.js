try {
    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    const app = express();

    // Mock Data
    const mockProducts = [
        { id: 1, title: "Radiant Liquid Foundation", price: 24.99, category: "face", rating: 4.8, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600", description: "Experience..." },
        { id: 2, title: "Velvet Matte Lipstick", price: 18.50, category: "lips", rating: 4.5, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600", description: "Perfect..." }
    ];

    app.use(cors());
    app.use(express.json());

    // API Endpoints
    app.get('/api/health', (req, res) => res.json({ status: 'ok', source: 'unified-api' }));
    app.get('/api/products', (req, res) => res.json(mockProducts));

    // For Vercel, we export the app
    module.exports = app;

} catch (e) {
    // If the initialization crashes, return the error message!
    module.exports = (req, res) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("UNIFIED API CRASHED DURING INITIALIZATION:\n" + e.stack);
    };
}
