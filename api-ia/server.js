require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const AssistenteDocumento = require('./src/assistente-documento');

const app = express();

// O app em React Native vai chamar essa API pelo navegador, então CORS liberado.
app.use(cors());
app.use(express.json());

// O assistente é criado na primeira pergunta: o PDF é lido do disco uma vez só
// e fica em memória enquanto o processo estiver vivo.
let assistente = null;

function getAssistente() {
  if (!assistente) {
    assistente = new AssistenteDocumento({
      apiKey: process.env.GEMINI_API_KEY,
      modelo: process.env.GEMINI_MODELO || 'gemini-2.5-flash',
      caminhoPdf: path.join(__dirname, 'documentos', 'ppc_ingressantes_2025-1.pdf'),
    });
  }
  return assistente;
}

// Detecta erro de limite de uso. A SDK lança ApiError com .status === 429
// (RESOURCE_EXHAUSTED = cota/limite de requisições estourado).
function isErroLimiteDeUso(erro) {
  if (!erro) return false;
  if (erro.status === 429) return true;
  const texto = `${erro.message || ''} ${erro.code || ''}`.toUpperCase();
  return texto.includes('429') || texto.includes('RESOURCE_EXHAUSTED') || texto.includes('QUOTA');
}

// GET /saude — verificação rápida de que a API está no ar.
app.get('/saude', (req, res) => {
  res.json({ status: 'OK' });
});

// POST /perguntar — corpo: { "pergunta": "..." }
app.post('/perguntar', async (req, res) => {
  const pergunta = typeof req.body?.pergunta === 'string' ? req.body.pergunta.trim() : '';

  if (!pergunta) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Envie o campo "pergunta" com um texto não vazio.',
      dados: null,
    });
  }

  if (pergunta.length > 500) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'A pergunta não pode ter mais de 500 caracteres.',
      dados: null,
    });
  }

  try {
    const { resposta, tokens } = await getAssistente().perguntar(pergunta);
    return res.json({
      sucesso: true,
      mensagem: 'Pergunta respondida.',
      dados: { resposta, tokens },
    });
  } catch (erro) {
    if (isErroLimiteDeUso(erro)) {
      return res.status(429).json({
        sucesso: false,
        mensagem: 'Limite de uso da Gemini API atingido (cota gratuita). Aguarde alguns minutos e tente novamente.',
        dados: null,
      });
    }

    if (erro instanceof Error && erro.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Servidor sem GEMINI_API_KEY configurada. Defina no .env (local) ou nas variáveis de ambiente da Vercel.',
        dados: null,
      });
    }

    console.error('Erro em POST /perguntar:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao consultar a Gemini API.',
      dados: null,
    });
  }
});

// Roda local (npm run dev / npm start). Na Vercel quem responde é o api/index.js:
// lá o app é exportado sem escutar porta, e a porta local vem de process.env.PORT
// (3001 por padrão, porque a 3000 é da api-usuarios).
if (require.main === module) {
  const porta = process.env.PORT || 3001;
  app.listen(porta, () => {
    console.log(`API IA rodando em http://localhost:${porta}`);
    console.log('  GET  /saude');
    console.log('  POST /perguntar   corpo: { "pergunta": "..." }');
  });
}

module.exports = app;