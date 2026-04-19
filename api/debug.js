module.exports = (req, res) => {
    res.json({
        message: "Debug endpoint reached! Infrastructure is working.",
        timestamp: new Date().toISOString(),
        env: {
            VERCEL: process.env.VERCEL,
            NODE_VERSION: process.version
        }
    });
};
