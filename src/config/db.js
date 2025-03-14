const mysql = require('mysql2/promise')
const {MYSQL_HOST,MYSQL_PORT,MYSQL_USER,MYSQL_PASSWORD,MYSQL_LIMIT,MYSQL_DATABASE} = require('./secrets')

var pool=  mysql.createPool({
    host:MYSQL_HOST,
    port:MYSQL_PORT,
    user:MYSQL_USER,
    password:MYSQL_PASSWORD,
    database:MYSQL_DATABASE,
    connectionLimit:MYSQL_LIMIT
});

let isConnected = false

async function getPool(){
    try{

        const connection = await pool.getConnection()

        if(!isConnected){
            console.log("Connected to DB")
            isConnected = true
        }

        return connection
    }
    catch(exception){
        console.error(exception)
        process.exit(1)
    }
}


const testConnection = (async()=>{
    const connection = await getPool();
    if(connection){
        connection.release()
    }
})

module.exports = {pool,testConnection}
