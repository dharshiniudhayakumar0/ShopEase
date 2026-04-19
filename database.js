let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
} catch (e) {
    console.error("FATAL ERROR: Could NOT require sqlite3 native module!");
    console.error(e);
    // On Vercel, this is a common failure point for native modules
}

const isVercel = process.env.VERCEL === '1';
const dbPath = process.env.DATABASE_PATH || (isVercel ? path.join('/tmp', 'shopease.db') : path.resolve(__dirname, 'shopease.db'));

let db;
if (sqlite3) {
    db = new sqlite3.Database(dbPath);
    console.log(`Database connected: ${dbPath}`);
} else {
    // Mock DB if sqlite3 fails to load (prevents crash, but API will fail with error)
    db = { 
        all: (q, p, cb) => cb(new Error("Database native module failed to load")),
        run: (q, p, cb) => (cb ? cb(new Error("Database native module failed to load")) : null),
        get: (q, p, cb) => cb(new Error("Database native module failed to load")),
        serialize: (cb) => cb(),
        prepare: () => ({ run: () => {}, finalize: () => {} })
    };
}

const categories = ['face', 'eyes', 'lips', 'skincare'];
const adjectives = ["Radiant", "Flawless", "Velvet", "Luminous", "Matte", "Hydrating", "Glow", "Sunset", "Nourishing", "High-Shine", "Silky", "Vibrant", "Sheer", "Intense", "Soft"];
const types = {
    face: ["Liquid Foundation", "Powder Blush", "Concealer", "Setting Powder", "Bronzer", "Primer", "Highlighter", "Tinted Moisturizer"],
    eyes: ["Eyeshadow Palette", "Waterproof Mascara", "Liquid Eyeliner", "Brow Gel", "Gel Eyeliner", "Lash Serum", "Eye Primer"],
    lips: ["Matte Lipstick", "Lip Gloss", "Lip Liner", "Lip Balm", "Lip Tint", "Liquid Lipstick", "Lip Plumper"],
    skincare: ["Rose Water Toner", "Night Cream", "Vitamin C Serum", "Exfoliating Scrub", "Hydrating Mask", "Eye Cream", "Cleansing Oil", "Micellar Water"]
};
const imagePool = [
    "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1512496015851-a1dc8a477d48?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1631214532130-184518776092?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1571781926291-c477eb31f76e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1580870059345-4202e86121b6?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d?auto=format&fit=crop&q=80&w=600"
];

function initDb() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create Products Table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                price REAL,
                category TEXT,
                rating REAL,
                image TEXT,
                description TEXT
            )`);

            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                address TEXT,
                phone TEXT,
                avatar TEXT
            )`);

            // Create Orders Table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                items TEXT, -- JSON string
                total REAL,
                status TEXT DEFAULT 'Processing',
                date TEXT,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            // Create Wishlist Table
            db.run(`CREATE TABLE IF NOT EXISTS wishlist (
                userId INTEGER,
                productId INTEGER,
                PRIMARY KEY(userId, productId),
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(productId) REFERENCES products(id)
            )`);

            // Check if seeding is needed
            db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (err) return reject(err);
                if (row.count === 0) {
                    console.log("Seeding initial products...");
                    const stmt = db.prepare("INSERT INTO products (title, price, category, rating, image, description) VALUES (?, ?, ?, ?, ?, ?)");
                    for (let i = 1; i <= 100; i++) { // Seeding 100 for now to keep DB small initially
                        const category = categories[Math.floor(Math.random() * categories.length)];
                        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                        const typeList = types[category];
                        const type = typeList[Math.floor(Math.random() * typeList.length)];
                        const title = `${adjective} ${type}`;
                        const price = parseFloat((Math.random() * 73 + 12).toFixed(2));
                        const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
                        const image = imagePool[Math.floor(Math.random() * imagePool.length)];
                        const description = `Experience the luxury of our '${title}'. Formulated with premium ingredients.`;
                        stmt.run(title, price, category, rating, image, description);
                    }
                    stmt.finalize();
                }
                
                // Add a default admin user if not exists
                db.run("INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)", 
                       ['Admin User', 'admin@shopease.com', 'admin123'], (err) => {
                    if (err) console.error("Error seeding user:", err);
                    resolve();
                });
            });
        });
    });
}

module.exports = { db, initDb };
