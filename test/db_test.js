const pool = require('../src/mysql/index.js');
const express = require("express");
const router = require("./router.js")

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/t", router);

app.get("/test", (req, res) => {
    pool.query("select * from test", function(err, result) {
        if(err){
            console.log(err);
        } else{
            res.send(result);
        }
    });
})

app.get("/test/:id", (req, res) => {
    pool.query("select * from test where id = ?", req.params.id, function(err, result){
        if(err){
            console.log(err);
        } else{
            res.send(result);
        }
    })    
})

app.post('/test/insert', (req, res) => {
    console.log(req.body);
    pool.query("insert into test set ?", req.body, function(err, result) {
        if(err){
            console.log(err);
        } else{
            console.log(result);
            res.send(result);
        }
    });
})

app.patch('/test/update/:id', (req, res) => {
    console.log(req.body);
    pool.query('update test set ? where id = ?', [req.body,req.params.id], function (err, result) {
        if(err){
            console.log(err);
        } else{
            res.send(result);
        }
    });
})

app.delete("/test/delete/:id", (req, res) => {
    pool.query(`delete from test where id = ?`, req.params.id,(err, result) =>  {
        if(err){
            console.log(err);
             }
        else{
            res.send(result);
        }
    })
})

app.listen(3000, () => {
    console.log("Server started. port 3000.");
});

