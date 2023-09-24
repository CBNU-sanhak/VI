const express = require("express");
const router = express.Router();
const pool = require("../mysql/index.js");
const crypto = require('../crypto/crypto.js');

router.get("/", (req, res) => {
    pool.query("select * from customer", function(err, result) {
        if(err){
        console.log(err);
        res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.get("/:id", (req, res) => {
    pool.query("select * from customer where id = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.get("/study_group/:id", (req, res) => {
    pool.query("select s_name from study_group as a inner join customer as b on a.id = b.study_group where b.id = ?", req.params.id, function(err, result) {
        if(err){
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send(result[0].s_name);
        }
    })
})
.post("/insert", (req, res) => {
    req.body.pwd = crypto(req.body.pwd);
    pool.query("insert into customer set ?", req.body, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send({data: "ok"})
        }
    })
})
.patch("/update/:id", (req, res) => {
    if(req.body.pwd){
        req.body.pwd = crypto(req.body.pwd);
    }
    pool.query("update customer set ? where id = ?", [req.body, req.params.id], function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send({data: "ok"});
        }
    })
})
.delete("/delete/:id", (req, res) => {
    pool.query("delete from customer where id = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send({data: "ok"});
        }
    })
})
.post("/free", (req, res) => {
    pool.query(req.body.sql, req.body.data, function(err, result) {
        if(err) {
                console.log(err);
                res.send({data: "err"});
        } else{
                res.send(result);
        }
    })
})

module.exports = router;