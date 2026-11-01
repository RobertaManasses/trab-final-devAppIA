/**
 * AssistenteDocumento
 * -------------------
 * Carrega o PDF do regulamento UMA vez (em base64) e responde perguntas
 * sobre ele com a Gemini API.
 *
 * Jeito que a documentação oficial mostra hoje (SDK @google/genai):
 * o PDF entra no "contents" como uma parte inlineData (base64 + mimeType)
 * e a pergunta entra como uma parte text, na mesma mensagem.
 *   https://ai.google.dev/gemini-api/docs/document-processing
 * Envio inline vale para requisições com menos de 20 MB de conteúdo;
 * para PDFs maiores, a doc orienta usar a Files API (ai.files.upload).
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const MIMETYPE_PDF = 'application/pdf';

const INSTRUCAO_SISTEMA = [
  'Você é um assistente que responde perguntas sobre o regulamento de TCC do curso.',
  'Responda SOMENTE com base no documento fornecido.',
  'Sempre cite o artigo ou a seção de onde tirou a resposta (ex.: "Art. 5º", "Seção 3.2").',
  'Se a resposta não estiver no documento, diga exatamente: "Não encontrei isso no documento".',
  'Responda em português, em poucas frases.',
].join(' ');

class AssistenteDocumento {
  /**
   * @param {object} opcoes
   * @param {string} opcoes.apiKey     - valor de GEMINI_API_KEY
   * @param {string} opcoes.modelo     - valor de GEMINI_MODELO (ex.: "gemini-2.5-flash")
   * @param {string} opcoes.caminhoPdf - caminho do regulamento-tcc.pdf
   */
  constructor({ apiKey, modelo, caminhoPdf }) {
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY não configurada. Crie o .env com GEMINI_API_KEY=sua-chave.'
      );
    }

    const caminhoAbsoluto = path.resolve(caminhoPdf);
    if (!fs.existsSync(caminhoAbsoluto)) {
      throw new Error(`PDF não encontrado: ${caminhoAbsoluto}`);
    }

    // Limite da API para envio inline: menos de 20 MB por requisição.
    const tamanhoMb = fs.statSync(caminhoAbsoluto).size / (1024 * 1024);
    if (tamanhoMb >= 15) {
      throw new Error(
        `O PDF tem ${tamanhoMb.toFixed(1)} MB e o envio inline aceita menos de 20 MB por ` +
        'requisição. Para arquivos maiores, use a Files API (ai.files.upload), como mostra a documentação.'
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.modelo = modelo;
    // Carrega o PDF uma única vez, já em base64, pronto para o inlineData.
    this.pdfBase64 = fs.readFileSync(caminhoAbsoluto).toString('base64');
  }

  /**
   * Manda o PDF + a pergunta ao modelo.
   * @param {string} pergunta
   * @returns {Promise<{resposta: string, tokens: number}>}
   */
  async perguntar(pergunta) {
    const resposta = await this.ai.models.generateContent({
      model: this.modelo,
      contents: [
        // O documento, no formato atual da documentação...
        { inlineData: { mimeType: MIMETYPE_PDF, data: this.pdfBase64 } },
        // ...e a pergunta, na mesma mensagem.
        { text: pergunta },
      ],
      config: {
        systemInstruction: INSTRUCAO_SISTEMA,
      },
    });

    return {
      resposta: resposta.text,
      // usageMetadata.totalTokenCount = total gasto (PDF + pergunta + resposta),
      // que a própria Gemini API informa na resposta.
      tokens: resposta.usageMetadata?.totalTokenCount ?? 0,
    };
  }
}

module.exports = AssistenteDocumento;