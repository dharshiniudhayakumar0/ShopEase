module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { email } = req.body || {};
        res.status(200).json({ 
            id: 1, 
            name: "Admin User", 
            email: email || "admin@shopease.com",
            address: "123 Beauty Lane, Glow City",
            phone: "+1 234 567 890",
            avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"
        });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
};
