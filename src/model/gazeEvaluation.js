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

    save() {    
        return db.execute('INSERT INTO gaze_evaluation (c_no, v_no, result, left_eyes, right_eyes) VALUES (?, ?, ?, ? ,?)', 
            [this.c_no, this.v_no, this.result, this.left_eyes, this.right_eyes]   
        );
    }

    static get_left_coordinate(v_no) {
        return db.execute('SELECT g.left_eyes FROM gaze_evaluation as g WHERE g.v_no = (?)', [v_no]);
    }

    static get_right_coordinate(v_no) {
        return db.execute('SELECT g.right_eyes FROM gaze_evaluation as g WHERE g.v_no = (?)', [v_no]);
    }

    static get_result(v_no) {
        return db.execute('SELECT g.result FROM gaze_evaluation as g WHERE g.v_no = (?)', [v_no]);
    }

    static evaluation(coordinates){
        const threshold = 13; 
        let count = 1;
        const init_coord = coordinates[0];
        let feedback = null;

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

        let weight = 1;
        if (coordinates.length < 30){
            weight = 2;
        }
        console.log(count);
        //평가하기 (제일 안좋은 경우)
        if(count > 28/weight){
            feedback = '시선이 불안정하며 정확도가 낮습니다. 집중력 향상이 시급해보입니다. 또한 지속적으로 자세가 흐트러지고있는 것으로 관측됩니다. 다음 면접 시에는 이 부분을 고려하여 면접을 진행해주세요.'
        }
        else if (count <= 30/weight && count > 20/weight){
            feedback = '시선 움직임에 불안정성이 있습니다. 응답시간에 집중하신 뒤, 긴장을 풀고 자세를 올곧게 하여 면접에 임하는 것을 연습해보세요!'
        }
        else if (count <= 20/weight && count > 10/weight){
            feedback = '시선 움직임이 어느 정도 안정적이며 정확합니다. 그러나 약간의 불안정함이 있으므로, 이를 유의하여 면접에 임해주세요. 조금만 집중하시면 더 나은 결과가 기대됩니다.'
        }
        else{
            feedback = '시선 움직임이 매우 안정적이며 정확합니다. 좋은 집중도를 유지하고 있는 것으로 보입니다.'
        }

        return feedback;
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
