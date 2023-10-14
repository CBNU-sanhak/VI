const Video = require('../model/video');    
const FaceEvaluation = require('../model/faceEvaluation'); 

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

exports.getInterviewResult = (req, res, next) => {
    const v_no = req.params.v_no;
    res.render('interviewResult', {
        pageTitle: 'Result',
        v_no: v_no
    });
};

exports.getFaceEvaluation = (req, res, next) => {
    const v_no = req.params.v_no;
    let data;
    FaceEvaluation.get_face_evaluation_result(v_no).then((results) => {
        data = results[0][0];
        res.json(data);
    }).catch(err => console.log(err));
};