// app/servicos/ia.js
// Chamadas à API de IA. O endereço fica nesta constante, no topo.
// Troque pela URL do seu projeto quando for usar de verdade.

const ENDERECO_IA = 'https://api-ia-five.vercel.app';

// Faz POST /perguntar com { pergunta }.
// Esta API não usa o token do login.
// Devolve { resposta, tokens }.
// Lança Error com a mensagem da API quando algo dá errado
// (por exemplo, 429 quando passa do limite de uso).
export async function perguntarParaIA(pergunta) {
  let resposta;
  try {
    resposta = await fetch(ENDERECO_IA + '/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta }),
    });
  } catch (e) {
    // Falha de rede: API desligada, CORS bloqueado etc.
    throw new Error('Não foi possível conectar à API de IA.');
  }

  // Tenta ler o JSON (pode vir vazio em alguns erros).
  let conteudo = null;
  try {
    conteudo = await resposta.json();
  } catch (e) {
    conteudo = null;
  }

  if (!resposta.ok) {
    throw new Error(
      (conteudo && conteudo.mensagem) || 'Erro ' + resposta.status + ' na API de IA.'
    );
  }

  if (!conteudo) {
    throw new Error('A API de IA devolveu uma resposta vazia.');
  }

  if (conteudo.sucesso === false) {
    throw new Error(conteudo.mensagem || 'A API de IA informou um erro.');
  }

  const dados = conteudo.dados || {};
  return {
    resposta: typeof dados.resposta === 'string' ? dados.resposta : '',
    tokens: typeof dados.tokens === 'number' ? dados.tokens : null,
  };
}