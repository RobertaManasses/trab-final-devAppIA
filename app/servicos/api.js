// app/servicos/api.js
// Todas as chamadas à API de usuários ficam neste arquivo.
// O endereço da API fica nesta constante, no topo.

// Se for testar no emulador Android, troque para http://10.0.2.2:3000
// Se for testar no celular (Expo Go), troque pelo IP do PC, ex.: http://192.168.0.10:3000
const ENDERECO_API = 'http://localhost:3000';

// Mensagem usada quando a API responde 401 (token ausente, inválido ou expirado).
export const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessão expirou, entre de novo';

// Monta os cabeçalhos do pedido. Nas rotas fechadas o token vai como Bearer.
function montarCabecalhos(token) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) {
    cabecalhos.Authorization = 'Bearer ' + token;
  }
  return cabecalhos;
}

// Função central: faz o pedido, trata os erros e devolve o corpo da resposta
// no formato que a API usa: { sucesso, mensagem, dados }.
async function pedir(caminho, metodo, corpo, token) {
  let resposta;
  try {
    resposta = await fetch(ENDERECO_API + caminho, {
      method: metodo,
      headers: montarCabecalhos(token),
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch (e) {
    // Falha de rede: API desligada, CORS bloqueado etc.
    throw new Error('Não foi possível conectar à API.');
  }

  // Tenta ler o JSON (pode vir vazio em alguns erros).
  let conteudo = null;
  try {
    conteudo = await resposta.json();
  } catch (e) {
    conteudo = null;
  }

  // 401 = sessão inválida/expirada. A marca "expirou" faz a tela voltar ao login.
  if (resposta.status === 401) {
    const erro = new Error((conteudo && conteudo.mensagem) || MENSAGEM_SESSAO_EXPIRADA);
    erro.expirou = true;
    throw erro;
  }

  if (!resposta.ok) {
    throw new Error((conteudo && conteudo.mensagem) || 'Erro ' + resposta.status + ' na API.');
  }

  if (!conteudo) {
    throw new Error('A API devolveu uma resposta vazia.');
  }

  if (conteudo.sucesso === false) {
    throw new Error(conteudo.mensagem || 'A API informou um erro.');
  }

  return conteudo;
}

export const api = {
  // POST /api/usuarios/cadastrar (rota aberta)
  cadastrarUsuario: (dados) => pedir('/api/usuarios/cadastrar', 'POST', dados),

  // POST /api/usuarios/login (rota aberta).
  // Aqui um 401 significa "usuário ou senha errados", e não sessão expirada,
  // então removemos a marca "expirou" para o login mostrar a mensagem da API.
  login: async (usuario, senha) => {
    try {
      return await pedir('/api/usuarios/login', 'POST', { usuario, senha });
    } catch (e) {
      if (e.expirou) {
        const erro = new Error(e.message);
        erro.expirou = false;
        throw erro;
      }
      throw e;
    }
  },

  // GET /api/usuarios (rota fechada)
  listarUsuarios: (token) => pedir('/api/usuarios', 'GET', null, token),

  // GET /api/usuarios/:id (rota fechada)
  buscarUsuario: (token, id) => pedir(`/api/usuarios/${id}`, 'GET', null, token),

  // PUT /api/usuarios/:id (rota fechada)
  alterarUsuario: (token, id, dados) => pedir(`/api/usuarios/${id}`, 'PUT', dados, token),

  // DELETE /api/usuarios/:id (rota fechada)
  excluirUsuario: (token, id) => pedir(`/api/usuarios/${id}`, 'DELETE', null, token),
};