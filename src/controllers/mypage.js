const Video = require('../model/video');    

exports.getAllInterview = (req, res, next) => {
    const c_no = req.params.c_no;
    Video.fetchAll(c_no)
    .then(([rows]) => {    
        res.render('test3', {
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
