const db = require('../util/database');

module.exports = class QuestionList {
  constructor(sn, c_no, url, score) {
    this.sn = sn;           //표정평가번호
    this.c_no = c_no;       //고객번호
    this.url = url;         //동영상주소
    this.score = score;
  }

  save() {    //sn은 자동증가로 설정해놨음
   return db.execute('INSERT INTO faceevaluation (c_no, url, score) VALUES (?, ?, ?)', 
    [this.c_no, this.url, this.score]   
   );
  }

  static deleteById(id) {
    
  }

  static fetchAll() {   //모든 정보 출력
   return db.execute('SELECT * FROM faceevaluation');
  }
};
