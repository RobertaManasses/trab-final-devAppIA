// app/telas/TelaEditarUsuario.js

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { api } from '../servicos/api';

export default function TelaEditarUsuario({ token, usuario, onVoltar, onSessaoExpirada }) {
  // Começa com os dados do item tocado na lista...
  const [nome, setNome] = useState(usuario ? usuario.nome || '' : '');
  const [sobrenome, setSobrenome] = useState(usuario ? usuario.sobrenome || '' : '');
  const [email, setEmail] = useState(usuario ? usuario.email || '' : '');
  const [nomeUsuario, setNomeUsuario] = useState(usuario ? usuario.usuario || '' : '');
  const [ativo, setAtivo] = useState(usuario && usuario.ativo !== undefined ? usuario.ativo : true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [pedirConfirmacao, setPedirConfirmacao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // ...e depois busca os dados completos na API (rota buscar por id),
  // porque o item da lista pode vir resumido.
  useEffect(() => {
    async function carregar() {
      if (!usuario || !usuario.id) {
        setCarregando(false);
        return;
      }
      try {
        const corpo = await api.buscarUsuario(token, usuario.id);
        const u = corpo.dados || {};
        if (u.nome !== undefined) setNome(u.nome);
        if (u.sobrenome !== undefined) setSobrenome(u.sobrenome);
        if (u.email !== undefined) setEmail(u.email);
        if (u.usuario !== undefined) setNomeUsuario(u.usuario);
        if (u.ativo !== undefined) setAtivo(u.ativo);
      } catch (e) {
        if (e.expirou) {
          onSessaoExpirada();
          return;
        }
        // Se a busca falhar, seguimos com os dados que vieram da lista.
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function salvar() {
    setErro('');
    setAviso('');

    if (!nome.trim() || !email.trim() || !nomeUsuario.trim()) {
      setErro('Preencha nome, e-mail e usuário.');
      return;
    }

    setSalvando(true);
    try {
      const corpo = await api.alterarUsuario(token, usuario.id, {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        usuario: nomeUsuario.trim(),
        ativo: ativo, // mantém o valor que já estava
      });
      setAviso(corpo.mensagem || 'Usuário atualizado.');
    } catch (e) {
      if (e.expirou) {
        onSessaoExpirada();
        return;
      }
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setErro('');
    setAviso('');
    setExcluindo(true);
    try {
      await api.excluirUsuario(token, usuario.id);
      onVoltar(); // volta para a lista, que recarrega sozinha
    } catch (e) {
      if (e.expirou) {
        onSessaoExpirada();
        return;
      }
      setErro(e.message);
      setPedirConfirmacao(false);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ScrollView
      style={estilos.tudo}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={estilos.painel}>
        <View style={estilos.topo}>
          <TouchableOpacity onPress={onVoltar}>
            <Text style={estilos.voltar}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={estilos.titulo}>Editar usuário</Text>
        </View>

        {carregando ? (
          <Text style={estilos.info}>Carregando dados...</Text>
        ) : (
          <View>
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
              value={nomeUsuario}
              onChangeText={setNomeUsuario}
            />

            {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
            {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}

            <TouchableOpacity
              style={estilos.botao}
              onPress={salvar}
              disabled={salvando || excluindo}
            >
              <Text style={estilos.textoBotao}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </Text>
            </TouchableOpacity>

            {pedirConfirmacao ? (
              <View style={estilos.confirmacao}>
                <Text style={estilos.textoConfirmacao}>
                  Tem certeza que deseja excluir este usuário?
                </Text>
                <View style={estilos.linhaBotoes}>
                  <TouchableOpacity
                    style={[estilos.botaoPequeno, estilos.botaoPerigo]}
                    onPress={excluir}
                    disabled={excluindo}
                  >
                    <Text style={estilos.textoBotao}>
                      {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[estilos.botaoPequeno, estilos.botaoNeutro]}
                    onPress={() => setPedirConfirmacao(false)}
                  >
                    <Text style={estilos.textoBotaoNeutro}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[estilos.botao, estilos.botaoExcluir]}
                onPress={() => setPedirConfirmacao(true)}
                disabled={salvando || excluindo}
              >
                <Text style={estilos.textoBotao}>Excluir usuário</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tudo: { flex: 1 },
  conteudo: { flexGrow: 1, padding: 20 },
  painel: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  voltar: { color: '#2563eb', fontSize: 15, marginRight: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
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
  erro: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  aviso: { color: '#16a34a', fontSize: 14, marginBottom: 12 },
  info: { color: '#64748b' },
  botao: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoExcluir: { backgroundColor: '#dc2626' },
  textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  confirmacao: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  textoConfirmacao: { color: '#b91c1c', fontSize: 14, marginBottom: 10 },
  linhaBotoes: { flexDirection: 'row' },
  botaoPequeno: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoPerigo: { backgroundColor: '#dc2626', marginRight: 8, marginBottom: 0 },
  botaoNeutro: { backgroundColor: '#e2e8f0', marginBottom: 0 },
  textoBotaoNeutro: { color: '#334155', fontSize: 16, fontWeight: '600' },
});