const db = require('../util/database');

module.exports = class AnswerEvaluation {
  constructor(id, v_no, answer, s_score, m_score) {
    this.id = id;           //
    this.v_no = v_no;       //동영상번호
    this.answer = answer;   
    this.s_score = s_score;  
    this.m_score = m_score;  
  }

  save() {    //sn은 자동증가로 설정해놨음
    return db.execute('INSERT INTO answer_evaluation (v_no, answer, s_score, m_score) VALUES (?, ?, ?, ?)', 
      [this.v_no, this.answer, this.s_score, this.m_score]   
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
