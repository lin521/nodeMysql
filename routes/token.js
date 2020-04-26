var express = require('express');
var router = express.Router();
var { sql, mysqlOperation } = require('../config/mysql/db')
var crypto = require('crypto');
var { setToken } = require('../utils/token')


router.post('/vueMiniUserInfo', async(req, res) => {
    let params = req.body;
    let where = {
        'user_name': params.username
    }
    const sqlstr = sql
        .table('tp_admin')
        .where(where)
        .select();
    const result = await mysqlOperation.operation(sqlstr);
    const rePassword = crypto.createHash('md5').update(params.password).digest("hex")
    if (rePassword != result[0].password) {
        let data = {
            code: 401,
            message: '密码不正确'
        }
        res.json({...data })
    }
    const auth = await setToken(result[0].appid);
    let data = {
        code: 200,
        message: '登录成功',
        data: {
            authentication: auth
        }
    }
    res.json({...data })
})

module.exports = router;