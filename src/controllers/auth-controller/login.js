const {pool} = require('../../config/db')
const { checkPassword } = require('../../utils/bcryptManager')
const { getJwtToken } = require('../../utils/jwtManager')



const login = (async(req,res)=>{
    try{
        const {email,password} = req.body
        if(!email || !password){
            return res.status(400).json({success:false , message:"Please provide email and password"})
        }
         const [admins] = await pool.query("Select * from admin where email = ?",[email])
         
         if(admins.length == 0){
            return res.status(401).json({success:false , message:"User not found"})
         }
         const hashedPassword = admins[0].password
         if(await checkPassword(password,hashedPassword)){
            const payload = {
                email:email,
                role:admins[0].superAdmin===1? "superAdmin" : "admin",
            }
            return res.status(200).json({success:true,token:getJwtToken(payload),role:admins[0].superAdmin===1? "superAdmin" : "admin"})
         }
         else{
            return res.status(401).json({success:false , message:"Wrong Password"})
         }
        
    }  
    catch(err){
        console.error(err)
        return res.status(500).json({success:false , message:"Internal Server Error"})
    }
})


module.exports = login