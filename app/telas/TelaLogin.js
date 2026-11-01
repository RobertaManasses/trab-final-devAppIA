// app/telas/TelaLogin.js

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { api } from '../servicos/api';

export default function TelaLogin({ mensagemInicial, onEntrar, irParaCadastro }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [aguardando, setAguardando] = useState(false);

  // Mostra mensagens que chegam de fora (sessão expirada, cadastro feito etc.).
  useEffect(() => {
    setMensagem(mensagemInicial || '');
  }, [mensagemInicial]);

  // O login sempre devolve dados.token. O nome pode vir em formatos diferentes
  // conforme a API; este helper tenta achar e, se preciso, busca pelo id.
  async function descobrirQuemLogou(dados, token, usuarioDigitado) {
    const dentro = dados.usuario || dados.usuarioLogado || dados.perfil || {};
    const id = dentro.id || dados.id || null;
    let nome = dentro.nome || dados.nome || '';

    if (!nome && id) {
      try {
        const resposta = await api.buscarUsuario(token, id);
        const u = resposta.dados || {};
        if (u.nome) {
          nome = u.nome;
        }
      } catch (e) {
        // Se esta busca falhar, seguimos com o que já temos.
      }
    }

    return { id, nome: nome || usuarioDigitado };
  }

  async function entrar() {
    setMensagem('');

    if (!usuario.trim() || !senha) {
      setMensagem('Preencha usuário e senha.');
      return;
    }

    setAguardando(true);
    try {
      const corpo = await api.login(usuario.trim(), senha);
      const dados = corpo.dados || {};
      const token = dados.token;

      if (!token) {
        setMensagem('A API não devolveu o token de acesso.');
        return;
      }

      const quemLogou = await descobrirQuemLogou(dados, token, usuario.trim());
      onEntrar(token, quemLogou);
    } catch (e) {
      // Mostra a mensagem que a API devolveu (ex.: usuário ou senha inválidos).
      setMensagem(e.message);
    } finally {
      setAguardando(false);
    }
  }

  return (
    <ScrollView
      style={estilos.tudo}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={estilos.painel}>
        <Text style={estilos.titulo}>Meu App</Text>
        <Text style={estilos.subtitulo}>Entre com seu usuário e senha</Text>

        <TextInput
          style={estilos.campo}
          placeholder="Usuário"
          autoCapitalize="none"
          value={usuario}
          onChangeText={setUsuario}
        />
        <TextInput
          style={estilos.campo}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}

        <TouchableOpacity style={estilos.botao} onPress={entrar} disabled={aguardando}>
          <Text style={estilos.textoBotao}>{aguardando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoSecundario} onPress={irParaCadastro}>
          <Text style={estilos.textoBotaoSecundario}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tudo: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  painel: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  campo: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  mensagem: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  botao: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  botaoSecundario: { alignItems: 'center', paddingVertical: 8 },
  textoBotaoSecundario: { color: '#2563eb', fontSize: 14 },
});