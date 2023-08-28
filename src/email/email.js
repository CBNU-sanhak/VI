const nodemailer = require("nodemailer");
const path = require('path');
require("dotenv").config({path : path.join(__dirname, '../env/.env')});

const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    host : "smtp.gmail.com",
    secure: false,
    auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_PASSWORD
    }
});


module.exports = smtpTransport;