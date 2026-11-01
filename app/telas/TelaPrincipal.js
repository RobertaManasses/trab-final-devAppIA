// app/telas/TelaPrincipal.js

import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { perguntarParaIA } from '../servicos/ia';

export default function TelaPrincipal({ usuario, irParaUsuarios, onSair }) {
  const nome = usuario && usuario.nome ? usuario.nome : 'usuário';

  // Conversa fica só em memória (some ao sair do app).
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);

  const scrollRef = useRef(null);

  // Rola para o fim sempre que chega mensagem nova ou o "Pensando..." aparece/some.
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [mensagens, pensando]);

  async function enviar() {
    const pergunta = texto.trim();
    if (!pergunta || pensando) return;

    setTexto('');
    setPensando(true);

    const idUsuario = String(Date.now()) + '-u';
    setMensagens((prev) => [
      ...prev,
      { id: idUsuario, tipo: 'usuario', texto: pergunta },
    ]);

    try {
      const { resposta, tokens } = await perguntarParaIA(pergunta);
      setMensagens((prev) => [
        ...prev,
        {
          id: String(Date.now()) + '-ia',
          tipo: 'ia',
          texto: resposta || '(sem resposta)',
          tokens,
        },
      ]);
    } catch (e) {
      setMensagens((prev) => [
        ...prev,
        {
          id: String(Date.now()) + '-erro',
          tipo: 'erro',
          texto: e.message,
        },
      ]);
    } finally {
      setPensando(false);
    }
  }

  return (
    <View style={estilos.tudo}>
      <View style={estilos.painel}>
        <Text style={estilos.tituloTopo}>Meu App</Text>

        <Text style={estilos.saudacao}>Olá, {nome}</Text>

        <TouchableOpacity style={estilos.botao} onPress={irParaUsuarios}>
          <Text style={estilos.textoBotao}>Usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[estilos.botao, estilos.botaoSair]}
          onPress={onSair}
        >
          <Text style={estilos.textoBotao}>Sair</Text>
        </TouchableOpacity>

        <View style={estilos.areaChat}>
          <ScrollView
            ref={scrollRef}
            style={estilos.listaMensagens}
            contentContainerStyle={estilos.conteudoMensagens}
          >
            {mensagens.map((m) => (
              <View
                key={m.id}
                style={[
                  estilos.balao,
                  m.tipo === 'usuario' && estilos.balaoUsuario,
                  m.tipo === 'ia' && estilos.balaoIA,
                  m.tipo === 'erro' && estilos.balaoErro,
                ]}
              >
                <Text
                  style={[
                    estilos.textoBalao,
                    m.tipo === 'usuario' && estilos.textoBalaoUsuario,
                    m.tipo === 'erro' && estilos.textoErro,
                  ]}
                >
                  {m.texto}
                </Text>
                {m.tipo === 'ia' && typeof m.tokens === 'number' && (
                  <Text style={estilos.tokens}>{m.tokens} tokens</Text>
                )}
              </View>
            ))}

            {pensando && (
              <View style={[estilos.balao, estilos.balaoIA]}>
                <Text style={estilos.textoBalao}>Pensando...</Text>
              </View>
            )}
          </ScrollView>

          <View style={estilos.linhaEntrada}>
            <TextInput
              style={estilos.entrada}
              value={texto}
              onChangeText={setTexto}
              placeholder="Digite sua pergunta"
              editable={!pensando}
              onSubmitEditing={enviar}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                estilos.botaoEnviar,
                pensando && estilos.botaoEnviarDesativado,
              ]}
              onPress={enviar}
              disabled={pensando}
            >
              <Text style={estilos.textoBotao}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  areaChat: {
    flex: 1,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  listaMensagens: { flex: 1 },
  conteudoMensagens: { paddingBottom: 8 },
  balao: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    maxWidth: '85%',
  },
  balaoUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  balaoIA: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
  },
  balaoErro: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
  },
  textoBalao: { fontSize: 15, color: '#1e293b' },
  textoBalaoUsuario: { color: '#ffffff' },
  textoErro: { color: '#dc2626' },
  tokens: { fontSize: 11, color: '#94a3b8', marginTop: 4 },

  linhaEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  entrada: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  botaoEnviar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  botaoEnviarDesativado: { backgroundColor: '#94a3b8' },
});