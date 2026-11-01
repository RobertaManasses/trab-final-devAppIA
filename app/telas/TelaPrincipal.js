// app/telas/TelaPrincipal.js

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TelaPrincipal({ usuario, irParaUsuarios, onSair }) {
  const nome = usuario && usuario.nome ? usuario.nome : 'usuário';

  return (
    <View style={estilos.tudo}>
      <View style={estilos.painel}>
        <Text style={estilos.tituloTopo}>Meu App</Text>

        <Text style={estilos.saudacao}>Olá, {nome}</Text>

        <TouchableOpacity style={estilos.botao} onPress={irParaUsuarios}>
          <Text style={estilos.textoBotao}>Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[estilos.botao, estilos.botaoSair]} onPress={onSair}>
          <Text style={estilos.textoBotao}>Sair</Text>
        </TouchableOpacity>

        {/* Espaço em branco reservado para o chat que vai entrar depois */}
        <View style={estilos.espacoChat} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tudo: { flex: 1 },
  painel: { flex: 1, width: '100%', maxWidth: 420, alignSelf: 'center', padding: 20 },
  tituloTopo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingTop: 16,
  },
  saudacao: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoSair: { backgroundColor: '#64748b' },
  textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  espacoChat: { flex: 1 },
});