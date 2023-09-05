const express = require("express");
const router = express.Router();
const pool = require("../mysql/index.js");

router.get("/", (req, res) => {
    pool.query("select * from question_list", function(err, result) {
        if(err){
        console.log(err);
        res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.get("/:id", (req, res) => {
    pool.query("select * from question_list where id = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.post("/insert", (req, res) => {
    pool.query("insert into question_list set ?", req.body, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send({data: "ok"})
        }
    })
})
.patch("/update/:id", (req, res) => {
    pool.query("update question_list set ? where id = ?", [req.body, req.params.id], function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send({data: "ok"});
        }
    })
})
.delete("/delete/:id", (req, res) => {
    pool.query("delete from question_list where id = ?", req.params.id, function(err, result) {
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