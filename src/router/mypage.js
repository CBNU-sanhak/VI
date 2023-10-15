const path = require('path');

const express = require('express');

const mypageController = require('../controllers/mypage');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/mypage/:c_no', mypageController.getAllInterview);     //모든 면접 결과 가져오기

router.get('/mypage/video/:v_no', mypageController.getVideo);      //녹화된 면접 영상 보기

router.get('/getfaceresult/:v_no', mypageController.getFaceEvaluation);

router.get('/mypage/result/faceresult/:v_no', mypageController.getFaceResult);

router.get('/mypage/result/eyeresult/:v_no', mypageController.getEyeResult);

module.exports = router;