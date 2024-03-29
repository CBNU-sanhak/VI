const Video = require('../model/video');    
const FaceEvaluation = require('../model/faceEvaluation'); 
const GazeEvaluation = require('../model/gazeEvaluation'); 
const AnswerEvaluation = require('../model/answerEvaluation');

//모든 면접 결과 불러와 결과화면으로 렌더링
exports.getAllInterview = (req, res, next) => {
    const c_no = req.params.c_no;
    Video.search_cno_video(c_no)
    .then(([rows]) => {   
        res.render('interviewList', {
            pageTitle: 'Mypage',
            path: '/mypage',
            results: rows,
        });
    })
    .catch(err => {
      console.log(err);
    });
};

//면접영상 보는 화면 불러오기
exports.getVideo = (req, res, next) => {
    const v_no = req.params.v_no;
    Video.search_video(v_no)
    .then((results) => {    
        res.render('video', {
            pageTitle: 'Video',
            path: '/mypage',
            results: results[0][0].url
        });
    })
    .catch(err => {
      console.log(err);
    });
};

//결과창 불러오기
exports.getFinalResult = (req, res, next) => {
    const v_no = req.params.v_no;
    res.render('finalResult', {
        pageTitle: 'faceResult',
        v_no: v_no
    });
};

//면접 제출 후 결과창 이동 과정
exports.finishInterview = (req, res, next) => {
    const c_no = req.params.c_no;
    Video.get_last_result(c_no).then((results) => {
        const v_no = results[0][0].id;
        console.log(v_no);
        res.redirect('/mypage/result/finalresult/' + v_no);
    }).catch(err => console.log(err));
};


//표정평가 화면 불러오기
exports.getFaceResult = (req, res, next) => {
    const v_no = req.params.v_no;
    res.render('faceResult', {
        pageTitle: 'faceResult',
        v_no: v_no
    });
};

//시선평가 화면 불러오기
exports.getEyeResult = (req, res, next) => {
    const v_no = req.params.v_no;
    res.render('eyeResult', {
        pageTitle: 'eyeResult',
        v_no: v_no
    });
};

//시선평가 화면 불러오기
exports.getAnswerResult = (req, res, next) => {
    const v_no = req.params.v_no;
    AnswerEvaluation.get_answer_evaluation_result(v_no)
    .then((results) => {    
        res.render('answerResult', {
            pageTitle: 'Video',
            path: '/mypage',
            v_no: v_no,
            term: results[0][0].term
        });
    })
    .catch(err => {
      console.log(err);
    });
};

//표정평가 수치 가져오는 api함수
exports.getFaceEvaluation = (req, res, next) => {
    const v_no = req.params.v_no;
    let data;
    FaceEvaluation.get_face_evaluation_result(v_no).then((results) => {
        data = results[0][0];
        res.json(data);
    }).catch(err => console.log(err));
};

//시선평가 좌표 가져오는 api함수
exports.getEyeEvaluation = async (req, res, next) => {
    const v_no = req.params.v_no;
    
    try {
        const leftResult = await GazeEvaluation.get_left_coordinate(v_no);
        const rightResult = await GazeEvaluation.get_right_coordinate(v_no);

        const leftEyes = JSON.parse(leftResult[0][0].left_eyes);
        const rightEyes = JSON.parse(rightResult[0][0].right_eyes);

        const data = { left: leftEyes, right: rightEyes };
        
        res.send(data);
    } catch (error) {
        console.error(error);
    }
};

//답변평가 결과 가져오는 api
exports.getAnswerEvaluation = async (req, res, next) => {
    const v_no = req.params.v_no;    
    try {
        const result =  await AnswerEvaluation.get_answer_evaluation_result(v_no);

        const data = {
            result: result[0][0].result,
            result2: result[0][0].result2,
            value: result[0][0].value,
            value2: result[0][0].value2,
            term: result[0][0].term
        }
        res.send(data);
    } catch (error) {
        console.error(error);
    }
};

//비디오디비에서 응답 내용과 질문디비에서 질문 내용 가져오는 api
exports.getAnswerContent = async (req, res, next) => {
    const v_no = req.params.v_no;
    
    try {
        const result =  await Video.get_result_all(v_no);
        res.send(result[0][0]);
    } catch (error) {
        console.error(error);
    }
};


exports.getCorrectAnswer = async (req, res, next) => {
    const q_no = req.params.q_no;
    try {
        const result =  await Video.get_correct_asnwer(q_no);
        res.send(result[0][0]);
    } catch (error) {
        console.error(error);
    }
};

//시선평가 좌표 가져오는 api함수
exports.getEyeFeedback = async (req, res, next) => {
    const v_no = req.params.v_no;
    
    try {
        const result = await GazeEvaluation.get_result(v_no);
        res.send(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCno = async (req, res, next) => {
    const v_no = req.params.v_no;
    try {
        const result = await Video.search_cno(v_no);
        const data = result[0][0].c_no;
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

//면접 정보 가져오기
exports.getVideo2 = async (req, res, next) => {
    const v_no = req.params.v_no;
    try {
        const result = await Video.search_video(v_no);
        //console.log(result[0][0]);
        res.send(result[0][0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
