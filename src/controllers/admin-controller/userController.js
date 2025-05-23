const { pool } = require("../../config/db");

// Get all users with additional fields (Total Orders, Total Spent, Status)
const getAllUsers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [users] = await connection.query(`
            SELECT 
            u.id, 
            u.fullName, 
            u.email, 
            u.phone, 
            u.createdAt, 
            COUNT(DISTINCT o.id) AS total_orders,
            IFNULL(SUM(o.order_total), 0) AS total_spent,
            CASE
                WHEN NOT EXISTS (
                    SELECT 1
                    FROM orders o2
                    WHERE o2.user_id = u.id
                    AND o2.order_status != (
                        SELECT id FROM order_status_names WHERE statusName = 'Inactive'
                    )
                ) THEN 'Inactive'
                ELSE 'Active'
            END AS status
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id;
        `); // Get total orders, total spent, and status

        res.json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    } 
};

// Get total number of users
const getTotalUsers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("SELECT COUNT(*) AS total_users FROM users");
        res.json({ success: true, total_users: result[0].total_users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    getTotalUsers
};
