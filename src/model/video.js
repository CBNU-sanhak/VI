const db = require('../util/database');

module.exports = class Video {
  constructor(sn, c_no, q_no, answer, url) {
    this.sn = sn;           //비디오 S/N
    this.c_no = c_no;       //고객번호
    this.q_no = q_no;       //질문번호
    this.answer = answer;   //고객답변
    this.v_date = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    this.url = url;         //동영상주소
  }

  save() {    //sn은 자동증가로 설정해놨음
   return db.execute('INSERT INTO video (c_no, q_no, answer, v_date, url) VALUES (?, ?, ?, ? ,?)', 
    [this.c_no, this.q_no, this.answer, this.v_date, this.url]   
   );
  }

  find_last_id(){
    return db.execute('SELECT video.id FROM video ORDER BY id DESC LIMIT 1');
  }

  static deleteById(id) {
    
  }

  static fetchAll(c_no) {   //모든 정보 출력
   return db.execute('SELECT * FROM video WHERE c_no = ?', [c_no]);
  }

  static search_cno_video(c_no){
    return db.execute('SELECT a.*, b.nickname FROM video as a join customer as b on a.c_no = b.id WHERE c_no  = ?', [c_no]);
  }

  static search_cno(v_no){
    return db.execute('SELECT video.c_no FROM video WHERE id = ?', [v_no]);
  }

  static get_last_result(c_no){
    return db.execute('SELECT video.id FROM video WHERE c_no = (?) ORDER BY id DESC LIMIT 1;', [c_no])
  }

  static search_video(v_no) {   //모든 정보 출력
    return db.execute('SELECT * FROM video WHERE id = ?', [v_no]);
  }
};
