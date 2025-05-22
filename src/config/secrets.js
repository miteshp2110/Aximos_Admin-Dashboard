const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    PORT : process.env.PORT,
    MYSQL_HOST : process.env.MYSQL_HOST,
    MYSQL_PORT : process.env.MYSQL_PORT,
    MYSQL_USER : process.env.MYSQL_USER,
    MYSQL_PASSWORD : process.env.MYSQL_PASSWORD,
    MYSQL_LIMIT : process.env.MYSQL_LIMIT,
    MYSQL_DATABASE : process.env.MYSQL_DATABASE,
    JWT_SECRET : process.env.JWT_SECRET,
    BCRYPT_SALT : process.env.BCRYPT_SALT,
    USERBACKEND_URI : process.env.USERBACKEND_URI,
    EMAIL_HOST : process.env.EMAIL_HOST,
    EMAIL_PORT : process.env.EMAIL_PORT,
    EMAIL_USER : process.env.EMAIL_USER,
    EMAIL_PASS : process.env.EMAIL_PASS,
}