const path = require('path');

const express = require('express');

const mypageController = require('../controllers/mypage');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/mypage/:c_no', mypageController.getAllInterview);     //모든 면접 결과 가져오기

router.get('/mypage/video/:v_no', mypageController.getVideo);      //녹화된 면접 영상 보기

router.get('/mypage/result/finalresult/:v_no', mypageController.getFinalResult);      //최종 결과창 보여주기

router.get('/mypage/result/faceresult/:v_no', mypageController.getFaceResult);

router.get('/mypage/result/eyeresult/:v_no', mypageController.getEyeResult);

router.get('/getfaceresult/:v_no', mypageController.getFaceEvaluation); //수치 가져오는 api함수 라우터

router.get('/geteyeresult/:v_no', mypageController.getEyeEvaluation); //왼쪽 눈좌표 가져오는 api함수 라우터

router.get('/geteyeresult2/:v_no', mypageController.getEyeFeedback);    //시선좌표 피드백 내용 가져오기

router.get('/getCno/:v_no', mypageController.getCno);

module.exports = router;