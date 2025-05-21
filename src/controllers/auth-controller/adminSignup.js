const { pool } = require("../../config/db")
const { getHashedPassword } = require("../../utils/bcryptManager")
const isUserQuery = "SELECT password FROM admin WHERE email = ?"
const createQuery = "INSERT INTO admin (email,password,name) values (?,?,?)"

const adminSignUp = (async(req,res)=>{
    try{
        if(req.user){
            const {email,password,name} = req.body
            if(!email || !password || !name){
                return res.status(400).json({success:false , message:"Please provide email and password"})
            }
            const [isUser] = await pool.query(isUserQuery,[email])
            if(isUser.length != 0){
                return res.status(403).json({success:false , message:"User Already Exists"})
            }
            const [result] = await pool.query(createQuery,[email,await getHashedPassword(password),name])
            if(result){
                
                return res.status(201).json({success:true , message:"User Created Successfully"})
            }
            else{
                return res.status(500).json({success:false , message:"Internal Server Error"})
            }

        }
        else{
            return res.status(401).json({success:false , message:"Unauthorized"})
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({success:false , message:"Internal Server Error"})
    }
    
})

const getAllAdmin = (async(req,res)=>{
    try{
        if(req.user){
            const [admins] = await pool.query("SELECT id,name,email,superAdmin from admin")
            if(admins.length == 0){
                return res.status(404).json({success:false , message:"No Admins Found"})
            }
            admins.forEach((admin)=>{
                admin.role = admin.superAdmin === 1 ? "Super Admin" : "Admin"
                delete admin.superAdmin

            })
            return res.status(200).json({success:true , admins})
        }
        else{
            return res.status(401).json({success:false , message:"Unauthorized"})
        }
    }
    catch(err){
        console.error(err)
        return res.status(500).json({success:false , message:"Internal Server Error"})
    }
})

const deleteAdmin = (async(req,res)=>{
    try{
        const {id} = req.params
        if(!id){
            return res.status(400).json({success:false , message:"Please provide id"})
        }
        await pool.query("DELETE FROM admin WHERE id = ?",[id])
        return res.status(200).json({success:true , message:"Admin Deleted Successfully"})
    }
    catch(err){
        console.error(err)
        return res.status(500).json({success:false , message:"Internal Server Error"})
    }
})


module.exports = {adminSignUp,getAllAdmin,deleteAdmin}