const express = require("express");
const crypto = require("../src/crypto/crypto.js");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("test1");
})
.get("/:id", (req, res) => {
    res.send(req.params.id);
})
.post("/insert", (req, res) => {
    if(req.body.test){
        req.body.test="changed";
        req.body.id = crypto(req.body.id);
    }
    res.send(req.body);
});

module.exports = router;