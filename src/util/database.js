//로컬에서 시험하기 위함

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: '1234'
});

module.exports = pool.promise();