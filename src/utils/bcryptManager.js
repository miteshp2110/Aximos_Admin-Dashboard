const bcrypt = require("bcrypt")
const { BCRYPT_SALT } = require("../config/secrets")


async function getHashedPassword(rawPassword) {
    try{
        const hashedPassword = await bcrypt.hash(rawPassword,parseInt(BCRYPT_SALT))
        return hashedPassword
    }
    catch(err){
        console.log(err)
        return null
    }
}

async function checkPassword(rawPassword,hashedPassword) {
    try{
        const isSame = await bcrypt.compare(rawPassword,hashedPassword)
        return isSame
    }
    catch(err){
        console.log(err)
    }
}


module.exports = {getHashedPassword,checkPassword}
