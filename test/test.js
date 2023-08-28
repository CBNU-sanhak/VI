const express = require("express");
const mysql = require("../src/mysql/index.js");
const app = express();
const session = require('express-session');
const crypto = require("../src/crypto/crypto.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ 
  limit: '50mb'
}));

app.use(session({
  secret: 'asdawd',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 60000
  },
}));

app.listen(3000, () => {
  console.log("start");
});


app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/test.html");
})


app.get("/customers", async (req, res) => {
  const customers = await mysql.query('customerList');
  console.log(customers);
  res.send(customers);
})

app.post("/customer/insert", async (req, res) => {
  console.log(req.body);
  const result = await mysql.query("customerInsert", req.body);
  console.log(result);
  res.send(result);
})

app.get('/test', async function(req, res) {
    req.session.k = "내맘대로";
    res.send(req.session);
})