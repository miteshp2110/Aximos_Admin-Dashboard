const express = require('express')
const { testConnection } = require('./config/db')

const app = express()

//Preloaders
testConnection()


//Middlewares
app.use(express.json())


//Routes
app.use("/test",(req,res)=>{return res.send("Working")})



module.exports = app