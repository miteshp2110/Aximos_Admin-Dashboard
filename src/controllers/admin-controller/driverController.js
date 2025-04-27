// controllers/driverController.js
const { pool } = require("../../config/db");

// Get all drivers
const getAllDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [drivers] = await connection.query("SELECT * FROM drivers");
        res.json({ success: true, data: drivers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update driver status
const updateDriverStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE vans SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true, message: "Driver status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get active drivers (status = 1)
const getActiveDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [activeDrivers] = await connection.query("SELECT * FROM vans WHERE status = 1");
        res.json({ success: true, data: activeDrivers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get inactive drivers (status != 1)
const getInactiveDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [inactiveDrivers] = await connection.query("SELECT * FROM drivers WHERE status != 1");
        res.json({ success: true, data: inactiveDrivers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllDrivers,
    updateDriverStatus,
    getActiveDrivers,
    getInactiveDrivers
};
