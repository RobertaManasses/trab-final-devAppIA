const pool = require('../config/database')

const CAMPOS_PUBLICOS = 'id, nome, sobrenome, email, usuario, ativo, created_at, updated_at'

class UsuarioModel {
    static async listarTodos() {
        const query = `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY created_at DESC`
        const result = await pool.query(query)
        return result.rows
    }

    static async buscarPorId(id) {
        const query = `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    }

    static async buscarPorLogin(identificador) {
        const query = 'SELECT * FROM usuarios WHERE usuario = $1 OR email = $1 LIMIT 1'
        const result = await pool.query(query, [identificador])
        return result.rows[0] || null
    }

    static async criar({ nome, sobrenome, email, usuario, senha, ativo = true }) {
        const query = `
            INSERT INTO usuarios (nome, sobrenome, email, usuario, senha, ativo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ${CAMPOS_PUBLICOS}
        `

        const values = [nome, sobrenome, email, usuario, senha, ativo]
        const result = await pool.query(query, values)
        return result.rows[0]
    }

    static async atualizar(id, dados) {
        const { nome, sobrenome, email, usuario, senha, ativo } = dados

        const query = `
            UPDATE usuarios
            SET nome = COALESCE($1, nome),
                sobrenome = COALESCE($2, sobrenome),
                email = COALESCE($3, email),
                usuario = COALESCE($4, usuario),
                senha = COALESCE($5, senha),
                ativo = COALESCE($6, ativo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING ${CAMPOS_PUBLICOS}
        `

        const values = [nome, sobrenome, email, usuario, senha, ativo, id]
        const result = await pool.query(query, values)
        return result.rows[0] || null
    }

    static async deletar(id) {
        const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id'
        const result = await pool.query(query, [id])
        return result.rowCount > 0
    }
}

module.exports = UsuarioModel