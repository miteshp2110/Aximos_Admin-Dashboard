const { pool } = require("../../config/db");

// Add new promotion
const addPromotion = async (req, res) => {
    const {
        title,
        description,
        discount_percentage,
        fixed_discount,
        threshHold,
        coupon_code,
        valid_from,
        valid_to,
        promotionImageUrl,
        is_active
    } = req.body;

    if (!title || !description || (!discount_percentage && !fixed_discount) || !coupon_code || !valid_from || !valid_to) {
        return res.status(400).json({ success: false, message: "Missing required promotion fields" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO promotions 
                (title, description, discount_percentage, fixed_discount, threshHold, coupon_code, valid_from, valid_to, promotionImageUrl, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description,
                discount_percentage || null,
                fixed_discount || null,
                threshHold || null,
                coupon_code,
                valid_from,
                valid_to,
                promotionImageUrl || null,
                is_active !== undefined ? is_active : 1
            ]
        );
        res.status(201).json({ success: true, message: "Promotion added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

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

// Update existing promotion
const updatePromotion = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        discount_percentage,
        fixed_discount,
        threshHold,
        coupon_code,
        valid_from,
        valid_to,
        promotionImageUrl,
        is_active
    } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "Promotion ID is required" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            `UPDATE promotions 
             SET 
                title = ?, 
                description = ?, 
                discount_percentage = ?, 
                fixed_discount = ?, 
                threshHold = ?, 
                coupon_code = ?, 
                valid_from = ?, 
                valid_to = ?, 
                promotionImageUrl = ?, 
                is_active = ?
             WHERE id = ?`,
            [
                title,
                description,
                discount_percentage || null,
                fixed_discount || null,
                threshHold || null,
                coupon_code,
                valid_from,
                valid_to,
                promotionImageUrl || null,
                is_active !== undefined ? is_active : 1,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        res.json({ success: true, message: "Promotion updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Delete a promotion by ID
const deletePromotion = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Promotion ID is required" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("DELETE FROM promotions WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        res.json({ success: true, message: "Promotion deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};
// Get all promotions with coupon usage count
const getAllPromotionsWithUsage = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [promotions] = await connection.query(`
            SELECT 
                p.id, 
                p.title, 
                p.discount_percentage,
                p.coupon_code,
                p.valid_from,
                p.valid_to,
                COUNT(o.id) AS \`usage\`
            FROM 
                promotions p 
            LEFT JOIN 
                orders o 
            ON 
                p.id = o.promotion_id AND o.order_status = 1
            GROUP BY 
                p.id, p.title, p.discount_percentage, p.coupon_code, p.valid_from, p.valid_to
            ORDER BY 
                p.created_at DESC
        `);
        res.json({ success: true, data: promotions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// {
//     id: 1,
//     name: "Welcome Discount",
//     description: "20% off your first order",
//     minOrderValue: 0,
//     code: "WELCOME20",
//     startDate: "2023-04-01",
//     endDate: "2023-06-30",
//     image: "/placeholder.svg?height=660&width=350",
//     isActive: true,
//     type: "percentage",
//     value: 20,
//   },
// Get all active promotions (is_active = 1)
const getAllPromotions = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [promotions] = await connection.query(
            `SELECT id, title as name, description, discount_percentage, fixed_discount, threshHold as minOrderValue, coupon_code as code, valid_from as startDate, valid_to as endDate, promotionImageUrl as image, is_active as isActive FROM promotions`
        );

        promotions.forEach(promotion => {
            promotion.isActive = promotion.isActive === 1 ? true : false;
            promotion.startDate = new Date(promotion.startDate).toISOString().split("T")[0];
            promotion.endDate = new Date(promotion.endDate).toISOString().split("T")[0];
            promotion.minOrderValue = parseInt(promotion.minOrderValue || 0);
            promotion.type = promotion.discount_percentage ? "percentage" : "fixed";
            promotion.value = parseInt(promotion.discount_percentage || promotion.fixed_discount)
            delete promotion.discount_percentage;
            delete promotion.fixed_discount;
        })
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
    getInactivePromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getAllPromotionsWithUsage,
    getAllPromotions
};
