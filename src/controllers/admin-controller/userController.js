// controllers/userController.js
const { pool } = require("../../config/db");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query("SELECT * FROM users");
        connection.release();

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
        connection.release();

        res.json({ message: "User status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus
};
