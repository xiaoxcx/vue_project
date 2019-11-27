/*
 * @Author: xypecho
 * @Date: 2018-10-26 21:31:24
 * @Last Modified by: xueyp
 * @Last Modified time: 2019-08-27 22:02:04
 */
const mysql = require('mysql');
const tool = require('./tool.js');



// var connection = mysql.createConnection({
//     host: 'rm-m5e4908wi7o4nmw2tno.mysql.rds.aliyuncs.com',
//     user: 'root',
//     password: 'lgn970722!',
//     port: '3306',
//     database: 'equ_master',
//     timezone: '08:00'
//   });


db = mysql.createPool({
    host: 'rm-m5e4908wi7o4nmw2tno.mysql.rds.aliyuncs.com',
    post: '3306',
    user: 'root',
    password:'lgn970722!',
    // password: tool.env() === 'production' ? '' : '', // 'bu-gao-su-ni'是你线上数据库的密码，部署时记得修改
    database: 'test'
});

module.exports = {
    queryFromMysql: (sql => {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    })
}
