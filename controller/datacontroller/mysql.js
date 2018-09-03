//mysql.js
var mysql = require('mysql'); //调用MySQL模块
var connection = mysql.createConnection({
    host: 'localhost', //主机
    user     : 'root',
    password : 'root',
    port: '3306', 
    database : 'express'
  });
connection.connect(function(err){
    if (err) {
        console.log('[query] - :' + err);
        return;
    }
});
//封装数据库方法
function test(sql,callback){
    connection.query(sql, function (err, results) {
        if (err){
            console.log(err);
            return false;
        } else{
            callback(results);
        }
    });
}
module.exports = test;