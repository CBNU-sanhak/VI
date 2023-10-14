const QuestionList = require('../model/question_list');     //통상적으로 클래스는 대문자로 설정
const FaceEvaluation = require('../model/faceEvaluation'); 
const GazeEvaluation = require('../model/gazeEvaluation'); 

const fs = require('fs');
const path = require('path');

// //됐다 ㅅㅂ
// exports.startInterview = (req, res, next) => {
//     //res.sendFile(path.join(__dirname, '../views/interview2.html'));
//     res.render('interview', {
//         test: '안녕하세요 반가워요',
//         pageTitle: 'Start Interview',
//         path: '/interview'
//     }); // 변수를 템플릿에 전달
// };

exports.startInterview = (req, res, next) => {
    const c_no = req.params.c_no;
    QuestionList.randomExtract()
    .then(([rows]) => {    //여기서 인자의 rows는 가져온 중첩 배열(메타데이터)에서 첫 번째 요소가 될 것이고, fieldData는 두 번쨰 요소
        res.render('interview', {
            test: rows[0].q_content,
            q_no: rows[0].q_no,
            c_no: c_no,
            pageTitle: 'Shop',
            path: '/interview'
        });
    })
    .catch(err => {
      console.log(err);
    });
};

//면접 제출 함수
exports.submitInterview = (req, res, next) => {
    let sentence1 = req.body.sentence;
    let left_eyes = (req.body.left_eyes);
    let right_eyes = (req.body.right_eyes);
    const obj ={sentence : sentence1};
    let sentence = JSON.stringify(obj);
    //console.log(sentence);
    //console.log(req.body.score);
    //console.log(req.body.emotionCounts);
 
    // //표정평가 디비에 삽입부분
    // const url = 'not updated yet';
    // const c_no = 5;
    // const score = parseFloat(req.body.score);
    // const faceevaluation = new FaceEvaluation(null, c_no, url, score);
    // faceevaluation.save().then(() => {
    //     console.log('save complete');
    // }).catch(err => console.log(err));

    //파일에 저장
    fs.writeFileSync("test.txt", sentence);
    fs.writeFileSync("left_eyes.txt", left_eyes);
    fs.writeFileSync("right_eyes.txt", right_eyes);

    res.redirect('http://localhost:3000/');
    //res.sendFile(path.join(__dirname, '../views/test2.html'));
};

//아래 함수 렌더링 시 필요 데이터 가져오는 함수
exports.getEyearray = (req, res, next) => {
    var data1 = fs.readFileSync('right_eyes.txt', (err,data) => {});
    var data2 = fs.readFileSync('left_eyes.txt', (err,data) => {});
    //console(data);
   
    var data = { right: JSON.parse(data1), left: JSON.parse(data2)};
    //console.log(data);
    res.send(data);
};


//시선좌표 렌더링
exports.eyesresult = (req, res, next) => {
    res.render("eyeresult");
};

//api 통신 함수
exports.convert = (req, res, next) => {
    var data = fs.readFileSync('test.txt', (err,data) => {});
    //console(data);
    var dataParsed = JSON.parse(data);
    //var dataParsed = data;
    //console.log(data)
    
    //res.sendFile(__dirname +'/views/test2.html')
    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
    var openApiURL = "http://aiopen.etri.re.kr:8000/WiseNLU_spoken";
 
    var access_key = '725aebde-323a-4964-a231-ccde25bae07e';
    var analysisCode = 'ner';
    var text = '';
    
    // 언어 분석 기술(문어)
    text += dataParsed.sentence;
    //text += "학교 가기 싫다.";
    
    var requestJson = {  
        'argument': {
            'text': text,
            'analysis_code': analysisCode
        }
    };

    var request = require('request');
    var options = {
        url: openApiURL,
        body: JSON.stringify(requestJson),
        headers: {'Content-Type':'application/json','Authorization':access_key}
    };

    request.post(options, function (error, response, body) {
        res.write(body);
        /* const searchData = body.filter(object => {
            if (object.NAME.indexOf('NNG') > -1) {
              return object;
            }
            return null;
          });
      
        res.write(searchData); */
    });    
};

exports.evaluation = (req, res, next) => {
    const v_no = req.query.v_no;
    GazeEvaluation.get_left_coordinate(v_no)
        .then(result => {
            // 결과를 이곳에서 처리
            const coordinateData = result[0][0];
            const leftEyes = JSON.parse(coordinateData.left_eyes);

            //로직
            GazeEvaluation.evaluation(leftEyes);

            //업데이트
            GazeEvaluation.updateEvaluation('테스트', v_no).then(()=> {console.log('업데이트 완료')});
            res.send(result); // 브라우저에 결과를 보내거나 다른 작업을 수행
        })
        .catch(error => {
            console.error(error);
        });
};