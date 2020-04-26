let { sql } = require('mysqls');
var { connConfig } = require('../config');
class db {
    constructor(config = {}) {
        this.mysql = require('mysql');
        this.connection = this.mysql.createConnection({...config })
    }

    sqlConn() {
        this.connection.connect(err => {
            if (err) return callback(`error connecting: ${err.stack}`);
        })
    }

    operation(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, result, fields) => {
                error ? reject(error) : resolve(result)
            })
        })
    }
}
var mysqlOperation = new db(connConfig);
mysqlOperation.sqlConn();
module.exports = {
    sql,
    mysqlOperation
}