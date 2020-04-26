var connConfig = {}
if (process.env.NODE_ENV === 'development') {
    connConfig = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'XXX'
    }
}
const static_url = 'http://localhost:3000/'
const secretKey = 'node_serve'
module.exports = {
    connConfig: connConfig,
    static_url,
    secretKey
}