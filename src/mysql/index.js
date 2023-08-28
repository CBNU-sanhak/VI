const mysql = require('mysql');
const path = require('path');

require("dotenv").config({path : path.join(__dirname, '../env/.env')});

const pool = mysql.createPool({
    connectionLimit: process.env.MYSQL_LIMIT,
    host  : process.env.MYSQL_HOST,
    port : process.env.MYSQL_PORT,
    user : process.env.MYSQL_USERNAME,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DB,
});


module.exports = pool;