const { pool } = require("../../config/db");
const { getHashedPassword, checkPassword } = require("../../utils/bcryptManager");

const checkQuery = "SELECT password FROM admins where email = ?"
const updateQuery = "UPDATE admins set password = ? where email = ?"

const updatePassword = (async(req,res)=>{
    if(req.user){
        const email = req.user
        const {oldPassword,newPassword} = req.body
        if(!newPassword || !oldPassword){
            return res.status(400).json({Message:"Invalid Body"})
        }
        const [isUser] = await pool.query(checkQuery,[email])
        if(isUser.length == 0){
            return res.status(401).json({Message:"No Such User Found"})
        }
        const hashedPassword = isUser[0].password
        if(await checkPassword(oldPassword,hashedPassword)){
            const [result] = await pool.query(updateQuery,[await getHashedPassword(newPassword),email])
            return res.status(200).json({Message:"Updated Password"})
        }
        else{
            return res.status(401).json({Message:"Wrong Password"})
        }

    }
    else{
        return res.status(401).json({Message:"Unauthorized"})
    }
})

module.exports = updatePassword