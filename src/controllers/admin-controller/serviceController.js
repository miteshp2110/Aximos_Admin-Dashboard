const { pool } = require("../../config/db");

// Get all services
const getAllServices = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [services] = await connection.query("SELECT id,name, description, iconUrlBig,iconUrlSmall FROM services");
        connection.release();

        res.json({ success: true, data: services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Add new service
const addService = async (req, res) => {
    const { id, name,description, iconUrlBig, iconUrlSmall } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            "INSERT INTO services (id,name, description, iconUrlBig,iconUrlSmall) VALUES (?, ?, ?, ?, ?)",
            [id, name,description, iconUrlBig, iconUrlSmall]
        );
        connection.release();

        res.json({ success: true, message: "Service added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAllServices,
    addService
};
