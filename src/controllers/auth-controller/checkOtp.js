const { pool } = require("../../config/db");
const { getHashedPassword } = require("../../utils/bcryptManager");

const getOtpQuery = "SELECT otp FROM email_otp WHERE email = ?"
const updateQuery = "UPDATE admin set password = ? where email = ?"

const checkOtp = (async(req,res)=>{
    try{
        const {email,otp,newPassword} = req.body
        if(!email || !otp || !newPassword){
            return res.status(400).json({success:false,message:"Please provide all the fields"})
        }
        const [result] = await pool.query(getOtpQuery,[email])

        if(result.length === 0){
            return res.status(400).json({success:false,message:"OTP not found"})
        }
        
        if(result[0].otp === otp){
            await pool.query(updateQuery,[await getHashedPassword(newPassword),email])
            await pool.query("DELETE FROM email_otp WHERE email = ?",[email])
            return res.status(200).json({success:true,message:"Password updated successfully"})
        }
        else{
            return res.status(401).json({success:false,message:"Invalid OTP"})
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({success:false,message:"Internal server error"})
    }
})

module.exports = checkOtp