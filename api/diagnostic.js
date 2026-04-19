module.exports = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
        status: "ok", 
        message: "Diagnostic probe successful!",
        time: new Date().toISOString(),
        env: {
            NODE_VERSION: process.version,
            PLATFORM: process.platform,
            VERCEL: process.env.VERCEL,
            REGION: process.env.VERCEL_REGION
        }
    }));
};
