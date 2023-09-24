const db = require('../util/database');

module.exports = class QuestionList {
  constructor(q_no, q_content, q_date) {
    this.q_no = q_no;
    this.q_content = q_content;
    this.q_date = q_date;
  }

  save() {    //순서는 상관없음(추후 관리자가 사용)
   return db.execute('INSERT INTO products (q_content, q_date) VALUES (?, ?)', 
    [this.q_content, this.q_date]   //두 번째 인자로 값들 설정
   );
  }

  static deleteById(id) {
    
  }

  static fetchAll() {   //디비에서 가져오는 부분
   return db.execute('SELECT * FROM questionslist');
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }

  static randomExtract(){
    return db.execute('SELECT * FROM questionslist ORDER BY rand() LIMIT 1');
  }
};


