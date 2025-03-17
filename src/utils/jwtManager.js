const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/secrets')

const optionsForJwt = {
    algorithm:"HS256",
    expiresIn:"1days"
}

function getJwtToken (payload={}){
    try{
        const finalToken = jwt.sign(payload,JWT_SECRET,optionsForJwt)
        return finalToken
    }
    catch(err){
        console.log(err)
        return null
    }
}

function verifyJwtToken(token,role=''){
    try{
        const isValid = jwt.verify(token,JWT_SECRET,{algorithms:"HS256"})
        if(role){
            if(isValid.role===role){
                return {email:isValid.email}
            }
            else{
                return false
            }
        }

        return {email:isValid.email}

    }
    
    catch(err){
        // console.log(err)
        return false
    }
}


module.exports = {getJwtToken,verifyJwtToken}