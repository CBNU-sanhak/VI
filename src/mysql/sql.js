module.exports = {
    customerList: `select * from customer`,
    customerInsert: `insert into customer set ?`,
    customerUpdate: `update customer set ? where id =?`,
    customersDelete: `delete from customer where id=?`,
    ident_check: `SELECT * FROM customer WHERE ident = ?`,
    email_check: `select * from customer where email = ?`,
    login: `select * from customer where ident = ? and pwd = ?`
};