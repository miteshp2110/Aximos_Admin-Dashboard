// controllers/driverController.js
const { pool } = require("../../config/db");

// Get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [drivers] = await connection.query("SELECT * FROM drivers");
        connection.release();

        res.json(drivers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update driver status
const updateDriverStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query("UPDATE drivers SET status = ? WHERE id = ?", [status, id]);
        connection.release();

        res.json({ message: "Driver status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllDrivers,
    updateDriverStatus
};
