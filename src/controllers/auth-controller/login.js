const {pool} = require('../../config/db')
const { checkPassword } = require('../../utils/bcryptManager')
const { getJwtToken } = require('../../utils/jwtManager')

const query = 'SELECT password FROM admins WHERE email = ?'

const login = (async(req,res)=>{
    try{
        const {email,password} = req.body
        if(!email || !password){
            return res.status(400).json({Message:"Invalid Body"})
        }
         const [admins] = await pool.query(query,[email])
         
         if(admins.length == 0){
            return res.status(401).json({Message:"User Not Found"})
         }
         const hashedPassword = admins[0].password
         if(await checkPassword(password,hashedPassword)){
            const payload = {
                email:email,
                role:"admin"
            }
            return res.status(200).json({Message:"Success",token:getJwtToken(payload)})
         }
         else{
            return res.status(401).json({Message:"Wrong Password"})
         }
        
    }  
    catch(err){
        console.error(err)
        return res.status(500).json({Message:"Some error occured."})
    }
})


module.exports = login