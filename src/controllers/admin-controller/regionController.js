// controllers/regionController.js
const { pool } = require("../../config/db");

//  Delete region by ID
const deleteRegion = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Region ID is required" });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [result] = await connection.query("DELETE FROM regions WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Region not found" });
        }

        res.json({ success: true, message: "Region deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

//  Get all regions
const getAllRegions = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [regions] = await connection.query("SELECT * FROM regions");
        res.json({ success: true, data: regions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

//  Add a new region
const addRegion = async (req, res) => {
    const { name, description, latitude, longitude, thresholdDistance } = req.body;

    if (!name || latitude == null || longitude == null || thresholdDistance == null) {
        return res.status(400).json({
            success: false,
            message: "Required fields: name, latitude, longitude, thresholdDistance"
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO regions (name, description, latitude, longitude, thresholdDistance) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, description || null, latitude, longitude, thresholdDistance]
        );
        res.json({ success: true, message: "Region added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

//  Update region details
const updateRegion = async (req, res) => {
    const { id } = req.params;
    const { name, description, latitude, longitude, thresholdDistance } = req.body;

    if (!name || latitude == null || longitude == null || thresholdDistance == null) {
        return res.status(400).json({
            success: false,
            message: "Required fields: name, latitude, longitude, thresholdDistance"
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            `UPDATE regions SET name = ?, description = ?, latitude = ?, longitude = ?, thresholdDistance = ?
             WHERE id = ?`,
            [name, description || null, latitude, longitude, thresholdDistance, id]
        );
        res.json({ success: true, message: "Region updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllRegions,
    addRegion,
    updateRegion,
    deleteRegion
};
