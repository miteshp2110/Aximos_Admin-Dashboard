const { pool } = require("../../config/db");

// Get all active promotions (is_active = 1)
const getActivePromotions = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [promotions] = await connection.query(
            `SELECT id, title, description, discount_percentage, fixed_discount, threshHold, coupon_code, valid_from, valid_to, promotionImageUrl, is_active, created_at
             FROM promotions 
             WHERE is_active = 1`
        );
        res.json({ success: true, data: promotions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get all inactive promotions (is_active = 0)
const getInactivePromotions = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [promotions] = await connection.query(
            `SELECT id, title, description, discount_percentage, fixed_discount, threshHold, coupon_code, valid_from, valid_to, promotionImageUrl, is_active, created_at
             FROM promotions 
             WHERE is_active = 0`
        );
        res.json({ success: true, data: promotions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getActivePromotions,
    getInactivePromotions
};
