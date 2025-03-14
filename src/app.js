const express = require('express')

const app = express()


//Middlewares
app.use(express.json())


//Routes
app.use("/test",(req,res)=>{return res.send("Working")})



module.exports = app