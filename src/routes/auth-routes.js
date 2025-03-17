const login = require("../controllers/auth-controller/login");
const express = require('express')
const router = express.Router()

router.post('/login',login)


module.exports = router