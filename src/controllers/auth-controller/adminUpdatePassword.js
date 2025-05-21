const { pool } = require("../../config/db");
const { getHashedPassword, checkPassword } = require("../../utils/bcryptManager");

const checkQuery = "SELECT password FROM admin where email = ?"
const updateQuery = "UPDATE admin set password = ? where email = ?"

const updatePassword = (async(req,res)=>{
    
    if(req.user){
        const email = req.user
    
        const {oldPassword,newPassword} = req.body
        if(!newPassword || !oldPassword){
            return res.status(400).json({success:false , message:"Please provide old and new password"})
        }
        const [isUser] = await pool.query(checkQuery,[email])
        if(isUser.length == 0){
            return res.status(401).json({success:false , message:"User not found"})
        }
        const hashedPassword = isUser[0].password
        if(await checkPassword(oldPassword,hashedPassword)){
            const [result] = await pool.query(updateQuery,[await getHashedPassword(newPassword),email])
            return res.status(200).json({success:true , message:"Password Updated Successfully"})
        }
        else{
            return res.status(401).json({success:false , message:"Wrong Password"})
        }

    }
    else{
        return res.status(401).json({success:false , message:"Unauthorized"})
    }
})

module.exports = updatePassword