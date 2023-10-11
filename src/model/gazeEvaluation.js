const db = require('../util/database');

module.exports = class GazeEvaluation {
    constructor(id, c_no, v_no, result, left_eyes, right_eyes) {
        this.id = id;          
        this.c_no = c_no;      
        this.v_no = v_no;       
        this.result = result;
        this.left_eyes = left_eyes;     //JSON형식 저장
        this.right_eyes = right_eyes;
    }

    save() {    //sn은 자동증가로 설정해놨음
        return db.execute('INSERT INTO gaze_evaluation (c_no, v_no, result, left_eyes, right_eyes) VALUES (?, ?, ?, ? ,?)', 
            [this.c_no, this.v_no, this.result, this.left_eyes, this.right_eyes]   
        );
    }

    static get_left_coordinate(v_no) {
        return db.execute('SELECT g.left_eyes FROM gaze_evaluation as g WHERE g.v_no = (?)', [v_no]);
    }

    static evaluation(coordinates){
        const threshold = 30; 
        let count = 0;
        const init_coord = coordinates[0];
        
        //이전좌표와 현재 좌표간 거리 계산 => 임계값 넘으면 카운트
        for (let i = 1; i < coordinates.length; i++) {
            const prevCoord = coordinates[i - 1];
            const currentCoord = coordinates[i];
        
            const distance = Math.sqrt(
                Math.pow(currentCoord.x - prevCoord.x, 2) +
                Math.pow(currentCoord.y - prevCoord.y, 2)
            );
        
            if (distance > threshold) count++;
        }

        //총 좌표 평균값 계산 => 초기 좌표와 비교
        let sumX = 0;
        let sumY = 0;

        for (const coord of coordinates) {
            sumX += coord.x;
            sumY += coord.y;
        }

        const num = coordinates.length;
        const averageX = sumX / num;
        const averageY = sumY / num;

        console.log("얼마나 초과했는가 : " + count);
        console.log("X 좌표 평균: " + averageX);
        console.log("Y 좌표 평균: " + averageY);
    }

    static updateEvaluation(result, v_no) {
        return db.execute('UPDATE gaze_evaluation as g SET g.result = ? WHERE g.v_no = ?', [result, v_no]);
    }

    static deleteById(id) {

    }

    static fetchAll() {   //모든 정보 출력
    return db.execute('SELECT * FROM gaze_evaluation');
    }
};
