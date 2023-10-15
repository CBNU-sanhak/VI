const Video = require('../model/video');    
const FaceEvaluation = require('../model/faceEvaluation'); 

//모든 면접 결과 불러와 결과화면으로 렌더링
exports.getAllInterview = (req, res, next) => {
    const c_no = req.params.c_no;
    Video.fetchAll(c_no)
    .then(([rows]) => {    
        res.render('interviewList', {
            pageTitle: 'Mypage',
            path: '/mypage',
            results: rows
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

//표정평가 수치 가져오는 api함수
exports.getFaceEvaluation = (req, res, next) => {
    const v_no = req.params.v_no;
    let data;
    FaceEvaluation.get_face_evaluation_result(v_no).then((results) => {
        data = results[0][0];
        res.json(data);
    }).catch(err => console.log(err));
};
