const express = require('express')
const { testConnection } = require('./config/db')
const jsonBodyValidator = require('./middlewares/jsonBodyValidator')


const app = express()

//Preloaders
testConnection()


//Middlewares
app.use(express.json())
app.use(jsonBodyValidator)

//Routes
app.use("/test",(req,res)=>{return res.send("Working")})
app.use("/auth",require('./routes/auth-routes')) //auth routes

app.use("/admin", require('./routes/admin-routes'));  //admin routes

module.exports = app 