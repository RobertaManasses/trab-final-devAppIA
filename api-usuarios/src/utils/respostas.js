const ehDesenvolvimento = () => process.env.NODE_ENV === 'development'

const responderErro = (res, codigo, mensagem, error) => {
    const corpo = { sucesso: false, mensagem }

    if (error && ehDesenvolvimento()) {
        corpo.erro = error.message
    }

    return res.status(codigo).json(corpo)
}

const responderRequisicaoInvalida = (res, mensagem) =>
    responderErro(res, 400, mensagem)

const responderNaoEncontrado = (res, mensagem = 'Recurso não encontrado') =>
    responderErro(res, 404, mensagem)

const responderNaoAutorizado = (res, mensagem = 'Não autorizado') =>
    responderErro(res, 401, mensagem)

const responderErroInterno = (res, mensagem, error) => {
    console.error(`${mensagem}:`, error)
    return responderErro(res, 500, mensagem, error)
}

module.exports = {
    ehDesenvolvimento,
    responderErro,
    responderRequisicaoInvalida,
    responderNaoEncontrado,
    responderNaoAutorizado,
    responderErroInterno,
}