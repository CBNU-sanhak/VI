const http = require("http");
const SocketIO = require("socket.io");
const express = require("express");
const pool = require("./mysql/index.js");
const session = require('express-session');
const crypto = require('./crypto/crypto.js');
const cors = require("cors");
const MemoryStore = require("memorystore")(session);
const smtpTransport = require("./email/email.js");
const path = require("path");
const customer_router = require("./router/customer.js");
const study_group_router = require("./router/study_group.js");
const inquire_router = require("./router/inquire.js");
const post_router = require("./router/post.js");
const comments_router = require("./router/comments.js");
const question_list_router = require("./router/question_list.js");
const evaluation_standard_router = require("./router/evaluation_standard.js");
const video_router = require("./router/video.js");
const answer_evaluation_router = require("./router/answer_evaluation.js");
const face_evaluation_router = require("./router/face_evaluation.js");
const gaze_evaluation_router = require("./router/gaze_evaluation.js");
const result_router = require("./router/result.js");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const multer = require("multer");

//라우터 시험
const interviewRoutes = require('./router/interview');  //면접페이지 라우터 추가
const mypageRoutes = require('./router/mypage');  //마이페이지(면접기록 확인) 라우터 추가
const errorController = require('./controllers/error'); //라우팅 에러 페이지

require("dotenv").config({path : path.join(__dirname, './env/.env')});

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const corsOptions = {
    origin: "http://localhost:3000",
    optionSuccessStatus: 200,
    credentials: true,
}

app.use(cors(corsOptions));

app.use(session({
    secret: "awdzxcz",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000,
  }),
    cookie: { maxAge: 86400000 },
}));

app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/speech", express.static(__dirname + "/speech"));
app.use('/images', express.static(__dirname + '/images'));
app.use('/models', express.static(__dirname + '/models'));

app.use(express.json());
app.use(express.urlencoded({extended: true}))

//라우터 등록
app.use("/customer", customer_router);
app.use("/study_group", study_group_router);
app.use("/inquire", inquire_router);
app.use("/post", post_router);
app.use("/comments", comments_router);
app.use("/question_list", question_list_router);
app.use("/evaluation_standard", evaluation_standard_router);
app.use("/vedio", video_router);
app.use("/answer_evaluation", answer_evaluation_router);
app.use("/face_evaluation", face_evaluation_router);
app.use("/gaze_evaluation", gaze_evaluation_router);
app.use("/result", result_router);
//준희추가
app.use(interviewRoutes);
app.use(mypageRoutes);

// aws s3 저장소 연결
aws.config.loadFromPath(path.join(__dirname, 's3.json'));

const s3 = new aws.S3();

const awsUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "vi-storage-sanhjak",
        acl: "public-read",
        key: function(req, file, cb) {
            cb(null, Math.floor(Math.random() * 1000).toString() + Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
})

//사진 첨부
app.post("/image", awsUpload.single("file"), (req, res) => {
    res.send({data: req.file.location});
})

const Video = require('./model/video'); //비디오 모델 클래스
const FaceEvaluation = require('./model/faceEvaluation'); //표정평가 모델 클래스
const GazeEvaluation = require('./model/gazeEvaluation');
const AnswerEvaluation = require('./model/answerEvaluation');
const axios = require('axios');
//파일 첨부
app.post("/file", awsUpload.single("file"), async (req, res) => {
    //표정평가 디비에 삽입부분(아직 /submit post요청이랑 수정안함 현재 동시에 post요청 보내는중)
    try{
        const url = req.file.location;      //동영상 url
        const c_no = req.body.c_no;            
        const q_no = req.body.q_no;
        const answer = req.body.sentence;
        const score = parseFloat(req.body.score);   //표정평가점수
        const left_eyes = JSON.stringify(req.body.left_eyes);
        const right_eyes = JSON.stringify(req.body.right_eyes);

        //감정별 퍼센테이지
        const emotion_result = req.body.emotion_result;
        console.log(emotion_result);

        let v_no;
        let result = '산만함';  //테스트용

        //비디오 DB저장
        const video = new Video(null, c_no, q_no, answer, url);
        await video.save().then(() => {
            console.log('비디오 저장완료');
        }).catch(err => console.log(err));
        //해당 비디오 id 가져오기
        await video.find_last_id().then((result) => {
            v_no = result[0][0].id;
        }).catch(err => console.log(err));

        //시선평가 DB저장
        const gaze_evaluation = new GazeEvaluation(null, c_no, v_no, result, left_eyes, right_eyes);
        await gaze_evaluation.save().then(() => {
            console.log('시선평가 저장완료');
        }).catch(err => console.log(err));

        GazeEvaluation.get_left_coordinate(v_no)
        .then(result => {
            const coordinateData = result[0][0];
            const leftEyes = JSON.parse(coordinateData.left_eyes);
            //로직
            let feedback = GazeEvaluation.evaluation(leftEyes);

            console.log(feedback);
            //업데이트
            GazeEvaluation.updateEvaluation(feedback, v_no).then(()=> {console.log('업데이트 완료')});
        })
        .catch(error => {
            console.error(error);
        });

        //표정평가 DB저장
        const faceevaluation = new FaceEvaluation(null, c_no, v_no, emotion_result);
        await faceevaluation.save().then(() => {
            console.log('표정평가 저장완료');
        }).catch(err => console.log(err));
       
        const dataToSend = {
            data: answer,
            data2: v_no,
        };
        

        // axios.post('http://127.0.0.1:5000/api', dataToSend)
        // .then(response => {
        //     console.log('Flask 서버로부터 응답을 받았습니다:');
        //     console.log(response.data.message);
        //     let score2 = response.data.message;
        //     const answerevaluation = new AnswerEvaluation(null, v_no, answer, score2, 1);
        //     answerevaluation.save().then(() => {
        //         console.log('답변평가 저장완료');
        //     }).catch(err => console.log(err));
        // })
        // .catch(error => {
        //     console.error('Flask 서버에 요청을 보내는 중 오류가 발생했습니다:');
        //     console.error(error);
        // });
        //res.redirect('http://localhost:3000/');
    }catch(err){console.log(err);}
})
// app.post("/file", (req, res) => {
//     //표정평가 디비에 삽입부분(아직 /submit post요청이랑 수정안함 현재 동시에 post요청 보내는중)

//     const score = parseFloat(req.body.score);   //평가점수

//     console.log(score);
//     console.log(req.body);
//     //res.send({data: req.file.location});
// })
// //질문 제출 시 텍스트파일로 저장
// app.post('/submit', (req,res) => {
//     const blobData = req.body.videoBlob;
//     if (blobData === null) {
//         console.log("이상");
//     }
//     var sentence1 = req.body.sentence;
//     var left_eyes = (req.body.left_eyes);
//     var right_eyes = (req.body.right_eyes);
//     const obj ={sentence : sentence1};
//     var sentence = JSON.stringify(obj);
//     console.log(sentence);
//     console.log(req.body.score);
//     console.log(req.body.emotionCounts);

//     const fs = require('fs');    
//     //fs.writeFileSync('video.mp4', blobData);
//     fs.writeFileSync("test.txt", sentence);
//     fs.writeFileSync("left_eyes.txt", left_eyes);
//     fs.writeFileSync("right_eyes.txt", right_eyes);

//     res.sendFile(__dirname +'/views/test2.html')
// })


// //질문 제출 시 텍스트파일로 저장
// app.get('/submit2', (req,res) => {
//     var sentence = req.query.sentence;
//     //var sentence = JSON.stringify(req.body);
//     console.log(sentence);

//     const fs = require('fs');
//     fs.writeFileSync("test.txt", sentence);

//     res.sendFile(__dirname +'/views/index.html')
// })



// app.get('/getEyearray',(req,res)=>{
//     const fs = require('fs');
//     var data1 = fs.readFileSync('right_eyes.txt', (err,data) => {});
//     var data2 = fs.readFileSync('left_eyes.txt', (err,data) => {});
//     //console(data);
   
//     var data = { right: JSON.parse(data1), left: JSON.parse(data2)};
//     //console.log(data);
//     res.send(data);
// })

// app.get('/eyesresult', (req,res)=>{
//     res.render("eyeresult");
// })



//api통신
// app.post('/convert', (req,res)=>{
//     const fs = require('fs');
//     var data = fs.readFileSync('test.txt', (err,data) => {});
//     //console(data);
//     var dataParsed = JSON.parse(data);
//     //var dataParsed = data;
//     //console.log(data)
    
//     //res.sendFile(__dirname +'/views/test2.html')
//     res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
//     var openApiURL = "http://aiopen.etri.re.kr:8000/WiseNLU_spoken";
 
//     var access_key = '725aebde-323a-4964-a231-ccde25bae07e';
//     var analysisCode = 'ner';
//     var text = '';
    
//     // 언어 분석 기술(문어)
//     text += dataParsed.sentence;
//     //text += "학교 가기 싫다.";
    
//     var requestJson = {  
//         'argument': {
//             'text': text,
//             'analysis_code': analysisCode
//         }
//     };

//     var request = require('request');
//     var options = {
//         url: openApiURL,
//         body: JSON.stringify(requestJson),
//         headers: {'Content-Type':'application/json','Authorization':access_key}
//     };

//     request.post(options, function (error, response, body) {
//         res.write(body);
//         /* const searchData = body.filter(object => {
//             if (object.NAME.indexOf('NNG') > -1) {
//               return object;
//             }
//             return null;
//           });
      
//         res.write(searchData); */
//     });    
// })

//12.7 추가 테스트용(api 통신 홈페이지 로드)
app.get("/test2", (req, res) => res.sendFile(__dirname +'/views/test2.html'));


app.get("/", (req, res) => res.sendFile(__dirname +'/views/index.html'));
//추가
app.get('/home/:id', (req,res)=>{
    pool.query("select nickname from customer where id = ?", req.params.id, function(err, results) {
        if(err){
            console.log(err);
        } else{
            res.render('face_chat', {
                nickname: results[0].nickname
            })
        }
    })

});

//아이디 중복 확인
app.post('/id_check', (req, res) => {
    let ident = req.body.ident;
    pool.query("select * from customer where ident = ?", ident, function(err, results) {
        if(err){
            throw err;
        } else{
            if(results.length<=0){
                res.send({data: "true"});
            }
            else{
                res.send({data: "false"});
            }
        }
    })
})

//닉네임 중복 체크
app.post('/nick_check', (req, res) => {
    let nickname = req.body.nick;
    pool.query("select * from customer where nickname = ?", nickname, function(err, results) {
        if(err) {
            console.log(err);
            res.send({data: "false"});
        } else {
            if(results.length<=0){
                res.send({data: "true"});
            }
            else{
                res.send({data: "false"});
            }
        }
    })
})

//6자리 난수 생성기
function generate(min, max) {
    let randNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randNum;
}

//이메일 전송
app.post('/email', (req, res) => {
    let email = req.body.email;
    let code = generate(111111,999999);
    console.log(code);
    const mailOption = {
        from: process.env.GOOGLE_MAIL,
        to: email,
        subject: "인증 관련 메일 입니다.",
        html: `<h1> 인증번호를 입력해주세요 \n\n\n\n\n\n</h1> ${code}`
    }

    smtpTransport.sendMail(mailOption, (err, response) => {
        if(err){
            res.send({data: "false"});
        } else{
            res.send({data: "true",
        vnum: code});
        }
    })

})

//회원가입
app.post('/signin', (req, res) => {
    let ident = req.body.ident;
    let pwd = crypto(req.body.password);
    let nickname = req.body.nickname;
    let email = req.body.email;

    const info = {
        ident : ident,
        pwd : pwd,
        nickname: nickname,
        email: email
    }
    pool.query("insert into customer set ?", info, function(err, results){
        if(err){
            console.log(err);
            res.send({data: "false"});
        } else {
            res.send({data: "true"});
        }
    })
})

// 로그인
app.post("/login", (req, res) => {
    let ident = req.body.ident;
    let pwd = crypto(req.body.pwd);

    pool.query("select * from customer where ident = ? and pwd = ?", [ident, pwd], function(err, results){
        if(err){
            console.log(err);
            res.send({data: "err"});
        } else{
            if(results.length<=0){
                res.send({data: "false"});
            } else{
                req.session.is_logined = true;
                req.session.nickname = results[0].nickname;
                req.session.ide = results[0].id;
                req.session.ident = results[0].ident;
                req.session.save(function(){
                    res.send({
                        data: "true"
                    });
                });
            }
        }
    })
})

//로그인 여부 확인
app.get("/auth_check", (req, res) => {
    if(req.session.is_logined == true) {
        res.send({
            data: "true",
            nickname: req.session.nickname,
            ident: req.session.ident,       //
            id: req.session.ide             //pk
        })
    } else{
        res.send({
            data: "false"
        })
    }
});

//ident값으로 id 가져오기
app.get("/get_id/:ident",(req, res) => {
    pool.query("select id from customer where ident = ?", req.params.ident, function(err, result){
        if(err){
            res.send({
                data: "err"
            })
        } else{
            res.send(result)
        }
    })
})

app.get('/login', (req,res)=>{
    res.sendFile(__dirname +'/views/login.html')
})

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// //현재 열린 방목록 전달함수
// function publicRooms(){
//     const {
//         sockets: {
//             adapter: {sids, rooms},
//         },
//     } = wsServer;
    
//     const publicRooms = [];
//     let s=0;
//     rooms.forEach((_, key) => {
//         if(sids.get(key) === undefined){
            
//             for(let i=0; i<publicRooms.length; i++)
//             {
//                 if(key == publicRooms[i])
//                 s=1;
//             }
//             if(s==0)
//             {
//                 publicRooms.push(key)
//             }
//             s=0;
//         }
//     })
//     return publicRooms;
// }


// function countRoom(roomName){
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

function openRooms(){
    let roomNum = roomObjArr.length;
    const openrooms = [];
    for(let i=0; i<roomNum; i++){
        const name_count = [];
        name_count.push(roomObjArr[i].roomName);
        name_count.push(roomObjArr[i].currentNum);
        name_count.push(roomObjArr[i].MAXIMUM);
        openrooms.push(name_count);
    }
    return openrooms;
}

let roomObjArr = [
    // {
    //   roomName,
    //   content,
    //   currentNum
    //   MAXIMUM
    //   users: [
    //     {
    //       socketId,
    //     },
    //   ],
    //  nicknames: [
    //      {
    //      nickname,
    //        },
    //     ],
    // },
  ];
//   const MAXIMUM = 4;


wsServer.on("connection", (socket) => {
    // let myRoomName = null;
    socket.room = null;
    socket.nickname = "anom";
    
    socket.emit("room_change", openRooms());
    socket.on("join_room", (roomName) => {
        socket.room = roomName;

        let isRoomExist = false;
        let targetRoomObj = null;
        
        for(let i = 0; i<roomObjArr.length; ++i) {
            if (roomObjArr[i].roomName === roomName) {

                isRoomExist = true;
                targetRoomObj = roomObjArr[i];
                break;
            }
        }

        //방이 없다면
        if (!isRoomExist) {
          socket.emit("error");
          return;
        }

        targetRoomObj.users.push({
            socketId: socket.id,
        });
        // targetRoomObj.nicknames.push({
        //     nickname: socket.nickname,
        // })
        console.log("4번 " + socket.nickname);
        ++targetRoomObj.currentNum;

        socket.join(roomName);
        wsServer.sockets.emit("room_change", openRooms());
        socket.emit("welcome", targetRoomObj.users);
    
    });
    socket.on("offer", (offer, remoteSocketId) => {
        socket.to(remoteSocketId).emit("offer", offer, socket.id);
    });
    socket.on("answer", (answer, remoteSocketId) => {
        socket.to(remoteSocketId).emit("answer", answer, socket.id);
    });
    socket.on("ice", (ice, remoteSocketId) => {
        socket.to(remoteSocketId).emit("ice", ice, socket.id);
    });
    socket.on("new_message", (msg, room, nickname, done) => {
        socket.to(room).emit("new_message", `${nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname, roomName) => {
        socket.nickname = nickname;
        let targetRoomObj = null;  
        let isRoomExist = false;
        for(let i = 0; i<roomObjArr.length; ++i) {
            if (roomObjArr[i].roomName === roomName) {
                isRoomExist = true;
                targetRoomObj = roomObjArr[i];
                break;
            }
        }
            //방이 없다면
             if (!isRoomExist) {
                 socket.emit("error");
                  return;
             }
                 targetRoomObj.nicknames.push({
                 nickname: nickname,
        })
    });
    socket.on("disconnecting", () => {
        console.log(socket.room);
        let myRoomName = socket.room;
        socket.to(myRoomName).emit("leave_room", socket.id);

        let isRoomEmpty = false;
        for(let i = 0; i< roomObjArr.length; i++){
            if(roomObjArr[i].roomName === myRoomName){
            const newUsers = roomObjArr[i].users.filter(
                (user) => user.socketId != socket.id
            );
            const newNicknames = roomObjArr[i].nicknames.filter(
                (nick) => nick.nickname != socket.nickname
            );
            roomObjArr[i].users = newUsers;
            roomObjArr[i].nicknames = newNicknames;
            --roomObjArr[i].currentNum;

                if (roomObjArr[i].currentNum == 0) {
                    isRoomEmpty = true;
                }
            }
        }
        if (isRoomEmpty) {
            const newRoomObjArr = roomObjArr.filter(
                (roomObj) => roomObj.currentNum != 0
            );
            roomObjArr = newRoomObjArr;
        }
    });
    socket.on("disconnect", () => {
        if(roomObjArr.length == 0){
            wsServer.sockets.emit("room_change2");
        }
        else{
        wsServer.sockets.emit("room_change", openRooms());
    }
    });
    //10/19 추가
    socket.on("show_room", (roomName) => {

        let isRoomExist = false;
        let targetRoomObj = null;
        
        for(let i = 0; i<roomObjArr.length; ++i) {
            if (roomObjArr[i].roomName === roomName) {
                isRoomExist = true;
                targetRoomObj = roomObjArr[i];
                break;
            }
        }
        //방이 없을 시
        if (!isRoomExist) {
            socket.emit("no_room");
            return;
        };
        socket.emit("show_room", targetRoomObj);
    });
    socket.on("room_create",(roomName, content, num) => {
        if(roomName == ""){
            socket.emit("not_allow");
            return;
        }
        // myRoomName = roomName;
        socket.room = roomName;

        let isRoomExist = false;
        let targetRoomObj = null;
        
        for(let i = 0; i<roomObjArr.length; ++i) {
            if (roomObjArr[i].roomName === roomName) {
                isRoomExist = true;
                targetRoomObj = roomObjArr[i];
                socket.emit("exist_room");
                return;
            }
        } 
        
        //방 만들기
         if (!isRoomExist) {
            targetRoomObj = {
                roomName,
                content,
                currentNum: 0,
                MAXIMUM: num,
                users: [],
                nicknames: [],
            };
            roomObjArr.push(targetRoomObj);
        }

        targetRoomObj.users.push({
            socketId: socket.id,
        });
        // targetRoomObj.nicknames.push({
        //     nickname: socket.nickname,
        // });
        ++targetRoomObj.currentNum;
        socket.join(roomName);
        wsServer.sockets.emit("room_change", openRooms());
        socket.emit("welcome", targetRoomObj.users);
    })
});

//404에러 페이지
app.use(errorController.get404);

const handleListen = () => console.log("Listening on http://localhost:3001");
httpServer.listen(3001, handleListen);
