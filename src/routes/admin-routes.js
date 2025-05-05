// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");

// Import controllers
const { getAllUsers, updateUserStatus ,getTotalUsers} = require("../controllers/admin-controller/userController");
const { getAllServices, addService } = require("../controllers/admin-controller/serviceController");
const { getAllOrders, updateOrderStatus, getTotalOrders, getTotalRevenue,getRecentOrders, getTodaysPickups, getAllOrdersDetailed } = require("../controllers/admin-controller/orderController");
const { addDriver, getAllDrivers, updateDriverStatus ,getActiveDrivers, getInactiveDrivers, updateDriver} = require("../controllers/admin-controller/driverController");
const {getStats} = require("../controllers/admin-controller/dashboardController");
const { getActivePromotions, getInactivePromotions, addPromotion ,updatePromotion, deletePromotion, getAllPromotionsWithUsage, getAllPromotions, updatePromotionStatus} = require("../controllers/admin-controller/promotionController");  
const { getAllRegions, addRegion, updateRegion, deleteRegion } = require("../controllers/admin-controller/regionController");
const { handleFileUpload } = require("../middlewares/uploads");
const { ro } = require("date-fns/locale");

// User Routes 
router.get("/users",getAllUsers);  //working
router.get('/total-users',checkAdmin, getTotalUsers);  //working
// router.put("/users/:id", updateUserStatus);  //currently not used in the frontend


// Service Routes
router.get("/services",checkAdmin, getAllServices); //working
router.post("/services", checkAdmin, addService); //working

// Order Routes
router.get("/orders",getAllOrders); //working
router.get("/orders/detail",getAllOrdersDetailed); //working
router.put("/orders/:id", checkAdmin, updateOrderStatus); //working
router.get('/total-orders',getTotalOrders);    //working
router.get('/orders-total-revenue',getTotalRevenue);    //working
router.get('/orders-recent', getRecentOrders);  //working
router.get('/orders/today-pickups',checkAdmin, getTodaysPickups);   //working
// router.get('/orders-formatted', getFormattedOrders); //working
 
// Driver Routes 
router.post("/addDriver",  addDriver); //working
router.get("/drivers",getAllDrivers);  //working
router.put("/drivers/:id", updateDriverStatus); //working
router.put("/updateDriver/:id", updateDriver); //working
router.get('/active-drivers', getActiveDrivers);    //working
router.get('/drivers/inactive', checkAdmin, getInactiveDrivers);    //working

 

// Promotions Routes
router.get('/promotions/active',checkAdmin, getActivePromotions);  //working
// router.get('/promotions', getAllPromotions);  //working
router.get('/promotions/inactive', checkAdmin, getInactivePromotions);  //working
router.post('/promotions', handleFileUpload,addPromotion);  //working
router.put('/promotions/:id', handleFileUpload, updatePromotion);  //working
router.put('/promotionStatus/:id', updatePromotionStatus);  //working
router.delete('/promotions/:id', deletePromotion);  //working
router.get('/promotions/usage', getAllPromotionsWithUsage);  //working
// router.get('/promotions-summary', getPromotionSummary);  //working

 
// Dashboard Stats Route
router.get("/stats", checkAdmin, getStats);  //working

// Region Routes
router.get("/regions", getAllRegions); //working
router.post("/regions", addRegion); //working
router.put("/regions/:id", updateRegion); //working
router.delete("/regions/:id", deleteRegion); //working

 

module.exports = router;
