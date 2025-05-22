const { pool } = require("../../config/db");
const { formatDistanceToNow } = require("date-fns");

// Get number of orders per day
const getDailyOrderCount = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                DATE(createdAt) AS date,
                COUNT(*) AS total_orders
            FROM orders
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) ASC
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Error fetching daily order count:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get average order value
const getAverageOrderValue = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [result] = await connection.query(`
            SELECT 
                IFNULL(SUM(order_total), 0) AS total_revenue,
                COUNT(*) AS total_orders
            FROM orders
            WHERE order_status = '4' 
        `);

        const totalRevenue = result[0].total_revenue;
        const totalOrders = result[0].total_orders;
        const averageOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders;

        res.json({
            success: true,
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};


// Get total number of orders per service
const getOrdersCountByService = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                s.name AS service_name,
                COUNT(o.id) AS total_orders
            FROM orders o
            JOIN addresses a ON o.address = a.id
            JOIN regions r ON a.region_id = r.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN items i ON oi.item_id = i.id
            JOIN category c ON i.category_id = c.id
            JOIN services s ON c.service_id = s.id
            GROUP BY s.name
            ORDER BY total_orders DESC
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get order counts over the last 7 days for line chart
const getLineChartData = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                DATE(createdAt) AS date,
                COUNT(*) AS total_orders,
                SUM(order_total) AS total_revenue
            FROM orders
            WHERE createdAt >= CURDATE() - INTERVAL 6 DAY
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt)
        `);

        // Fill in missing dates (for days with zero orders)
        const chartData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().slice(0, 10);

            const found = rows.find(row => row.date.toISOString().slice(0, 10) === dateString);
            chartData.push({
                date: dateString,
                total_orders: found ? found.total_orders : 0,
                total_revenue: found ? found.total_revenue : 0,
            });
        }

        res.json({ success: true, chartData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};


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
        oi.quantity AS quantity,
        o.payment_mode AS payment_mode
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

    const ordersMap = {};

    rows.forEach(row => {
      const orderId = row.order_id;  // Use exact numeric order ID here

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          id: orderId,  // just the number, no "ORD-"
          customer: row.customer,
          service: row.service_name,
          amount: parseFloat(row.amount),
          status: row.status.toLowerCase(),
          date: row.date,
          time: row.time,
          address: row.address,
          phone: row.phone,
          driver: row.driver || null,
          paymentMode: row.payment_mode.toLowerCase(),
          items: []
        };
      }

      ordersMap[orderId].items.push({
        name: `${row.item_name} (${row.service_type})`,
        quantity: row.quantity
      });
    });

    const ordersArray = Object.values(ordersMap).reverse();

    res.json({ success: true, data: ordersArray });

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

const updateOrderStatus = async (req, res) => {
    const { id } = req.params; // order_id
    const { order_status } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();

        // 1. Update the order status in `orders` table
        await connection.query(
            "UPDATE orders SET order_status = ? WHERE id = ?",
            [order_status, id]
        );

        // 2. Fetch updated amount and status from `orders`
        const [orderRows] = await connection.query(
            "SELECT order_total AS amount, order_status FROM orders WHERE id = ?",
            [id]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // 3. Fetch items with quantity from `order_items` and names from `items`
        const [itemsRows] = await connection.query(
            `
            SELECT items.name, order_items.quantity
            FROM order_items
            JOIN items ON order_items.item_id = items.id
            WHERE order_items.order_id = ?
            `,
            [id]
        );

        // 4. Construct and return response
        res.json({
            success: true,
            message: "Order status updated successfully",
            order: {
                amount: orderRows[0].amount,
                order_status: orderRows[0].order_status,
                items: itemsRows.map(row => ({
                    name: row.name,
                    quantity: row.quantity
                }))
            }
        });

    } catch (err) {
        console.error("Error updating order status:", err);
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
    updateCashOrderStatus,
    getLineChartData,
    getOrdersCountByService,
    getAverageOrderValue,
    getDailyOrderCount
};
