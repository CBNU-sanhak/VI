//로컬에서 시험하기 위함

// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: '1234'
// });

// module.exports = pool.promise();

const mysql = require('mysql2');
const path = require('path');

require("dotenv").config({path : path.join(__dirname, '../env/.env')});

const pool = mysql.createPool({
    connectionLimit: process.env.MYSQL_LIMIT,
    host  : process.env.MYSQL_HOST,
    port : process.env.MYSQL_PORT,
    user : process.env.MYSQL_USERNAME,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DB,
    dateStrings: "date",
});

module.exports = pool.promise();