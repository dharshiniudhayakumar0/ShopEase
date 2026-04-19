module.exports = (req, res) => {
    res.status(200).json({ status: "ok", message: "Native health check passed" });
};
