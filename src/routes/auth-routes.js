const {adminSignUp, getAllAdmin, deleteAdmin} = require("../controllers/auth-controller/adminSignup");
const login = require("../controllers/auth-controller/login");
const express = require('express');
const {checkAdmin,checkSuperAdmin} = require("../middlewares/checkAdmin");
const updatePassword = require("../controllers/auth-controller/adminUpdatePassword");

const checkOtp = require("../controllers/auth-controller/checkOtp");
const { forgotPassword } = require("../utils/emailTransporter");
const router = express.Router()

router.post('/login',login)
router.post('/forgotPasswordOtp',forgotPassword)
router.post('/checkOtp',checkOtp)
router.get("/admin",checkSuperAdmin,getAllAdmin)
router.post('/signup',checkSuperAdmin,adminSignUp) // protected route
router.post('/updatePassword',checkAdmin,updatePassword) //protected route
router.delete("/deleteAdmin/:id",checkSuperAdmin,deleteAdmin) // protected route


module.exports = router