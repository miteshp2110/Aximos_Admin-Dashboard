const adminSignUp = require("../controllers/auth-controller/adminSignup");
const login = require("../controllers/auth-controller/login");
const express = require('express');
const checkAdmin = require("../middlewares/checkAdmin");
const updatePassword = require("../controllers/auth-controller/adminUpdatePassword");
const router = express.Router()

router.post('/login',login)
router.post('/signup',checkAdmin,adminSignUp) // protected route
router.post('/updatePassword',checkAdmin,updatePassword) //protected route


module.exports = router