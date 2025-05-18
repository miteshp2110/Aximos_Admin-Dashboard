const { pool } = require("../../config/db");
const { formatDistanceToNow } = require("date-fns");


// Update cash order status
const updateCashOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { new_status } = req.body;

    const allowedStatuses = ['orderPlaced', 'orderPickedUp', 'outForDelivery', 'Delivered'];
    if (!allowedStatuses.includes(new_status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: " + allowedStatuses.join(', ')
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Get status ID from order_status_names table
        const [statusResult] = await connection.query(
            "SELECT id FROM order_status_names WHERE statusName = ?",
            [new_status]
        );

        if (statusResult.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid status name" });
        }

        const statusId = statusResult[0].id;

        // Check if order exists and is cash
        const [orderResult] = await connection.query(
            "SELECT * FROM orders WHERE id = ? AND payment_mode = 'cash'",
            [orderId]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not a cash payment"
            });
        }

        // Update the order status
        await connection.query(
            "UPDATE orders SET order_status = ? WHERE id = ?",
            [statusId, orderId]
        );

        res.json({ success: true, message: "Order status updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};


// Get all orders for orderes page
const getAllOrdersDetailed = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // const [orders] = await connection.query("SELECT * FROM orders");
        // res.json({ success: true, data: orders });
        const [rows] = await connection.query(`
            SELECT 
              o.id AS order_id,
              u.fullName AS customer,
              s.name AS service_name,
              o.order_total AS amount,
              osn.statusName AS status,
              DATE_FORMAT(o.pickup_date, '%Y-%m-%d') AS date,
              TIME_FORMAT(o.pickup_time, '%h:%i %p') AS time,
              CONCAT(a.buildingNumber, ' ', a.area, 
                     IF(a.landmark IS NOT NULL AND a.landmark != '', CONCAT(', ', a.landmark), ''), 
                     ', ', r.name) AS address,
              u.phone AS phone,
              v.van_number AS driver,
              i.name AS item_name,
              s.name AS service_type,
              oi.quantity AS quantity
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.address = a.id
            JOIN regions r ON a.region_id = r.id
            JOIN order_status_names osn ON o.order_status = osn.id
            LEFT JOIN vans v ON o.van_id = v.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN items i ON oi.item_id = i.id
            JOIN category c ON i.category_id = c.id
            JOIN services s ON c.service_id = s.id
            ORDER BY o.id, i.name
          `);
          
          connection.release();
      
          // Process the results using JavaScript to structure the response
          const ordersMap = {};
          
          rows.forEach(row => {
            const orderId = `ORD-${row.order_id.toString().padStart(5, '0')}`;
            
            // Initialize order object if not already present
            if (!ordersMap[orderId]) {
              ordersMap[orderId] = {
                id: orderId,
                customer: row.customer,
                service: row.service_name,
                amount: parseFloat(row.amount),
                status: row.status.toLowerCase(),
                date: row.date,
                time: row.time,
                address: row.address,
                phone: row.phone,
                driver: row.driver,
                items: []
              };
            }
            
            // Add item to the order's items array
            ordersMap[orderId].items.push({
              name: `${row.item_name} (${row.service_type})`,
              quantity: row.quantity
            });
          });
          
          // Convert map to array and set null for missing drivers
          const ordersArray = Object.values(ordersMap).map(order => {
            if (!order.driver) order.driver = null;
            return order;
          });
          res.json({ success: true, data: ordersArray.reverse() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query("SELECT * FROM orders");
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { order_status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE orders SET order_status = ? WHERE id = ?", [order_status, id]);
        res.json({ success: true, message: "Order status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get today's pickups
const getTodaysPickups = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query(
            "SELECT * FROM orders WHERE DATE(pickup_date) = CURDATE()"
        );
        res.json({ success: true, todaysPickups: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get top 5 recent orders
const getRecentOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query(
            `SELECT 
                o.id AS order_id,
                o.order_total,
                o.createdAt,
                GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN items i ON oi.item_id = i.id
             JOIN category c ON i.category_id = c.id
             GROUP BY o.id
             ORDER BY o.createdAt DESC
             LIMIT 5`
        );

        const formattedOrders = orders.map(order => ({
            order_id: order.order_id,
            amount: order.order_total,
            categories: order.categories,
            timestamp: formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
        }));

        res.json({ success: true, recentOrders: formattedOrders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};


// Get total number of orders
const getTotalOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("SELECT COUNT(*) AS total FROM orders");
        res.json({ success: true, totalOrders: result[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get total revenue from completed orders
const getTotalRevenue = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            "SELECT IFNULL(SUM(order_total), 0) AS total_revenue FROM orders WHERE order_status = '4'"
        );
        res.json({ success: true, totalRevenue: result[0].total_revenue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};



module.exports = {
    getAllOrders,
    updateOrderStatus,
    getTotalOrders,
    getTotalRevenue,
    getRecentOrders,
    getTodaysPickups,
    getAllOrdersDetailed,
    updateCashOrderStatus
};
