var connConfig = {}
if (process.env.NODE_ENV === 'development') {
    connConfig = {
        host: '211.149.198.138',
        user: 'tpshop',
        password: 'e7P4u2v2',
        database: 'tpshop'
    }
}
const static_url = 'http://tpshoptest.diwutu.com'
const secretKey = 'node_serve'
module.exports = {
    connConfig: connConfig,
    static_url,
    secretKey
}