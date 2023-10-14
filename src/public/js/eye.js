const DrawEyeResult = (left, right) => {
    const left_eye_list = left;
    const right_eye_list = right;
    console.log(left_eye_list);
    console.log(right_eye_list);
    var c = document.getElementById("myCanvas");
    var c2 = document.getElementById("myCanvas2");
    var leftctx = c.getContext("2d");
    var rightctx = c2.getContext("2d");

    // 가로 세로 선 그리기
    leftctx.strokeStyle = rightctx.strokeStyle ="#000000";
    leftctx.lineWidth = rightctx.lineWidth = 1;
    // 세로 축
    leftctx.beginPath();
    leftctx.moveTo(0, 250);
    leftctx.lineTo(500, 250);
    leftctx.stroke();

    rightctx.beginPath();
    rightctx.moveTo(0, 250);
    rightctx.lineTo(500, 250);
    rightctx.stroke();

    // 가로 축
    leftctx.beginPath();
    leftctx.moveTo(250, 0);
    leftctx.lineTo(250, 500);
    leftctx.stroke();

    
    rightctx.beginPath();
    rightctx.moveTo(250, 0);
    rightctx.lineTo(250, 500);
    rightctx.stroke();

    //눈동자 좌표찍기위한 선 색 지정 바꾸기 가능
    leftctx.fillStyle = "#000000";
    leftctx.strokeStyle = "000000";
    rightctx.fillStyle = "000000";
    rightctx.strokeStyle = "000000";

    let left_Xsum=left_Ysum=right_Xsum=right_Ysum = 0;
    const left_len = left_eye_list.length;
    for (let i = 0; i < left_len; i++) {
      left_Xsum += left_eye_list[i].x;
      left_Ysum += left_eye_list[i].y;
    }
    const right_len = right_eye_list.length;
    for (let i = 0; i < right_len; i++) {
      right_Xsum += right_eye_list[i].x;
      right_Ysum += right_eye_list[i].y;
    }

    const left_avg = {x:left_Xsum/left_len, y: left_Ysum/left_len};
    const right_avg = {x:right_Xsum/right_len, y: right_Ysum/right_len};


    
    for (let i = 1; i < left_len; i++) {
      leftctx.beginPath();
      leftctx.arc(left_eye_list[i].x - left_avg.x + 250,left_eye_list[i].y - left_avg.y + 250,5,0,2 * Math.PI);
      leftctx.stroke();
      leftctx.fill();
    }

    for (let i = 1; i < right_len; i++) {
      rightctx.beginPath();
      rightctx.arc(right_eye_list[i].x - right_avg.x + 250,right_eye_list[i].y - right_avg.y + 250,5,0,2 * Math.PI);
      rightctx.stroke();
      rightctx.fill();
    }
  };

fetch("http://localhost:3001/getEyearray")
.then((response) => response.json())
.then((data) => {
      console.log(data);
      const left_eye_list = data.left;
      const right_eye_list = data.right;
      DrawEyeResult(left_eye_list,right_eye_list);
});


    
