const { pool } = require("../../config/db")
const { getHashedPassword } = require("../../utils/bcryptManager")
const isUserQuery = "SELECT password FROM admins WHERE email = ?"
const createQuery = "INSERT INTO admins (email,password) values (?,?)"

const adminSignUp = (async(req,res)=>{
    try{
        if(req.user){
            const {email,password} = req.body
            if(!email || !password){
                return res.status(400).json({Message:"Invalid Body"})
            }
            const [isUser] = await pool.query(isUserQuery,[email])
            if(isUser.length != 0){
                return res.status(403).json({Message:"Email Already exists"})
            }
            const [result] = await pool.query(createQuery,[email,await getHashedPassword(password)])
            if(result){
                //TODO:Send Email Notification 
                return res.status(201).json({Message:"Admin Created"})
            }
            else{
                return res.status(500).json({Message:"Error While Creating User"})
            }

        }
        else{
            return res.status(401).json({Message:"Unauthorized"})
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({Message:"Some Error Occured"})
    }
    
})


module.exports = adminSignUp