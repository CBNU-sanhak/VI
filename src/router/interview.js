const path = require('path');

const express = require('express');

const interviewController = require('../controllers/interview');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/interview', interviewController.getIndex);

router.post('/submit', interviewController.submitInterview);

router.get('/eyesresult', interviewController.eyesresult);

router.get('/getEyearray', interviewController.getEyearray);

router.post('/convert', interviewController.convert);

module.exports = router;