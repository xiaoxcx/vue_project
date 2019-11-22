/*
 * @Author: xypecho
 * @Date: 2018-11-14 22:13:55
 * @Last Modified by: xypecho
 * @Last Modified time: 2018-12-07 19:38:12
 */
const mysqlJs = require('../../common/mysql.js');
const tool = require('../../common/tool.js');
class log {
    async insertOperationLog(ctx) {
        let res;
        let record = JSON.parse(ctx.request.body.record);
        // console.log(record);
        let url = record.request.url;
        let status = record.response.data.status;
        let operator = `${record.user.username}(uid:${record.user.uid})` || '';
        let operationTime = new Date().getTime();
        let currentPage = record.request.data ? record.request.data.currentPage || '' : '';
        let pageSize = record.request.data ? record.request.data.pageSize || '' : '';
        // 本来这边准备用炒鸡简单的面条式的switch的，但是看到 https://juejin.im/post/5bdfef86e51d453bf8051bf8 这篇文章后有了启发
        let operationDescription = new Map([
            ['/api/user/login', [status === 200 ? `${record.request.data.username}登录了平台` : `未知用户用帐号${record.request.data.username},密码${record.request.data.password}登录平台未遂`]],
            ['/api/user/register', [status === 200 ? `新增注册用户，用户名为${record.request.data.username}` : `未知用户尝试注册帐号${record.request.data.username}未遂`]],
            ['/api/user/changePassword', [status === 200 ? `${record.user.username}修改了密码` : `未知用户尝试修改${record.user.username}的密码未遂`]],
            ['/api/user/list', [status === 200 ? `${record.user.username}选择以每页展示${pageSize}条数据，查看了第${currentPage}页的用户列表` : `${record.user.username}查看用户列表未遂`]],
            ['/api/user/delete', [status === 200 ? `${record.user.username}删除了${record.request.data.username}(uid:${record.request.data.uid})` : `${record.user.username}删除${record.request.data.username}(uid:${record.request.data.uid})未遂`]],
            ['/api/user/edit', [status === 200 ? `${record.user.username}修改了${record.request.data.userInfo ? record.request.data.userInfo.username : ''}(uid:${record.request.data.userInfo ? record.request.data.userInfo.uid : ''})的个人信息` : `${record.user.username}修改${record.request.data.userInfo ? record.request.data.userInfo.username : ''}(uid:${record.request.data.userInfo ? record.request.data.userInfo.uid : ''})的个人信息未遂`]],
            ['/api/log/operationLogList', [status === 200 ? `${record.user.username}选择以每页展示${pageSize}条数据，查看了第${currentPage}页的操作日志` : `${record.user.username}查看操作日志未遂`]],
            ['/api/user/userInfo', [status === 200 ? `${record.user.username}查看了自己的资料` : `${record.user.username}想查看自己的资料未遂`]],
            ['/api/upload/getFilesList', [status === 200 ? `${record.user.username}选择以每页展示${pageSize}条数据，查看了第${currentPage}页的文件列表` : `${record.user.username}查看文件列表未遂`]],
            ['/api/upload/deleteFiles', [status === 200 ? `${record.user.username}删除了id为${record.request.data.id}的文件` : `${record.user.username}尝试删除id为${record.request.data.id}的文件未遂`]]
        ])
        if (operationDescription.get(url) && operationDescription.get(url)[0]) {
            // console.log(operationDescription.get(url)[0]);
            // console.log('======================================================');
            await mysqlJs.queryFromMysql(`INSERT INTO log (operator,operationTime,operationDescription) VALUES ('${operator}','${operationTime}','${operationDescription.get(url)[0]}')`);
            res = '插入成功';
        } else {
            res = '插入失败了哦';
        }
        return ctx.body = res;
    }
    async operationLogList(ctx) {
        let res;
        let currentPage = ctx.request.body.currentPage;//当前是第几页
        let pageSize = ctx.request.body.pageSize;//每页显示多少条
        let logList = await mysqlJs.queryFromMysql(`SELECT * FROM log ORDER BY id DESC LIMIT ${(currentPage - 1) * pageSize}, ${pageSize}`);
        let total = JSON.parse(JSON.stringify(await mysqlJs.queryFromMysql(`SELECT COUNT(*) FROM log`)));
        if (logList && logList.length > 0) {
            res = {
                status: 200,
                total: total[0]['COUNT(*)'],
                data: logList
            }
        } else {
            res = {
                status: 201,
                message: '获取操作日志失败，请稍候重试'
            }
        }
        return ctx.body = res;
    }
}
module.exports = new log();