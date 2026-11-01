const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UsuarioModel = require('../models/UsuarioModel')

const {
    responderRequisicaoInvalida,
    responderNaoEncontrado,
    responderNaoAutorizado,
    responderErroInterno,
} = require('../utils/respostas')

const SALT_ROUNDS = 10
const TOKEN_EXPIRACAO = '1h'

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const tratarErroUnique = (error, res) => {
    if (error.code === '23505') {
        if (error.constraint && error.constraint.includes('email')) {
            return responderRequisicaoInvalida(res, 'E-mail já cadastrado')
        }

        if (error.constraint && error.constraint.includes('usuario')) {
            return responderRequisicaoInvalida(res, 'Usuário já cadastrado')
        }

        return responderRequisicaoInvalida(res, 'E-mail ou usuário já cadastrado')
    }

    return null
}

class UsuarioController {
    static async cadastrar(req, res) {
        try {
            const { nome, sobrenome, email, usuario, senha, ativo } = req.body

            if (!nome || nome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O nome é obrigatório')
            }

            if (!sobrenome || sobrenome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O sobrenome é obrigatório')
            }

            if (!email || email.trim() === '') {
                return responderRequisicaoInvalida(res, 'O e-mail é obrigatório')
            }

            if (!emailValido(email.trim())) {
                return responderRequisicaoInvalida(res, 'E-mail inválido')
            }

            if (!usuario || usuario.trim() === '') {
                return responderRequisicaoInvalida(res, 'O usuário é obrigatório')
            }

            if (!senha || senha.length < 6) {
                return responderRequisicaoInvalida(res, 'A senha deve ter pelo menos 6 caracteres')
            }

            const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

            const novoUsuario = await UsuarioModel.criar({
                nome: nome.trim(),
                sobrenome: sobrenome.trim(),
                email: email.trim().toLowerCase(),
                usuario: usuario.trim(),
                senha: senhaHash,
                ativo: ativo === undefined ? true : Boolean(ativo),
            })

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário cadastrado com sucesso',
                dados: novoUsuario,
            })
        } catch (error) {
            const respostaUnique = tratarErroUnique(error, res)
            if (respostaUnique) return respostaUnique

            return responderErroInterno(res, 'Erro ao cadastrar usuário', error)
        }
    }

    static async login(req, res) {
        try {
            const { usuario, email, senha } = req.body
            const identificador = usuario?.trim() || email?.trim()

            if (!identificador || !senha) {
                return responderRequisicaoInvalida(res, 'Informe usuário (ou e-mail) e senha')
            }

            const usuarioEncontrado = await UsuarioModel.buscarPorLogin(identificador)

            if (!usuarioEncontrado) {
                return responderNaoAutorizado(res, 'Usuário ou senha inválidos')
            }

            if (!usuarioEncontrado.ativo) {
                return responderNaoAutorizado(res, 'Usuário inativo')
            }

            const senhaConfere = await bcrypt.compare(senha, usuarioEncontrado.senha)

            if (!senhaConfere) {
                return responderNaoAutorizado(res, 'Usuário ou senha inválidos')
            }

            const token = jwt.sign(
                {
                    id: usuarioEncontrado.id,
                    usuario: usuarioEncontrado.usuario,
                },
                process.env.JWT_SECRET,
                { expiresIn: TOKEN_EXPIRACAO }
            )

            const { senha: _, ...usuarioSemSenha } = usuarioEncontrado

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                dados: {
                    usuario: usuarioSemSenha,
                    token,
                },
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao fazer login', error)
        }
    }

    static async listarTodos(req, res) {
        try {
            const usuarios = await UsuarioModel.listarTodos()

            return res.status(200).json({
                sucesso: true,
                quantidade: usuarios.length,
                dados: usuarios,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao listar usuários', error)
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuario = await UsuarioModel.buscarPorId(id)

            if (!usuario) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                dados: usuario,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao buscar usuário', error)
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuarioExiste = await UsuarioModel.buscarPorId(id)

            if (!usuarioExiste) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            const { nome, sobrenome, email, usuario, senha, ativo } = req.body
            const dados = {}

            if (nome !== undefined) {
                if (!nome || nome.trim() === '') {
                    return responderRequisicaoInvalida(res, 'O nome não pode ser vazio')
                }
                dados.nome = nome.trim()
            }

            if (sobrenome !== undefined) {
                if (!sobrenome || sobrenome.trim() === '') {
                    return responderRequisicaoInvalida(res, 'O sobrenome não pode ser vazio')
                }
                dados.sobrenome = sobrenome.trim()
            }

            if (email !== undefined) {
                if (!email || !emailValido(email.trim())) {
                    return responderRequisicaoInvalida(res, 'E-mail inválido')
                }
                dados.email = email.trim().toLowerCase()
            }

            if (usuario !== undefined) {
                if (!usuario || usuario.trim() === '') {
                    return responderRequisicaoInvalida(res, 'O usuário não pode ser vazio')
                }
                dados.usuario = usuario.trim()
            }

            if (senha !== undefined) {
                if (!senha || senha.length < 6) {
                    return responderRequisicaoInvalida(res, 'A senha deve ter pelo menos 6 caracteres')
                }
                dados.senha = await bcrypt.hash(senha, SALT_ROUNDS)
            }

            if (ativo !== undefined) {
                dados.ativo = Boolean(ativo)
            }

            const usuarioAtualizado = await UsuarioModel.atualizar(id, dados)

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: usuarioAtualizado,
            })
        } catch (error) {
            const respostaUnique = tratarErroUnique(error, res)
            if (respostaUnique) return respostaUnique

            return responderErroInterno(res, 'Erro ao atualizar usuário', error)
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const deletado = await UsuarioModel.deletar(id)

            if (!deletado) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário deletado com sucesso',
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao deletar usuário', error)
        }
    }
}

module.exports = UsuarioController