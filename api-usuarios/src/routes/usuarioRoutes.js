const express = require('express')
const UsuarioController = require('../controllers/UsuarioController')
const { autenticar } = require('../middlewares/auth')

const router = express.Router()

router.post('/cadastrar', UsuarioController.cadastrar)
router.post('/login', UsuarioController.login)

router.use(autenticar)

router.get('/', UsuarioController.listarTodos)
router.get('/:id', UsuarioController.buscarPorId)
router.put('/:id', UsuarioController.atualizar)
router.delete('/:id', UsuarioController.deletar)

module.exports = router