const { verifyJwtToken } = require("../utils/jwtManager");

const checkAdmin = (async(req,res,next)=>{
    try{
        const {authorization} = req.headers
        if(!authorization){
            return res.status(400).json({Message:"Token Required"})
        }  
        const token = authorization.split(' ')[1]
        let verificationForAdmin = verifyJwtToken(token,"admin")
        let verificationForSuperAdmin = verifyJwtToken(token,"superAdmin")
        if(verificationForAdmin === false && verificationForSuperAdmin === false){
            return res.status(401).json({Message:"Unauthorized"})
        }
    
        req.user = verificationForAdmin.email || verificationForSuperAdmin.email
        next()

    }
    catch(err){
        console.error(err)
        return res.status(500).json({Message:"Some Error Occured"})
    }
})

const checkSuperAdmin = (async(req,res,next)=>{
    try{
        const {authorization} = req.headers
        if(!authorization){
            return res.status(400).json({Message:"Token Required"})
        }  
        const token = authorization.split(' ')[1]
        let verification = verifyJwtToken(token,"superAdmin")
        if(verification === false){
            return res.status(401).json({Message:"Unauthorized"})
        }
        req.user = verification.email
        next()

    }
    catch(err){
        console.error(err)
        return res.status(500).json({Message:"Some Error Occured"})
    }
})

module.exports={checkAdmin,checkSuperAdmin}