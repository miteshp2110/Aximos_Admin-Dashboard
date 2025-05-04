const { pool } = require("../../config/db");

const addDriver = async (req, res) => {
    const { region_id, van_number, phone, status } = req.body;

    if (!region_id || !van_number || !phone || status === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const createdAt = new Date(); // or use CURRENT_TIMESTAMP in SQL
        await connection.query(
            "INSERT INTO vans (region_id, van_number, phone, status, createdAt) VALUES (?, ?, ?, ?, ?)",
            [region_id, van_number, phone, status==="active"?1:0, createdAt]
        );
        res.json({ success: true, message: "Driver added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get all vans (drivers)
const getAllDrivers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [vans] = await connection.query("SELECT vans.id as id , vans.van_number as regNo , vans.region_id as regionId , regions.name as regionName , vans.phone as phone , vans.status as status FROM vans join regions where vans.region_id = regions.id");

        vans.forEach(van => {
            van.status = van.status === 1 ? "active" : "inactive"; 
        })
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

// Update van status
const updateDriver = async (req, res) => {
    const { id } = req.params;
    const { status, phone , regNo , regionId } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE vans SET status = ? , region_id = ? , van_number = ? , phone = ?  WHERE id = ?", [status,regionId,regNo,phone, id]);
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
    getInactiveDrivers,
    addDriver,
    updateDriver
};
