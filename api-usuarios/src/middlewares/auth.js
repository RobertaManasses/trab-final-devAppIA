const jwt = require('jsonwebtoken')
const { responderNaoAutorizado } = require('../utils/respostas')

const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return responderNaoAutorizado(res, 'Token não informado')
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        return next()
    } catch (error) {
        return responderNaoAutorizado(res, 'Token inválido ou expirado')
    }
}

module.exports = {
    autenticar,
}