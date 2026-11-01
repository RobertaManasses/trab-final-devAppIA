// app/telas/TelaCadastro.js

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { api } from '../servicos/api';

export default function TelaCadastro({ onCadastrado, onVoltar }) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aguardando, setAguardando] = useState(false);

  async function cadastrar() {
    setErro('');

    if (!nome.trim() || !sobrenome.trim() || !email.trim() || !usuario.trim() || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (!email.includes('@')) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setAguardando(true);
    try {
      const corpo = await api.cadastrarUsuario({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        usuario: usuario.trim(),
        senha: senha,
      });
      // Cadastrou: volta para o login levando a mensagem da API.
      onCadastrado(corpo.mensagem || 'Cadastro realizado! Faça o login.');
    } catch (e) {
      setErro(e.message);
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
        <Text style={estilos.titulo}>Cadastro</Text>

        <TextInput
          style={estilos.campo}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={estilos.campo}
          placeholder="Sobrenome"
          value={sobrenome}
          onChangeText={setSobrenome}
        />
        <TextInput
          style={estilos.campo}
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
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

        {erro ? <Text style={estilos.mensagem}>{erro}</Text> : null}

        <TouchableOpacity style={estilos.botao} onPress={cadastrar} disabled={aguardando}>
          <Text style={estilos.textoBotao}>{aguardando ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoSecundario} onPress={onVoltar}>
          <Text style={estilos.textoBotaoSecundario}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tudo: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  painel: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
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