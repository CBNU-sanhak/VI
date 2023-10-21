const form = document.getElementById('myform');
const video = document.getElementById('video');
const ai = document.getElementById('ai');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById("stopBtn");
const message = document.getElementById('message');
const message2 = document.getElementById('message2');
const sentence = document.getElementById("sentence");  
const videoBlob = document.getElementById("videoBlob");  
const timerElement = document.getElementById("timer");

const ai_feedback_expression = {        //인공지능이 말하는 듯한 메세지
    neutral : ["표정이 경직되어 있어요!","조금만 긴장을 푸세요"],
    happy: ["잘하고 있어요!","조금만 더 웃어봐요"],
    surprised : ["놀라지마세요"],
    sad : ["표정이 경직되어 있어요!"]
};
const setting_feedback = {
    setting : ["환경을 체크합니다. 화면에 얼굴이 제대로 인식되는지 확인해주세요", "화면 안으로 들어와주세요", "면접 시작"]
}
const timeout = 800;       //비디오 렌더링 타임아웃

let state = 0;              //면접 상태 체크 변수
let inputSize = 224;        //영상 설정값
let scoreThreshold = 0.5;
let opacity = 0.1;

let same_expression_count = 0;      //이거로 통과 실패 가리면 될듯

let score = 100;            //면접 시작 점수
let limit_time = 60;        //면접 제한 시간
let speech_sentence = "";   //사용자 답변 문장 체크
let recordedChunks = [];    //비디오 데이터 푸쉬할 배열
let mediaRecorder;          //비디오 객체
let testValue;              //질문 문장 저장할 변수
let q_no;
let c_no;

//각 표정 별 수치합
const summedEmotions = {
    angry: 0,
    disgusted: 0,
    fearful: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprised: 0
};


//모델 로드
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

//비디오 버그 수정용
const sendmp4 = async (blob) => {
    if (blob == null) return;
    
    const emotion_percent = calc_percent(summedEmotions);
    const emotion_result = JSON.stringify(emotion_percent);

    const filename = new Date().toString() + ".mp4";
    const file = new File([blob], filename);
    
    const fd = new FormData();
    fd.append("fname", filename);
    fd.append("file", file);

    fd.append("score", score);
    fd.append("left_eyes", JSON.stringify(left_eye_list));
    fd.append("right_eyes", JSON.stringify(right_eye_list));
    fd.append("sentence", speech_sentence);
    fd.append("q_no", q_no);
    fd.append("c_no", c_no);
    fd.append("emotion_result", emotion_result);
  
    try {
        const response = await fetch("http://localhost:3001/file", {
            method: "POST",
            body: fd,
        });
        
        if (response) {
            window.location.href = `http://localhost:3001/finish_interview/${c_no}`;
        } else {
            console.error("HTTP Error:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
};

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


function sum_emotion(obj) {
    for (const emotion in obj) {
        if (emotion in summedEmotions) {
          summedEmotions[emotion] += obj[emotion];
        }
    }

    ////console.log(summedEmotions);
}

//비율 계산 함수
function calc_ratio(summedEmotions) {
    const totalSum = Object.values(summedEmotions).reduce((acc, value) => acc + value, 0);

    const emotionPercentages = {};
    for (const emotion in summedEmotions) {
        emotionPercentages[emotion] = (summedEmotions[emotion] / totalSum) * 100;
    }

    return emotionPercentages;
}

function calc_percent(emotionData) {
    //각 표정별 비율계산
    const emotionRatios = calc_ratio(emotionData);

    //해당 비율을 퍼센트로 변환
    const emotionPercentages = {};
    for (const emotion in emotionRatios) {
        emotionPercentages[emotion] = (emotionRatios[emotion]).toFixed(2); //소수점 두 자리까지 유지
    }

    return emotionPercentages;
}

//현재 최고 수치 감정 가져오기
function get_top_and_second_expression(obj) {
    ////console.log(obj);
    let first_value = -Infinity;  //가장 큰 값을 저장할 변수
    let second_value = -Infinity; //두 번째로 큰 값을 저장할 변수
    let first_expression;         //가장 큰 값을 갖는 속성(key)을 저장할 변수
    let second_expression;        //두 번째로 큰 값을 갖는 속성(key)을 저장할 변수

    _.mapObject(obj, (v, k) => {
        if (v > first_value) {
            second_value = first_value;
            second_expression = first_expression;
            first_value = v;
            first_expression = k;
        } else if (v > second_value && v !== first_value) {
            second_value = v;
            second_expression = k;
        }
    });

    if (second_value === -Infinity) {
        return null; // 두 번째로 큰 값이 없을 경우
    }

    return { first_value, first_expression, second_value, second_expression };
}

//stt함수(답변 텍스트 변환)
function startConvert() {
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

//submit 액션 발생 시
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
let prev_face;
function evaluation(obj){
    let first_value = obj["first_value"]
    let first_expression = obj["first_expression"];
    let second_value = obj["second_value"]
    let second_expression = obj["second_expression"];
    
    switch (first_expression) {
        case 'happy':
            if(first_value > 0.75){
                score += 1;
            }
            else if(first_value > 0.6)score += 0.5;
            break;
        case 'neutral':
            if(first_value >= 0.7)if(second_expression === 'angry')score -= 0.2;
            else if(first_value > 0.4 && first_value < 0.7){
                if(second_expression === 'angry')score -= 0.5;
                else score -= 0.3;
            }
            else if(first_value <= 0.4) score -= 1
            break;
        case 'sad':
            if(second_expression === 'angry')score -= 2;
            else score -= 1.5;
            break;
        case 'surprised':
            break;
        case 'angry':
            score -= 3;
            break;
        default:
            console.log("인식 안됨");
            break;
    }

    emotionCounts[first_expression]++;
}
 
//faceapi 타이니디텍터 옵션 가져오기
function getFaceDetectorOptions(){
    return new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold})
}

//왼쪽눈과 오른쪽 눈의 좌표들의 배열  이것을 이용해 그려야한다.
const left_eye_list = [];
const right_eye_list  = [];


//모델 불러오기 시작함수
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

        const dims = faceapi.matchDimensions(canvas, videoEl, true);
        const resizedResult = faceapi.resizeResults(detections, dims);
        const minConfidence = 0.05;     //주어진 수치 사용한다
        message2.innerHTML = "인식 성공";


        //새로 만듦
        const leftEyeX = getLeftEye.map(point => point._x);
        const leftEyeY = getLeftEye.map(point => point._y);
        const rightEyeX = getRigtEye.map(point => point._x);
        const rightEyeY = getRigtEye.map(point => point._y);

        const leftEyeCenter = {
            x: Math.round(leftEyeX.reduce((acc, x) => acc + x) / leftEyeX.length),
            y: Math.round(leftEyeY.reduce((acc, y) => acc + y) / leftEyeY.length)
        };
        
        const rightEyeCenter = {
            x: Math.round(rightEyeX.reduce((acc, x) => acc + x) / rightEyeX.length),
            y: Math.round(rightEyeY.reduce((acc, y) => acc + y) / rightEyeY.length)
        };

        ////console.log('Left Eye Center:', leftEyeCenter);
        ////console.log('Right Eye Center:', rightEyeCenter);
        try{    //트라이 성공
            if(state == 0){
                //faceapi.draw.drawDetections(canvas, resizedResult);
                //faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
                //faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence);
            }
            else{   //면접시작 클릭 전 대기화면
                sum_emotion(resizedResult.expressions);
                const expression = get_top_and_second_expression(resizedResult.expressions);
                ////console.log(expression);
                evaluation(expression);

                //console.log(resizedResult.expressions.neutral);
                //faceapi.draw.drawDetections(canvas, resizedResult);
                //faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
                //faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence);
            } 
        }catch(e){
            console.error(e.message);
        }
    }else{
        if(state == 0)message2.innerHTML = "얼굴 인식 중";
    }
}


//사용자 답변 텍스트 변환 함수
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

//면접시간 카운트 함수
let countdown;
let timer_state = 1;

function startCountdown(seconds) {
    //처음 화면에 보여줄 초 설정
    displayTimeLeft(seconds);

    const startTime = Date.now(); //현재 시간 기록

    countdown = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000); //경과 시간 (초)
        const remainingSeconds = seconds - elapsedTime;

        //남은 시간이 0보다 작으면 타이머 종료
        if (remainingSeconds < 0) {
            clearInterval(countdown);
            const finishEvent = new Event('finish');    //이벤트 생성
            document.dispatchEvent(finishEvent);        //이벤트 발생
            return;
        }

        if(timer_state){
            displayTimeLeft(remainingSeconds); //남은 시간 표시
        }
    }, 1000); //1초마다 업데이트
}

//시간을 화면에 표시하는 함수
function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    timerElement.textContent = display;
}



/////////////////이벤트 영역

//비디오 켜지면 이벤트리스너 실행(모델로드 시작)
video.addEventListener('play', async () => {      
    message.innerHTML = setting_feedback['setting']['0'];
    message2.innerHTML = "화면 안으로 들어와주세요";
    state = 0;
    setInterval(async () => {
        onPlay();
    }, timeout)
});

//페이지 로드되면 실행
document.addEventListener("DOMContentLoaded", function() {
    const testElement = document.querySelector('h1');   //서버에서 동적으로 보낸 h1값 가져옴
    const q_noElement = document.querySelector('h2');
    const c_noElement = document.querySelector('h3');

    if (testElement) {
        testValue = testElement.textContent; 
        q_no = q_noElement.textContent; 
        c_no = c_noElement.textContent; 
    } else {
        console.log('h1어딨누');
    }
});

playBtn.addEventListener('click', () => {
    playBtn.style.display = "none";
    stopBtn.style.display = "block";

    state = 2; //질문 출력
    let text = testValue;

    message.innerHTML = "면접 질문 중";
    message2.style.display = "none"; 
    speak(text, {
        rate: 0.75,     //속도 조절
        pitch: 0.8,     //
        lang: selectLang
    }).then(() => {
        //음성 출력 종료 후 상태 변경
        state = 1;
        mediaRecorder.start();
        startConvert();  
    }).then(() => {
        message.innerHTML = setting_feedback['setting']['2']
        startCountdown(limit_time); // 60초부터 시작
        timerElement.style.display = "block";       //전부 실행되면 타이머 시간표시(면접시간 카운트시작)
    }).catch((error) => {
        console.error("음성 합성 오류: ", error);
    });
});

stopBtn.addEventListener('click', async () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    timer_state = 0;
    message.style.display = "none";
    timerElement.textContent = "면접결과 분석중입니다.";
    // const emotionCountsJSON = JSON.stringify(emotionCounts);

    // const hiddenInput = document.createElement('input');
    // hiddenInput.type = 'hidden';
    // hiddenInput.name = 'emotionCounts';
    // hiddenInput.value = emotionCountsJSON;

    // //폼에 추가된 필드를 폼에 삽입
    // form.appendChild(hiddenInput);
    //window.location.href = "http://localhost:3000/"; 
    //speech_sentence = "";
    // setTimeout(function() {
    //     window.location.href = "http://localhost:3000/";
    // }, 2000); 
});


//finish 이벤트
document.addEventListener('finish', () => {
    stopBtn.click(); //stopBtn 클릭 이벤트 실행
    if (typeof mediaRecorder.onstop === 'function') {
        //mediaRecorder.onstop(); //이게 문젠가?
    }
});