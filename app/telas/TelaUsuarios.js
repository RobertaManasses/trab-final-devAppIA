// app/telas/TelaUsuarios.js

import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { api } from '../servicos/api';

export default function TelaUsuarios({ token, abrirEdicao, onVoltar, onSessaoExpirada }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // A lista é recarregada toda vez que a tela abre (o useEffect roda ao montar),
  // então voltar da tela de edição já traz os dados atualizados.
  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const corpo = await api.listarUsuarios(token);
      setUsuarios(Array.isArray(corpo.dados) ? corpo.dados : []);
    } catch (e) {
      if (e.expirou) {
        onSessaoExpirada();
        return;
      }
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // Busca pelo nome (com sobrenome), filtrando no próprio app.
  const textoBusca = busca.trim().toLowerCase();
  const filtrados = usuarios.filter((u) => {
    const nomeCompleto = ((u.nome || '') + ' ' + (u.sobrenome || '')).toLowerCase();
    return nomeCompleto.includes(textoBusca);
  });

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={estilos.item} onPress={() => abrirEdicao(item)}>
        <Text style={estilos.itemNome}>
          {item.nome} {item.sobrenome}
        </Text>
        <Text style={estilos.itemDetalhe}>
          @{item.usuario} · {item.email}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={estilos.tudo}>
      <View style={estilos.painel}>
        <View style={estilos.topo}>
          <TouchableOpacity onPress={onVoltar}>
            <Text style={estilos.voltar}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={estilos.titulo}>Usuários</Text>
        </View>

        <TextInput
          style={estilos.campo}
          placeholder="Buscar pelo nome..."
          value={busca}
          onChangeText={setBusca}
        />

        {carregando ? <Text style={estilos.info}>Carregando usuários...</Text> : null}
        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

        <FlatList
          style={estilos.lista}
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            !carregando && !erro ? (
              <Text style={estilos.info}>
                {usuarios.length === 0
                  ? 'Nenhum usuário cadastrado.'
                  : 'Nenhum usuário encontrado para essa busca.'}
              </Text>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tudo: { flex: 1 },
  painel: { flex: 1, width: '100%', maxWidth: 420, alignSelf: 'center', padding: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
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
    marginBottom: 8,
  },
  lista: { flex: 1, marginTop: 8 },
  item: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  itemDetalhe: { fontSize: 13, color: '#64748b', marginTop: 2 },
  info: { color: '#64748b', marginTop: 8 },
  erro: { color: '#dc2626', marginTop: 8 },
});