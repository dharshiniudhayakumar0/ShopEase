const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Mock Data for Demo
const mockProducts = [
    { id: 1, title: "Radiant Liquid Foundation", price: 24.99, category: "face", rating: 4.8, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600", description: "Experience the luxury of our Radiant Liquid Foundation." },
    { id: 2, title: "Velvet Matte Lipstick", price: 18.50, category: "lips", rating: 4.5, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600", description: "Perfect matte finish for all day wear." }
];

// Mock Database Object to prevent ReferenceErrors on other endpoints
const db = {
    all: (q, p, cb) => {
        const callback = typeof p === 'function' ? p : cb;
        callback(null, mockProducts);
    },
    run: (q, p, cb) => {
        const callback = typeof p === 'function' ? p : cb;
        if (callback) callback(null);
    },
    get: (q, p, cb) => {
        const callback = typeof p === 'function' ? p : cb;
        callback(null, null);
    }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health Check (NO DATABASE)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        env: process.env.VERCEL ? 'vercel' : 'local'
    });
});

// API Endpoints

// 1. Products
app.get('/api/products', (req, res) => {
    const { category, search, sort } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== 'all') {
        query += " AND category = ?";
        params.push(category);
    }
    if (search) {
        query += " AND (title LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price-low') query += " ORDER BY price ASC";
    else if (sort === 'price-high') query += " ORDER BY price DESC";
    else query += " ORDER BY id DESC";

    res.json(mockProducts);
});

app.post('/api/products', (req, res) => {
    const { title, price, category, image, description } = req.body;
    db.run(`INSERT INTO products (title, price, category, rating, image, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, price, category, 4.5, image, description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

app.delete('/api/products/:id', (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 2. Auth (Simple Mock)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        res.json({ id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone, avatar: user.avatar });
    });
});

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function(err) {
        if (err) return res.status(400).json({ error: "Email already exists or invalid data" });
        res.json({ id: this.lastID, name, email });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { name, email, address, phone, avatar } = req.body;
    db.run(`UPDATE users SET name = ?, email = ?, address = ?, phone = ?, avatar = ? WHERE id = ?`,
        [name, email, address, phone, avatar, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// 3. Orders
app.post('/api/orders', (req, res) => {
    const { userId, items, total } = req.body;
    const date = new Date().toISOString();
    db.run(`INSERT INTO orders (userId, items, total, date) VALUES (?, ?, ?, ?)`,
        [userId, JSON.stringify(items), total, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, status: 'Processing', date });
        }
    );
});

app.get('/api/orders/user/:userId', (req, res) => {
    db.all(`SELECT * FROM orders WHERE userId = ? ORDER BY id DESC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const orders = rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') }));
        res.json(orders);
    });
});

app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 4. Wishlist
app.get('/api/wishlist/:userId', (req, res) => {
    db.all(`SELECT p.* FROM products p JOIN wishlist w ON p.id = w.productId WHERE w.userId = ?`, 
        [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/wishlist', (req, res) => {
    const { userId, productId } = req.body;
    db.run(`INSERT OR IGNORE INTO wishlist (userId, productId) VALUES (?, ?)`, [userId, productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/wishlist/:userId/:productId', (req, res) => {
    db.run(`DELETE FROM wishlist WHERE userId = ? AND productId = ?`, 
        [req.params.userId, req.params.productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 5. Admin Stats
app.get('/api/admin/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY id DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/stats', (req, res) => {
    const stats = {};
    db.get("SELECT SUM(total) as revenue, COUNT(*) as orders FROM orders", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.revenue = row.revenue || 0;
        stats.orders = row.orders || 0;
        
        db.get("SELECT COUNT(*) as users FROM users", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.users = row.users || 0;
            res.json(stats);
        });
    });
});

// Start Server (Only if not in Vercel)
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`\n🚀 ShopEase Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
