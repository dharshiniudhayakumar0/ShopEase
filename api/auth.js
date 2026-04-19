module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST') {
        res.statusCode = 200;
        res.end(JSON.stringify({ 
            id: 1, 
            name: "Admin User", 
            email: "admin@shopease.com",
            address: "123 Beauty Lane, Glow City",
            phone: "+1 234 567 890",
            avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"
        }));
    } else {
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Auth endpoint ready" }));
    }
};
