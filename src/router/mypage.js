const path = require('path');

const express = require('express');

const mypageController = require('../controllers/mypage');     //컨트롤러 - admin.js로 정의

const router = express.Router();

router.get('/mypage/:c_no', mypageController.getAllInterview);     //모든 면접 결과 가져오기

router.get('/mypage/video/:v_no', mypageController.getVideo);      //녹화된 면접 영상 보기

router.get('/mypage/result/finalresult/:v_no', mypageController.getFinalResult);      //최종 결과창 보여주기

router.get('/mypage/result/faceresult/:v_no', mypageController.getFaceResult);        //시선평가 결과창 연결

router.get('/mypage/result/eyeresult/:v_no', mypageController.getEyeResult);          //표정평가 결과창 연결

router.get('/mypage/result/answerresult/:v_no', mypageController.getAnswerResult);    //응답평가 결과창 연결

router.get('/getfaceresult/:v_no', mypageController.getFaceEvaluation); //수치 가져오는 api함수 라우터

router.get('/geteyeresult/:v_no', mypageController.getEyeEvaluation); //왼쪽 눈좌표 가져오는 api함수 라우터

router.get('/geteyeresult2/:v_no', mypageController.getEyeFeedback);    //시선좌표 피드백 내용 가져오기

router.get('/getanswerresult/:v_no', mypageController.getAnswerEvaluation);    //응답평가 피드백 내용 가져오기

router.get('/getanswerresult2/:v_no', mypageController.getAnswerContent);    //응답디비에서 모든 내용 가져오기

router.get('/mypage/getcorrectanswer/:q_no', mypageController.getCorrectAnswer);

router.get('/getCno/:v_no', mypageController.getCno);

router.get('/finish_interview/:c_no', mypageController.finishInterview);

module.exports = router;