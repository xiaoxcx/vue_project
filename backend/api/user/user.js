/*
 * @Author: xypecho
 * @Date: 2018-09-08 21:44:47
 * @Last Modified by: xueyp
 * @Last Modified time: 2018-11-19 15:29:51
 */
const mysql = require('mysql');
const url = require('url');
const mysqlJs = require('../../common/mysql.js');
const tool = require('../../common/tool.js');
class user {
    // 用户注册
    async register(ctx) {
        let res;
        let register_time = new Date().getTime();
        let username = ctx.request.body.username;
        let password = tool.md5(ctx.request.body.password);
        let is_exist = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE username = '${username}'`);
        if (is_exist && is_exist.length > 0) {
            res = {
                status: 201,
                message: '该用户名已被注册'
            }
            return ctx.body = res;
        } else {
            let insertUser = await mysqlJs.queryFromMysql(`INSERT INTO users (username,password,register_time) VALUES ('${username}','${password}','${register_time}')`);
            let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = ${insertUser.insertId}`);
            if (!insertUser) {
                res = {
                    status: 201,
                    message: '注册失败，请稍候重试'
                }
            } else {
                res = {
                    status: 200,
                    message: '注册成功',
                    data: userInfo[0]
                }
            }
            return ctx.body = res;
        }
    }
    // 用户登录
    async login(ctx) {
        let res;
        let last_login_time = new Date().getTime();
        let username = ctx.request.body.username;
        let password = tool.md5(ctx.request.body.password);
        let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (userInfo && userInfo.length === 1 && userInfo[0].is_deleted == 1 && userInfo[0].status == 1) {
            let uid = JSON.parse(JSON.stringify(userInfo))[0].uid;
            await mysqlJs.queryFromMysql(`UPDATE users SET last_login_time = '${last_login_time}' WHERE uid = '${uid}'`);
            res = {
                status: 200,
                message: '登录成功',
                data: userInfo[0]
            }
        } else if (userInfo && userInfo.length === 1 && userInfo[0].is_deleted == 0) {
            res = {
                status: 201,
                message: '该帐号已被注销，请重新注册'
            }
        } else if (userInfo && userInfo.length === 1 && userInfo[0].status == 0) {
            res = {
                status: 201,
                message: '该帐号已被禁用，请联系管理员解封'
            }
        } else {
            res = {
                status: 201,
                message: '帐号或密码错误，请重试'
            }
        }
        return ctx.body = res;
    }
    // 获取所有用户列表
    async list(ctx) {
        let currentPage = ctx.request.body.currentPage;//当前是第几页
        let pageSize = ctx.request.body.pageSize;//每页显示多少条
        let like = ctx.request.body.data.like || ''; // 模糊搜索的用户名
        let status = ctx.request.body.data.status || ''; // 状态
        let timeRange = ctx.request.body.data.timeRange || ''; // 注册的时间戳
        let res;
        let userList = JSON.parse(JSON.stringify(await mysqlJs.queryFromMysql(`SELECT * FROM users  WHERE username LIKE '%${like}%' ${status ? `AND status = ${status}` : ""}  ${timeRange.length > 0 ? `AND register_time > ${timeRange[0]} AND register_time < ${timeRange[1]}` : ''} LIMIT ${(currentPage - 1) * pageSize}, ${pageSize}`)));
        let total = JSON.parse(JSON.stringify(await mysqlJs.queryFromMysql(`SELECT COUNT(*) FROM users WHERE username LIKE '%${like}%' ${status ? `AND status = ${status}` : ""} ${timeRange.length > 0 ? `AND register_time > ${timeRange[0]} AND register_time < ${timeRange[1]}` : ''}`)));
        if (userList && userList.length > 0) {
            res = {
                status: 200,
                total: total[0]['COUNT(*)'],
                data: userList
            }
        } else {
            res = {
                status: 201,
                message: '获取用户列表失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
    // 获取指定用户的信息
    async userInfo(ctx) {
        let res;
        let uid = url.parse(ctx.request.url, true).query.uid;
        let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}'`);
        if (userInfo && userInfo.length == 1) {
            res = {
                status: 200,
                data: userInfo[0]
            }
        } else {
            res = {
                status: 201,
                message: '获取用户信息失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
    // 编辑用户信息
    async edit(ctx) {
        let res;
        let user = ctx.request.body.userInfo;
        let username = user.username;
        let uid = user.uid;
        let is_admin = user.uid != '1';
        let is_exist = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}' OR username = '${username}'`);
        if (is_admin && is_exist && is_exist.length == 1) {
            await mysqlJs.queryFromMysql(`UPDATE users SET email = '${user.email}',username = '${user.username}',status = '${user.status}',is_deleted = '${user.is_deleted}',avatar = '${user.avatar}',password = '${tool.md5(user.password)}' WHERE uid = '${uid}'`);
            let userInfo = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}'`);
            userInfo = JSON.parse(JSON.stringify(userInfo));
            res = {
                status: 200,
                data: userInfo[0]
            }
        } else if (is_admin && is_exist && is_exist.length != 1) {
            res = {
                status: 201,
                message: '该用户名已被注册'
            }
        } else if (!is_admin) {
            res = {
                status: 201,
                message: '管理员的信息不允许修改'
            }
        } else {
            res = {
                status: 201,
                message: '编辑用户信息失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
    // 删除用户
    async delete(ctx) {
        let res;
        // let uid = ctx.request.body.uid;
        // let result = JSON.parse(JSON.stringify(await mysqlJs.queryFromMysql(`DELETE FROM users WHERE uid = '${uid}'`)));
        // if (result.affectedRows == 1) {
        //     res = {
        //         status: 200,
        //         message: '删除成功'
        //     }
        // } else {
        //     res = {
        //         status: 201,
        //         message: '删除用户信息失败，请稍候重试'
        //     }
        // }
        res = {
            status: 201,
            message: '删除用户的接口被我注释了哦'
        }
        return ctx.body = res;
    }
    // 统计15天内新增注册用户数据
    async userLoginCount(ctx) {
        let res;
        const now = new Date().getTime();
        const fifteenDayAgo = now - (15 * 24 * 60 * 60 * 1000);
        const userData = await mysqlJs.queryFromMysql(`SELECT register_time FROM users WHERE register_time > ${fifteenDayAgo} AND register_time < ${now} ORDER BY register_time ASC`);
        return ctx.body = userData;
    }
    // md5加密密码
    async md5Password(ctx) {
        let res;
        const password = tool.md5(ctx.request.body.password);
        res = {
            status: 200,
            data: {
                password
            }
        }
        return ctx.body = res;
    }
    // 修改密码
    async changePassword(ctx) {
        let res;
        let uid = ctx.request.body.uid;
        let password = ctx.request.body.password;
        let is_admin = uid != '1';
        if (is_admin) {
            await mysqlJs.queryFromMysql(`UPDATE users SET password = '${tool.md5(password)}' WHERE uid = ${uid}`);
            let userData = await mysqlJs.queryFromMysql(`SELECT * FROM users WHERE uid = '${uid}'`);
            res = {
                status: 200,
                message: '密码修改成功',
                data: userData
            }
        } else {
            res = {
                status: 201,
                message: '管理员的密码不允许修改'
            }
        }
        return ctx.body = res;
    }
}
module.exports = new user();
