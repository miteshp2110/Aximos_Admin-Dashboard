const { pool } = require("../../config/db");
const getOtp = require("../../utils/otpManager");


const checkQuery = "SELECT id FROM admins WHERE email = ?"
const createOtpQuery = "INSERT INTO otp (email,code) values (?,?)"
const forgotPassword = (async(req,res)=>{
    try{
        const {email} = req.body
        if(!email){
            return res.status(400).json({Message:"Invalid Body"})
        }
        const [isUser] = await pool.query(checkQuery,[email])
        if(isUser.length == 0){
            return res.status(403).json({Message:"User does not exists"})
        }
        const [result] = await pool.query(createOtpQuery,[email,getOtp()])

        //TODO:Add email notification
        return res.status(201).json({Message:`OTP sent to ${email} valid for 1 minute`})
    }
    catch(err){
        if(err.code ==='ER_DUP_ENTRY'){
            return res.status(429).json({Message:"Try again after 1 minute"})
        }
        console.error(err)
        return res.status(500).json({Message:"Some Error Occured"})
    }
})

module.exports=forgotPassword