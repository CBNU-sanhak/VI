const db = require('../util/database');

module.exports = class AnswerEvaluation {
  constructor(id, v_no, answer, answer_value, answer_result, answer_value2, answer_result2, term) {
    this.id = id;           
    this.v_no = v_no;       
    this.answer = answer;   
    this.answer_value = answer_value;  
    this.answer_result = answer_result;  
    this.answer_value2 = answer_value2;  
    this.answer_result2 = answer_result2;  
    this.term = term;
  }

  save() {    //sn은 자동증가로 설정해놨음
    return db.execute('INSERT INTO answer_evaluation (v_no, answer, value, result, value2, result2, term) VALUES (?, ?, ?, ?, ? ,? ,?)', 
    [this.v_no, this.answer, this.answer_value, this.answer_result, this.answer_value2, this.answer_result2, this.term]   
    );
  }

  static get_face_evaluation_result(v_no) {
    return db.execute('SELECT f.result FROM face_evaluation as f WHERE f.v_no = (?)', [v_no]);
  }

  static get_answer_evaluation_result(v_no){
    return db.execute('SELECT a.* FROM answer_evaluation as a WHERE a.v_no = (?)', [v_no]);
  }

  static deleteById(id) {
    
  }

  static fetchAll() {   //모든 정보 출력
    return db.execute('SELECT * FROM face_evaluation');
  }
};
