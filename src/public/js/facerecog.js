const form = document.getElementById('myform');
const video = document.getElementById('video');
const ai = document.getElementById('ai');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById("stopBtn");
const message = document.getElementById('message');
const message2 = document.getElementById('message2');
const sentence = document.getElementById("sentence");  
const videoBlob = document.getElementById("videoBlob");  

const fadeout_duration = 300;
const opacity_init = 0.1;
const opacity_step = 0.1;
const same_expression_skip = 10;
const ai_feedback_expression = {        //인공지능이 말하는 듯한 메세지
    neutral : ["표정이 경직되어 있어요!","조금만 긴장을 푸세요"],
    happy: ["잘하고 있어요!","조금만 더 웃어봐요"],
    surprised : ["놀라지마세요"],
    sad : ["표정이 경직되어 있어요!"],
};
const setting_feedback = {
    setting : ["환경을 체크합니다. 화면에 얼굴이 제대로 인식되는지 확인해주세요", "화면 안으로 들어와주세요", "면접 시작"]
}
const timeout = 800;       //렌더링 타임아웃

let state = 0;
let hide = false;
let inputSize = 224;
let scoreThreshold = 0.5;
let opacity = 0.1;

let same_expression_count = 0;      //이거로 통과 실패 가리면 될듯
let before_expression = "neutral";

let score = 100;
var time = 60;

//답변 문장 체크
let speech_sentence = "";

//모델 로드
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

let recordedChunks = [];
let mediaRecorder; 

let testValue;

//비디오 버그 수정용
const sendmp4 = async (blob) => {
    if (blob == null) return;
  
    const filename = new Date().toString() + ".mp4";
    const file = new File([blob], filename);
  
    const fd = new FormData();
    fd.append("fname", filename);
    fd.append("file", file);
    fd.append("score", score);
    fd.append("left_eyes", JSON.stringify(left_eye_list));
    fd.append("right_eyes", JSON.stringify(right_eye_list));
    fd.append("sentence", speech_sentence);
  
    try {
        const response = await fetch("http://localhost:3001/file", {
            method: "POST",
            body: fd,
        });
  
        if (response.ok) {
            const data = await response.text();
            console.log(data);
        } else {
            console.error("HTTP Error:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
};


// const sendAvi = async (blob) => {
//     if (blob == null) return;
  
//     const filename = new Date().toString() + ".avi";
//     const file = new File([blob], filename);

//     videoBlob.files = new FileList([file]);
// };


//비디오 시작함수
function startVideo() {
    navigator.getUserMedia(
        { video: true, audio: true },
        stream => {
            video.srcObject = stream;

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
    
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/mp4' });
                sendmp4(blob);                         //비디오 버그 수정용 코드 추가
                // const url = URL.createObjectURL(blob);
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = 'interview_video.mp4';  
                // document.body.appendChild(a);
                // a.click();
                // window.URL.revokeObjectURL(url);
            };
        },
        err => console.error(err)
    );
}

//현재 최고 수치 감정 가져오기
function get_top_expression(obj){  
    let default_value = 0;
    let final_expression;
    let ret_obj
    _.mapObject(obj, (v,k) => {
        if(default_value < v){
            default_value = v;
            final_expression = k;
            ret_obj = {default_value, final_expression}
        }
    });
    return ret_obj;
}

//stt함수
function recBtnHandler() {
    annyang.start({ autoRestart: true, continuous: false });
    const recognition = annyang.getSpeechRecognizer();
    let final_transcript = "";
    recognition.interimResults = true;
    recognition.onresult = function (event) {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          speech_sentence += event.results[i][0].transcript;
          speech_sentence += " ";
          final_transcript += event.results[i][0].transcript;
          console.log("님이 말하는 문장 : " + final_transcript);
          $('input[name=sentence]').attr('value',speech_sentence);
          final_transcript="";
        } else {
  
        }
      }
    };
  }
  
  $('#myform').on('submit', function() {
      $('input[name=left_eyes]').attr('value',JSON.stringify(left_eye_list));
      $('input[name=right_eyes]').attr('value',JSON.stringify(right_eye_list));
      $('input[name=score]').attr('value',JSON.stringify(score));
      return true;
  });

const emotionCounts = {
    happy: 0,
    sad: 0,
    neutral: 0,
    surprised: 0,
    angry: 0
};
let feedback;

function ai_talk(obj){
    let value = obj["default_value"];
    let expression = obj["final_expression"];
        
    if(expression == 'happy'){
        if(value <= 0.6 && value > 0.3){
            feedback = 'happy';
        }
    }
    else if(expression == 'neutral'){
        if(value > 0.6){
            prev_face = 'neutral';
        }
        else if(value <= 0.6 && value > 0.3){
            prev_face = 'neutral';
            if(prev_face !== 'neutral')
                score -= 4;
        }
    }
    else if(expression == 'sad'){
        prev_face = 'sad';
        if(value > 0.6){
            score -= 8;
        }
    }
    else if(expression == 'surprised'){
        //ai.innerHTML = ai_feedback_expression['happy']['1']; 
    }
    else if(expression == 'angry'){
        score -= 5;
        //ai.innerHTML = ai_feedback_expression['happy']['1']; 
    }
    else{
        //ai.innerHTML = "화면 안으로 들어와주세요"; 
    }
    emotionCounts[expression]++;
    console.log(emotionCounts);
    console.log(score);
}
 
//faceapi 타이니디텍터 옵션 가져오기
function getFaceDetectorOptions(){
    return new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold})
}

//왼쪽눈과 오른쪽 눈의 좌표들의 배열  이것을 이용해 그려야한다.
const left_eye_list = [];
const right_eye_list  = [];

//시작함수
async function onPlay(){
    const videoEl = $('video').get(0);      //비디오 가져오기(제이쿼리사용)
    if(videoEl.paused || videoEl.ended){    //비디오 멈추거나 끝나면
        return;
    }
    const options = getFaceDetectorOptions();
    const detections = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks().withFaceExpressions();
    const detectionWithLandmarks = await faceapi.detectSingleFace(videoEl,options).withFaceLandmarks();
    const canvas = $('#overlayCanvas').get(0);


    if(detections){ //제대로 가져왔으면

         //눈좌표 평균 구하기위해서 얼굴인식에서 눈의 6개의 랜드마크 좌표를 가져와 평균을구한뒤 list에 넣어줬다.
         const getLeftEye = detectionWithLandmarks.landmarks.getLeftEye();
         const getRigtEye = detectionWithLandmarks.landmarks.getRightEye();
             //console.log(getLeftEye.length);
         let left_sumX = 0; let left_sumY = 0;let right_sumX = 0; let right_sumY = 0; 
         for(let i = 0 ; i<6 ; i++){
             left_sumX += getLeftEye[i]._x;
             left_sumY += getLeftEye[i]._y;
             right_sumX += getRigtEye[i]._x;
             right_sumY += getRigtEye[i]._y;
         }
         const left_coordinate  = { x:Math.round(left_sumX/6), y:Math.round(left_sumY/6)};
         const right_coordinate  = { x:Math.round(right_sumX/6), y:Math.round(right_sumY/6)};
         left_eye_list.push(left_coordinate);
         right_eye_list.push(right_coordinate);
         //console.log(left_eye_list);
         //console.log(right_eye_list);

        const dims = faceapi.matchDimensions(canvas, videoEl, true);
        const resizedResult = faceapi.resizeResults(detections, dims);
        const minConfidence = 0.05;     //주어진 수치 사용한다
        try{    //트라이 성공
            if(state == 1){
                message.innerHTML = setting_feedback['setting']['2']
                const expression = get_top_expression(resizedResult.expressions);    //여러 감정 중 가장 높은 수치의 감정을 가져옴
                //console.log(expression);
                ai_talk(expression);      
            }
            else if(state == 2){
                message.innerHTML = "면접 질문 중";
                message2.innerHTML = "";
                //ai.innerHTML = "";
                
            }
            else{
                message.innerHTML = setting_feedback['setting']['0'];
                message2.innerHTML = "인식 성공";
                //ai.innerHTML = "";
                faceapi.draw.drawDetections(canvas, resizedResult);
                faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
                faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence);
            } 
        }catch(e){
            //console.error(e.message);
        }
     
    }else{
        if(state == 0)message2.innerHTML = "화면 안으로 들어와주세요";
        //else 
        //else if(state == 1) ai.innerHTML = "화면 안으로 들어와주세요"; 
    }
}

video.addEventListener('play', async () => {      //비디오 켜지면 이벤트리스너 실행
    setInterval(async () => {
        onPlay();
    }, timeout)
});

// 이벤트 영역
const selectLang = "ko-KR"

function speak(text, opt_prop) {
    return new Promise((resolve, reject) => {
        if (typeof SpeechSynthesisUtterance === "undefined" || typeof window.speechSynthesis === "undefined") {
            alert("이 브라우저는 음성 합성을 지원하지 않습니다.");
            reject("음성 합성 지원하지 않음");
            return;
        }

        window.speechSynthesis.cancel(); //현재 읽고있다면 초기화

        const prop = opt_prop || {};

        const speechMsg = new SpeechSynthesisUtterance();
        speechMsg.rate = prop.rate || 10; // 속도: 0.1 ~ 10      
        speechMsg.pitch = prop.pitch || 1; // 음높이: 0 ~ 2
        speechMsg.lang = prop.lang || "ko-KR";
        speechMsg.text = text;

        speechMsg.onend = () => {
            resolve(); //음성 합성이 완료되면 resolve 호출
        };

        window.speechSynthesis.speak(speechMsg);

        //state = 1;  //진행상황 시작
        message2.innerHTML = "";
    });
}

//페이지 로드되면 실행
document.addEventListener("DOMContentLoaded", function() {
    const testElement = document.querySelector('h1');   //서버에서 동적으로 보낸 h1값 가져옴

    if (testElement) {
        testValue = testElement.textContent; 
        //console.log(testValue); 
    } else {
        console.log('h1어딨누');
    }
});

playBtn.addEventListener('click', () => {
    playBtn.style.display = "none";
    stopBtn.style.display = "block";

    state = 2; //질문 출력
    let text = testValue;

    speak(text, {
        rate: 0.62,
        pitch: 0.8,
        lang: selectLang
    }).then(() => {
        //음성 출력 종료 후 상태 변경
        state = 1;

        recBtnHandler();
        mediaRecorder.start();
    }).catch((error) => {
        console.error("음성 합성 오류: ", error);
    });
});

stopBtn.addEventListener('click', async () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    const emotionCountsJSON = JSON.stringify(emotionCounts);

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'emotionCounts';
    hiddenInput.value = emotionCountsJSON;

    //폼에 추가된 필드를 폼에 삽입
    form.appendChild(hiddenInput);

    //speech_sentence = "";
});