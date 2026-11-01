// app/App.js
// O App guarda qual tela está aberta e troca de tela por estado (sem navegação).
// O token fica só na memória (useState), enquanto o app estiver aberto.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MENSAGEM_SESSAO_EXPIRADA } from './servicos/api';
import TelaLogin from './telas/TelaLogin';
import TelaCadastro from './telas/TelaCadastro';
import TelaPrincipal from './telas/TelaPrincipal';
import TelaUsuarios from './telas/TelaUsuarios';
import TelaEditarUsuario from './telas/TelaEditarUsuario';

export default function App() {
  const [tela, setTela] = useState('login');
  const [token, setToken] = useState(null);                 // só na memória
  const [usuarioLogado, setUsuarioLogado] = useState(null); // { id, nome }
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
  const [mensagemLogin, setMensagemLogin] = useState('');

  // Chamado pelo login quando a API aceita o usuário.
  function entrar(novoToken, usuario) {
    setToken(novoToken);
    setUsuarioLogado(usuario);
    setMensagemLogin('');
    setTela('principal');
  }

  // Chamado pelo botão "Sair" ou quando a API responde 401 em qualquer tela.
  function sair(mensagem) {
    setToken(null);
    setUsuarioLogado(null);
    setUsuarioEmEdicao(null);
    setMensagemLogin(mensagem || '');
    setTela('login');
  }

  function sessaoExpirou() {
    sair(MENSAGEM_SESSAO_EXPIRADA);
  }

  function abrirEdicao(usuario) {
    setUsuarioEmEdicao(usuario);
    setTela('editar');
  }

  return (
    <View style={estilos.tudo}>
      {tela === 'login' && (
        <TelaLogin
          mensagemInicial={mensagemLogin}
          onEntrar={entrar}
          irParaCadastro={() => setTela('cadastro')}
        />
      )}

      {tela === 'cadastro' && (
        <TelaCadastro
          onCadastrado={(mensagem) => {
            setMensagemLogin(mensagem);
            setTela('login');
          }}
          onVoltar={() => setTela('login')}
        />
      )}

      {tela === 'principal' && (
        <TelaPrincipal
          usuario={usuarioLogado}
          irParaUsuarios={() => setTela('usuarios')}
          onSair={() => sair()}
        />
      )}

      {tela === 'usuarios' && (
        <TelaUsuarios
          token={token}
          abrirEdicao={abrirEdicao}
          onVoltar={() => setTela('principal')}
          onSessaoExpirada={sessaoExpirou}
        />
      )}

      {tela === 'editar' && usuarioEmEdicao && (
        <TelaEditarUsuario
          token={token}
          usuario={usuarioEmEdicao}
          onVoltar={() => setTela('usuarios')}
          onSessaoExpirada={sessaoExpirou}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tudo: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
});