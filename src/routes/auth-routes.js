const adminSignUp = require("../controllers/auth-controller/adminSignup");
const login = require("../controllers/auth-controller/login");
const express = require('express');
const checkAdmin = require("../middlewares/checkAdmin");
const router = express.Router()

router.post('/login',login)
router.post('/signup',checkAdmin,adminSignUp) // protected route


module.exports = router