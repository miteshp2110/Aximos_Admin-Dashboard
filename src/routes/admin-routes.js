// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");

// Import controllers
const { getAllUsers, updateUserStatus } = require("../controllers/admin-controller/userController");
const { getAllServices, addService } = require("../controllers/admin-controller/serviceController");
const { getAllOrders, updateOrderStatus } = require("../controllers/admin-controller/orderController");
const { getAllDrivers, updateDriverStatus } = require("../controllers/admin-controller/driverController");
const {getStats} = require("../controllers/admin-controller/dashboardController");

// User Routes
router.get("/users", checkAdmin, getAllUsers);
router.put("/users/:id", checkAdmin, updateUserStatus);

// Service Routes
router.get("/services", checkAdmin, getAllServices);
router.post("/services", checkAdmin, addService);

// Order Routes
router.get("/orders", checkAdmin, getAllOrders);
router.put("/orders/:id", checkAdmin, updateOrderStatus); 

// Driver Routes 
router.get("/drivers", checkAdmin, getAllDrivers);
router.put("/drivers/:id", checkAdmin, updateDriverStatus);

// Dashboard Stats Route
router.get("/stats", checkAdmin, getStats);

module.exports = router;
