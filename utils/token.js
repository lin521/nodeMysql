const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/config');
const setToken = appid => {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({ appid }, secretKey, { expiresIn: '7d' })
        resolve(token)
    })
}
const verifyToken = token => {
    return new Promise((resolve, reject) => {
        const result = jwt.verify(token.split(' ')[1], secretKey)
        resolve(result)
    })
}

module.exports = {
    setToken,
    verifyToken
}