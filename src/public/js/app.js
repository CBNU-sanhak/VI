// import { createConnection } from "mysql";

const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const msg = call.querySelector("ul");
const msg_value = document.getElementById("a");
const sendBtn = document.getElementById("b");
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const list = welcome.querySelector("ul");

//추가 10/19일
const create = document.getElementById("create");
const create_btn = document.getElementById("create_btn");
const g_name = document.getElementById("g_name");
const explain = document.getElementById("explain");
const result = document.getElementById("result");
const name2 = document.getElementById("name2");
const explain2 = document.getElementById("explain2");
const num2 = document.getElementById("num2");
const j_nick = document.getElementById("j_nick");
const join = document.getElementById("join");
const cancel = document.getElementById("cancel");
const creation = document.getElementById("creation");
const nickname = document.getElementById("nickname");
const room = document.getElementById("myStream");
const chat = document.getElementById("chat");
const cancel2 = document.getElementById("cancel2");
const num = document.getElementsByName("num");
const streams = document.querySelector("#streams");


let roomName;
let c_num;
let max_num;

socket.emit("nickname", nickname.innerText);

async function handle_create(){
    let title = g_name.value;
    let content = explain.value;
    let number;
    num.forEach(elem => {
        if(elem.checked){
            number = elem.value;
        }
    });
        // let nick = nickname.innerText;
        const h3 = room.querySelector("h3");
        h3.innerText = `ROOM: ${title}`;
        roomName=title;
        socket.emit("room_create", title, content, number);
    }

function cal_num(){
    let re;
    num.forEach(elem => {
        if(elem.checked){
            re = elem.value;
        }
    })
}

function handle_join(){
    if(c_num >= max_num){
        alert("남은자리가 없습니다.");
    } else{
        socket.emit("join_room", roomName);
    }
};

function handle_cancel(){
    welcome.hidden = false;
    result.hidden = true;
}

function handle_creation(){
    welcome.hidden = true;
    create.hidden = false;
    g_name.value = "";
    explain.value = "";
}

function handle_cancel2(){
    welcome.hidden = false;
    create.hidden = true;
}

create_btn.addEventListener("click", handle_create);
join.addEventListener("click", handle_join);
cancel.addEventListener("click", handle_cancel);
creation.addEventListener("click", handle_creation);
cancel2.addEventListener("click", handle_cancel2);

socket.on("no_room", () => {
    alert("해당이름의 스터디그룹이 없습니다.");
});

socket.on("show_room", (targetRoomObj) => {
    welcome.hidden = true;
    result.hidden = false;
    name2.innerText = targetRoomObj.roomName;
    explain2.innerText = targetRoomObj.content;
    c_num = targetRoomObj.currentNum;
    max_num = targetRoomObj.MAXIMUM
    num2.innerText = "(" + c_num + "/" + max_num + ")";
    let text="";
    targetRoomObj.nicknames.forEach(element => {
        console.log(element.nickname);
        text += element.nickname + ", ";
    });
    text = text.replace(/,\s*$/, '');
    j_nick.innerText = text; 
})

socket.on("error", () => {
    console.log("방이 없는 에러발생");
})

socket.on("exist_room", () => {
    alert("이미 존재하는 스터디 그룹입니다.");
    g_name.value = "";
})

socket.on("not_allow", () => {
    alert("스터디그룹을 입력해주세요");
})
//기존

let myStream;
let muted = true;
let cameraOff = false;
// let nickName = "Anon";

let pcObj = {
    // remoteSocketId: pc
};

//메세지 생성 함수
function addMessage(message, type){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
// true는 본인메세지 false는 다른사람 메세지
    if(type){
        li.className="me"
        li.innerText = message;
        ul.appendChild(li);
    } else{
        li.className="others"
        li.innerText = message;
        ul.appendChild(li);
    }
    ul.scrollTo(0, ul.scrollHeight);
    // ul.insertBefore(li, ul.firstChild);
}

//메세지 전달 함수
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#chatForm input");
    const value = input.value;
    socket.emit("new_message", value, roomName, nickname.innerText, () => {
        addMessage(`you: ${value}`, true);
    });
    input.value = "";
}

// //닉네임 전달 함수
// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector("#nickname input");
//     const value = input.value;
//     socket.emit("nickname", value);
//     nickName = value;
//     const h3 = room.querySelector("h4");
//     h3.innerText = `NICKNAME: ${nickName}`;
//     input.value = "";
// }

const msgForm = room.querySelector("#chatForm");
// const nickForm = room.querySelector("#nickname");
msgForm.addEventListener("submit", handleMessageSubmit);
// nickForm.addEventListener("submit", handleNicknameSubmit);


async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind ==="videoinput");
        const currentCamera = myStream.getVideoTracks();//[0]; 지워짐
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            
            if(currentCamera.label == camera.label){
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

//화면을 가져오는 함수
async function getMedia(deviceId){
    //초기 화면(default 캠 선택)
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user"}
    };
    //캠이 여러개 일 시 (선택한 캠 선택)
    const cameraConstraints = {
        audio: true,
        video: {deviceId: {exact: deviceId}}
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(           
            deviceId ? cameraConstraints: initialConstraints
            );
        myFace.srcObject = myStream;
        // myFace.muted = true;
        if(!deviceId){
            // mute default
      myStream 
      .getAudioTracks()
      .forEach((track) => (track.enabled = false));

            await getCameras();
        }
    } catch(e) {
        console.log(e);
    }
}


function handleMuteClick(){
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!cameraOff){
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }else{
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }
}

 async function handleCameraChange(){
    try{
    await getMedia(cameraSelect.value);
    if(peerConnectionObjArr.length > 0){
        const videoTrack = myStream.getVideoTracks()[0];
        peerConnectionObjArr.forEach((peerConnectionObj) => {
            const peerConnection = peerConnectionObj.connection;
            const peerVideoSender = peerConnection.getSenders()
                .find((sender) => sender.track.kind == "video");
            peerVideoSender.replaceTrack(videoTrack);
        });
    }
} catch (e) {
    console.log(e);
}
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);



// 채팅룸 입장 처리
// const welcome = document.getElementById("welcome");
// const welcomeForm = welcome.querySelector("form");
// const list = welcome.querySelector("ul");

call.hidden = true;

async function initCall(){
    welcome.hidden = true;
    create.hidden = true;
    result.hidden = true;
    call.hidden = false;
    socket.emit("nickname", nickname.innerText, roomName);
    await getMedia();
    // makeConnection(); 없앴음
}

// 채팅방 이름 입력 후 버튼 클릭시
async function handleWelcomeSubmit(event){
    event.preventDefault();

    if (socket.disconnected) {
        socket.connect();
      }

    const input = welcomeForm.querySelector("input");
    roomName = input.value;
    // await initCall();
    const h3 = room.querySelector("h3");
    h3.innerText = `ROOM: ${roomName}`;
    input.value="";

    socket.emit("show_room", roomName);
    // socket.emit("join_room", roomName);
}

//채팅방 목록에 있는 채팅방 이름 클릭시
async function handleWelcomeSubmit2(event){
    event.preventDefault();
    if (socket.disconnected) {
        socket.connect();
      }
    // await initCall();
    const h3 = room.querySelector("h3");
    h3.innerText = `ROOM: ${roomName}`;

    socket.emit("show_room", roomName);
    // socket.emit("join_room", roomName);
}


welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//room 목록 addevemtlistener
list.addEventListener("click", (e) =>{
    if(e.target.tagName === "LI") {
        let text = e.target.innerText;
        let textarr = text.split(' ');
        roomName = textarr[0]

        handleWelcomeSubmit2(e);
    }
});

// Socket Code 소켓통신부분


socket.on("welcome", async (userObjArr) => {
    // myDataChannel = myPeerConnection.createDataChannel("chat");
    // myDataChannel.addEventListener("message", (event) => {
    //     console.log(event.data);
    // });
    // console.log("made data channel");

    await initCall();

    const length = userObjArr.length;
    console.log("length 길이:"+length);
    if (length === 1) {
        return;
    }

    for (let i = 0; i<length -1 ; ++i) {
        try{
            console.log(userObjArr[i].socketId);
            console.log("여기");
            const newPC = createConnection(userObjArr[i].socketId);
            const offer = await newPC.createOffer();
            await newPC.setLocalDescription(offer);
            socket.emit("offer", offer, userObjArr[i].socketId);
            console.log("sent the offer");
        } catch (e) {
            console.error(e);
        }
    }
});

socket.on("offer", async (offer, remoteSocketId) => {
    try{
    // myPeerConnection.addEventListener("datachannel", (event) => {
    //     myDataChannel = event.channel;
    //     myDataChannel.addEventListener("message", (event) => {
    //         console.log(event.data);
    //     });
    // });
    console.log("received the offer");
    const newPC = createConnection(remoteSocketId);
    await newPC.setRemoteDescription(offer);
    const answer = await newPC.createAnswer();
    await newPC.setLocalDescription(answer);
    socket.emit("answer", answer, remoteSocketId);
    console.log("sent the answer");
    } catch (e) {
        console.error(e);
    }
});

socket.on("answer", async (answer, remoteSocketId) => {
    console.log("received the answer");
    await pcObj[remoteSocketId].setRemoteDescription(answer);
});

socket.on("ice", async (ice, remoteSocketId) => {
    console.log("received candidate");
    await pcObj[remoteSocketId].addIceCandidate(ice);
});

socket.on("new_message", (msg) => {
    addMessage(msg, false);
});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    if(rooms.length === 0){
        return;
    }
    while(roomList.hasChildNodes())
    {
        roomList.removeChild(roomList.firstChild);
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room[0] + " ("+ room[1]+"/"+room[2]+")";
        roomList.insertBefore(li, roomList.firstChild);
    });
});
socket.on("room_change2", () => {
    const roomList = welcome.querySelector("ul");
    roomList.removeChild(roomList.firstChild);
});

function remove(roomlist){
    roomlist.remove(roomlist.firstChild);
}

socket.on("leave_room", (leanedSocketId) => {
    removeVideo(leanedSocketId);
    
});

socket.on("reject_join", () => {
    alert("Sorry, The room is already full.");
    leaveRoom();
    const input = welcomeForm.querySelector("input");
    input.innerText = "";
    roomName = "";
  });

// Leave Room

const leaveBtn = document.querySelector("#leave");

function leaveRoom() {
    const roomList = welcome.querySelector("ul");
    while(roomList.hasChildNodes())
    {
        roomList.removeChild(roomList.firstChild);
    }
socket.disconnect();
 socket.connect();
  call.hidden = true;
  welcome.hidden = false;

  peerConnectionObjArr = [];

  myStream.getTracks().forEach((track) => track.stop());

  myFace.srcObject = null;
  clearAllVideos();
  clearAllChat();
}

function removeVideo(leavedSocketId) {
   const streamArr = streams.querySelectorAll("video");
  streamArr.forEach((streamElement) => {
    if (streamElement.id === leavedSocketId) {
      streams.removeChild(streamElement);
    }
  });
  let count = streams.childElementCount;
  if(count == 3){
    streams.className="video_2";
  } else if(count == 2){
    streams.className="video_1";
  }
}

function clearAllVideos() {
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("video");
  streamArr.forEach((streamElement) => {
    if (streamElement.id != "myFace") {
      streams.removeChild(streamElement);
    }
  });
  streams.className="video_1";
}

const chatBox = document.querySelector("#chats")

function clearAllChat() {
  const chatArr = chatBox.querySelectorAll("li");
  chatArr.forEach((chat) => chatBox.removeChild(chat));
}

leaveBtn.addEventListener("click", leaveRoom);




// RTC Code
function createConnection(remoteSocketId){
   const myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.1.google.com:19302",
                    "stun:stun3.1.google.com:19302",
                    "stun:stun4.1.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", (event) => {
        handleIce(event, remoteSocketId)
    });
    myPeerConnection.addEventListener("addstream", (event) => {
        handleAddStream(event, remoteSocketId);
    });
    
     myStream.getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));

    pcObj[remoteSocketId] = myPeerConnection;


 
    return myPeerConnection;
}

function handleIce(event, remoteSocketId){
    if(event.candidate){
    console.log("sent candidate");
    socket.emit("ice", event.candidate, remoteSocketId);
    }
}

function handleAddStream(event, remoteSocketId){
    console.log("addStream");
    const peerStream = event.stream;
    paintPeerFace(peerStream, remoteSocketId);
}

function paintPeerFace(peerStream, id){
    const streams = document.querySelector("#streams");
    const video = document.createElement("video");
    video.id = id;
    video.autoplay = true;
    video.width = "400";
    video.height = "400";
    video.srcObject = peerStream;
    streams.appendChild(video);
    let count = streams.childElementCount;
    if(count == 4){
      streams.className="video_3";
    } else if(count == 3){
      streams.className="video_2";
    }
}

