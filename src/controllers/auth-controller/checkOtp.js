const { pool } = require("../../config/db");
const { getHashedPassword } = require("../../utils/bcryptManager");

const getOtpQuery = "SELECT code FROM otp WHERE email = ?"
const updateQuery = "UPDATE admins set password = ? where email = ?"

const checkOtp = (async(req,res)=>{
    try{
        const {email,otp,newPassword} = req.body
        if(!email || !otp || !newPassword){
            return res.status(400).json({Message:"Invalid Body"})
        }
        const [result] = await pool.query(getOtpQuery,[email])

        if(result.length === 0){
            return res.status(400).json({Message:"User Not found"})
        }
        
        if(result[0].code === otp){
            await pool.query(updateQuery,[await getHashedPassword(newPassword),email])
            return res.status(200).json({Message:"Password Updated"})
        }
        else{
            return res.status(401).json({Message:"Wrong OTP"})
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({Message:"Server Error."})
    }
})

module.exports = checkOtp