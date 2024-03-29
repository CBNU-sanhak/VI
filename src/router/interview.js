const path = require('path');

const express = require('express');

const interviewController = require('../controllers/interview');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/interview/:c_no', interviewController.startInterview);

router.post('/interview/submit', interviewController.submitInterview);

router.get('/eyesresult', interviewController.eyesresult);

router.get('/getEyearray', interviewController.getEyearray);

router.post('/convert', interviewController.convert);

router.get('/evaluation', interviewController.evaluation);

module.exports = router;