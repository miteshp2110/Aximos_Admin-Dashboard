const { pool } = require("../../config/db");

// Get all vans (drivers)
const getAllDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [vans] = await connection.query("SELECT * FROM vans");
        res.json({ success: true, data: vans });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update van status
const updateDriverStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE vans SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true, message: "Van status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get active vans (status = 1)
const getActiveDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [activeVans] = await connection.query("SELECT * FROM vans WHERE status = 1");
        res.json({ success: true, data: activeVans });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get inactive vans (status != 1)
const getInactiveDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [inactiveVans] = await connection.query("SELECT * FROM vans WHERE status != 1");
        res.json({ success: true, data: inactiveVans });
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
