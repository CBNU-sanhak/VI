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
require("dotenv").config({path : path.join(__dirname, './env/.env')});

const app = express();

app.set("view engine", "pug");
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


app.use("/public", express.static(__dirname + "/public"));
app.use("/speech", express.static(__dirname + "/speech"));
app.use('/images', express.static(__dirname + '/images'));
app.use('/models', express.static(__dirname + '/models'));

app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.get("/customers", async (req, res) => {
    const customers = await mysql.query('customerList');
    console.log(customers);
    res.send(customers);
});

//질문 제출 시 텍스트파일로 저장
app.post('/submit', (req,res) => {
    //var sentence = req.query.sentence;
    var sentence1 = req.body.sentence;
    var left_eyes = (req.body.left_eyes);
    var right_eyes = (req.body.right_eyes);
    const obj ={sentence : sentence1};
    var sentence = JSON.stringify(obj);
    console.log(sentence);

    const fs = require('fs');
    fs.writeFileSync("test.txt", sentence);
    fs.writeFileSync("left_eyes.txt", left_eyes);
    fs.writeFileSync("right_eyes.txt", right_eyes);

    res.sendFile(__dirname +'/views/test2.html')
})


//질문 제출 시 텍스트파일로 저장
app.get('/submit2', (req,res) => {
    var sentence = req.query.sentence;
    //var sentence = JSON.stringify(req.body);
    console.log(sentence);

    const fs = require('fs');
    fs.writeFileSync("test.txt", sentence);

    res.sendFile(__dirname +'/views/test.html')
})



app.get('/getEyearray',(req,res)=>{
    const fs = require('fs');
    var data1 = fs.readFileSync('right_eyes.txt', (err,data) => {});
    var data2 = fs.readFileSync('left_eyes.txt', (err,data) => {});
    //console(data);
   
    var data = { right: JSON.parse(data1), left: JSON.parse(data2)};
    //console.log(data);
    res.send(data);
})

app.get('/eyesresult', (req,res)=>{
    res.render("eyeresult");
})



//api통신
app.post('/convert', (req,res)=>{
    const fs = require('fs');
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
})

//12.7 추가 테스트용
app.get("/test2", (req, res) => res.sendFile(__dirname +'/views/test2.html'));



//app.get("/", (req, res) => res.sendFile(__dirname +'/views/index.html'));
app.get("/", (req, res) => res.sendFile(__dirname +'/views/test.html'));
//app.get("/*", (req, res) => res.redirect("/"));   11.06 통합과정 주석처리

//추가
app.get('/home', (req,res)=>{
    res.render('home')
})
app.get('/interview', (req,res)=>{
    res.sendFile(__dirname +'/views/interview.html')
})

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
                req.session.save(function(){
                    res.send({
                        data: "true"
                    });
                });
            }
        }
    })
})

app.post("/test", (req, res) => {
    let test = req.body.data;
    res.send({data : crypto(test)});
})

app.post('/login_process', async function (req, res) {
    let ident = req.body.ident;
    let pwd = crypto.createHashPassword(req.body.pwd);
    if(ident && pwd) {
        const result = await mysql.query('login', [ident, pwd]);
        if(results.length > 0 ) {
            req.session.is_logined = true;
            req.session.nuckname = result[0].nuckname;
            req.session.ident = ident;
            req.session.save(function () {
                res.redirect('/');
            });
        } else {
            res.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/login";</script>`);
        }
    } else {
        res.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/login";</script>`);
    }
});

app.get('/login', (req,res)=>{
    res.sendFile(__dirname +'/views/login.html')
})
app.get('/interview2', (req,res)=>{
    res.sendFile(__dirname +'/views/interview2.html')
})
app.get('/annyang', (req,res)=>{
    res.sendFile(__dirname +'/views/annyang.html')
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
        openrooms.push(name_count);
    }
    return openrooms;
}

let roomObjArr = [
    // {
    //   roomName,
    //   currentNum,
    //   users: [
    //     {
    //       socketId,
    //     },
    //   ],
    // },
  ];
  const MAXIMUM = 4;


wsServer.on("connection", (socket) => {
    let myRoomName = null;

    socket["nickname"] = "Anon";
    socket.emit("room_change", openRooms());
    socket.on("join_room", (roomName) => {
        myRoomName = roomName;

        let isRoomExist = false;
        let targetRoomObj = null;
        
        for(let i = 0; i<roomObjArr.length; ++i) {
            if (roomObjArr[i].roomName === roomName) {
                if(roomObjArr[i].currentNum >= MAXIMUM) {
                    socket.emit("reject_join");
                    ++roomObjArr[i].currentNum;
                    return;
                }

                isRoomExist = true;
                targetRoomObj = roomObjArr[i];
                break;
            }
        }

        //방 만들기
        if (!isRoomExist) {
            targetRoomObj = {
                roomName,
                currentNum: 0,
                users: [],
            };
            roomObjArr.push(targetRoomObj);
        }

        targetRoomObj.users.push({
            socketId: socket.id,
        });
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
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
    socket.on("disconnecting", () => {
        socket.to(myRoomName).emit("leave_room", socket.id);

        let isRoomEmpty = false;
        for(let i = 0; i< roomObjArr.length; i++){
            if(roomObjArr[i].roomName === myRoomName){
            const newUsers = roomObjArr[i].users.filter(
                (user) => user.socketId != socket.id
            );
            roomObjArr[i].users = newUsers;
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
});

const handleListen = () => console.log("Listening on http://localhost:3001");
httpServer.listen(3001, handleListen);
