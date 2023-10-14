const db = require('../util/database');

module.exports = class QuestionList {
  constructor(id, c_no, v_no, result) {
    this.id = id;           //표정평가번호
    this.c_no = c_no;       //고객번호
    this.v_no = v_no;       //동영상번호
    this.result = result;   //분석결과
  }

  save() {    //sn은 자동증가로 설정해놨음
    return db.execute('INSERT INTO face_evaluation (c_no, v_no, result) VALUES (?, ?, ?)', 
      [this.c_no, this.v_no, this.result]   
    );
  }

  static get_face_evaluation_result(v_no) {
    return db.execute('SELECT f.result FROM face_evaluation as f WHERE f.v_no = (?)', [v_no]);
}

  static deleteById(id) {
    
  }

  static fetchAll() {   //모든 정보 출력
    return db.execute('SELECT * FROM face_evaluation');
  }
};
