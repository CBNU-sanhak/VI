const path = require('path');

const express = require('express');

const mypageController = require('../controllers/mypage');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/mypage/:c_no', mypageController.getAllInterview);     //c_no 동적으로 보내기

router.get('/mypage/video/:v_no', mypageController.getVideo);     //c_no 동적으로 보내기

module.exports = router;