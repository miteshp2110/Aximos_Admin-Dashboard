// controllers/serviceController.js
const { pool } = require("../../config/db");

// Get all services
const getAllServices = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [services] = await connection.query("SELECT * FROM services");
        connection.release();

        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Add new service
const addService = async (req, res) => {
    const { name, description, price, is_available } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query("INSERT INTO services (name, description, price, is_available) VALUES (?, ?, ?, ?)",
            [name, description, price, is_available]);
        connection.release();

        res.json({ message: "Service added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllServices,
    addService
};
