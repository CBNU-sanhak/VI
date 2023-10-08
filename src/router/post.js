const express = require("express");
const router = express.Router();
const pool = require("../mysql/index.js");

router.get("/", (req, res) => {
    pool.query("select a.*, b.nickname from post as a join customer as b on a.writer = b.id", function(err, result) {
        if(err){
        console.log(err);
        res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.get("/a", (req, res) => {
    pool.query("select * from post where category = 'a'", function(err, result) {
        if(err){
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send(result);
        }
    })
})
.get("/b", (req, res) => {
    pool.query("select * from post where category = 'b'", function(err, result) {
        if(err){
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send(result);
        }
    })
})
.get("/c", (req, res) => {
    pool.query("select * from post where category = 'c'", function(err, result) {
        if(err){
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send(result);
        }
    })
})
//post id로 해당 post 내용 조회
.get("/:id", (req, res) => {
    pool.query("select a.*, b.nickname from post as a join customer as b on a.writer = b.id where a.id = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send(result);
        }
    })
})
.get("/recommend/:id", (req, res) => {
    pool.query("update post set recommend = recommend + 1 where id = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send({data: "ok"});
        }
    })
})
//고객 id를 활용해서 해당 고객이 만든 post 반환
.get("/get_post/:id", (req, res) => {
    pool.query("select a.*, b.nickname from post as a join customer as b on a.writer = b.id where a.writer = ?", req.params.id, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send(result);
        }
    })
})
.post("/insert", (req, res) => {
    pool.query("insert into post set ?", req.body, function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"})
        } else{
            res.send({data: "ok"})
        }
    })
})
.patch("/update/:id", (req, res) => {
    pool.query("update post set ? where id = ?", [req.body, req.params.id], function(err, result) {
        if(err) {
            console.log(err);
            res.send({data: "err"});
        } else{
            res.send({data: "ok"});
        }
    })
})
.delete("/delete/:id", (req, res) => {
    pool.query("delete from post where id = ?", req.params.id, function(err, result) {
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