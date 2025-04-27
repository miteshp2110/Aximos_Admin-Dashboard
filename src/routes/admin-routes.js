// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");

// Import controllers
const { getAllUsers, updateUserStatus ,getTotalUsers} = require("../controllers/admin-controller/userController");
const { getAllServices, addService } = require("../controllers/admin-controller/serviceController");
const { getAllOrders, updateOrderStatus, getTotalOrders, getTotalRevenue,getRecentOrders, getTodaysPickups } = require("../controllers/admin-controller/orderController");
const { getAllDrivers, updateDriverStatus ,getActiveDrivers, getInactiveDrivers} = require("../controllers/admin-controller/driverController");
const {getStats} = require("../controllers/admin-controller/dashboardController");

// User Routes
router.get("/users", checkAdmin, getAllUsers);
router.put("/users/:id", checkAdmin, updateUserStatus);
router.get('/users/total',checkAdmin, getTotalUsers);

// Service Routes
router.get("/services",checkAdmin, getAllServices);
router.post("/services", checkAdmin, addService);

// Order Routes
router.get("/orders", checkAdmin, getAllOrders);
router.put("/orders/:id", checkAdmin, updateOrderStatus); 
router.get('/orders/total', checkAdmin, getTotalOrders);
router.get('/orders/total-revenue', checkAdmin,getTotalRevenue);
router.get('/orders/recent', checkAdmin, getRecentOrders);
router.get('/orders/today-pickups', getTodaysPickups);

// Driver Routes 
router.get("/drivers", checkAdmin,getAllDrivers);
router.put("/drivers/:id", checkAdmin, updateDriverStatus);
router.get('/drivers/active', getActiveDrivers);
router.get('/drivers/inactive', getInactiveDrivers);

// Dashboard Stats Route
router.get("/stats", checkAdmin, getStats);

module.exports = router;
