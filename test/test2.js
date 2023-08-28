const pool = require("../src/mysql/index.js");


const data = {
    ident : "test",
    pwd : "test",
    nickname : "test",
    email : "test"
}

pool.query("insert into customer set ? ", data, function(err, results) {
    console.log(err);
    console.log(results);
})