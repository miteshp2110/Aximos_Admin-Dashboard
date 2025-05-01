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
const { getActivePromotions, getInactivePromotions } = require("../controllers/admin-controller/promotionController");  

// User Routes
router.get("/users", checkAdmin,getAllUsers);  //working
router.get('/users/total', checkAdmin, getTotalUsers);  //working
// router.put("/users/:id", updateUserStatus);  //currently not used in the frontend


// Service Routes
router.get("/services",checkAdmin, getAllServices); //working
router.post("/services", checkAdmin, addService); //working

// Order Routes
router.get("/orders", checkAdmin, getAllOrders); //working
router.put("/orders/:id", checkAdmin, updateOrderStatus); //working
router.get('/orders/total', checkAdmin, getTotalOrders);    //working
router.get('/orders/total-revenue', checkAdmin,getTotalRevenue);    //working
router.get('/orders/recent', checkAdmin, getRecentOrders);  //working
router.get('/orders/today-pickups',checkAdmin, getTodaysPickups);   //working



// Driver Routes 
router.get("/drivers", checkAdmin,getAllDrivers);  //working
router.put("/drivers/:id", checkAdmin, updateDriverStatus); //working
router.get('/drivers/active', checkAdmin, getActiveDrivers);    //working
router.get('/drivers/inactive', checkAdmin, getInactiveDrivers);    //working



// Promotions Routes
router.get('/promotions/active',checkAdmin, getActivePromotions);  //working
router.get('/promotions/inactive', checkAdmin, getInactivePromotions);  //working

// Dashboard Stats Route
router.get("/stats", checkAdmin, getStats);  //working

module.exports = router;
