// Na Vercel, tudo dentro da pasta api/ vira uma Serverless Function.
// Este arquivo só exporta o app Express (padrão do guia oficial da Vercel
// para Express). O vercel.json direciona TODAS as rotas para cá, e a função
// recebe a URL original (/saude, /perguntar...).
module.exports = require('../server');