// controllers/regionController.js
const { pool } = require("../../config/db");

// Get total vans per region
const getVanCountByRegion = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT 
                r.name AS region_name,
                COUNT(v.id) AS van_count
            FROM regions r
            LEFT JOIN vans v ON r.id = v.region_id
            GROUP BY r.name
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Error fetching van count by region:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};


// Get revenue grouped by region
const getRevenueByRegion = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                r.name AS region,
                SUM(oi.quantity * i.price) AS total_revenue
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN items i ON oi.item_id = i.id
            JOIN users u ON o.user_id = u.id
            JOIN regions r ON u.id = r.id
            WHERE o.payment_status = 'PAID'
            GROUP BY r.name
        `);

        const totalRevenue = rows.reduce((sum, row) => sum + (parseFloat(row.total_revenue) || 0), 0);

        const data = rows.map(row => {
            const revenue = parseFloat(row.total_revenue) || 0;
            return {
                region: row.region,
                revenue: parseFloat(revenue.toFixed(2)),
                percentage: parseFloat(((revenue / totalRevenue) * 100).toFixed(1))
            };
        });

        res.json({ success: true, data });
    } catch (err) {
        console.error("Error fetching revenue by region:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};



//  Delete region by ID
const deleteRegion = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Region ID is required" });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [isRegionBinded] = await connection.query("select count(id) as total from vans where region_id = ?", [id]);

        if(isRegionBinded[0].total > 0) {
            return res.status(400).json({ success: false, message: "Region is bound to a driver."});
        }
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
        const [regions] = await connection.query("SELECT id,name,description,latitude,longitude,thresholdDistance as threshold FROM regions");
        regions.forEach(region => {
            region.latitude = parseFloat(region.latitude);
            region.longitude = parseFloat(region.longitude);
        })
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
            [name, description || null, latitude.toString(), longitude.toString(), thresholdDistance]
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
            [name, description || null, latitude.toString(), longitude.toString(), thresholdDistance, id]
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
    deleteRegion,
    getRevenueByRegion,
    getVanCountByRegion  
};
