import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';

import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

const DATABASE_URL = 'https://cadastroalunos-ec6b6-default-rtdb.firebaseio.com';

export default function App() {
  const [nome, setNome] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  async function carregarAlunos(usuario) {
    try {
      const token = await usuario.getIdToken();

      const resposta = await fetch(
        `${DATABASE_URL}/alunos.json?auth=${token}`
      );

      if (!resposta.ok) throw new Error('Erro ao buscar alunos');

      const dados = await resposta.json();

      if (dados) {
        const lista = Object.keys(dados).map(id => ({
          id,
          nome: dados[id].nome
        }));

        setAlunos(lista);
      } else {
        setAlunos([]);
      }
    } catch (erro) {
      console.log('Erro ao carregar:', erro);
    }
  }

  async function adicionarAluno() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite o nome do aluno.');
      return;
    }

    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert('Aguarde', 'Autenticação ainda não concluída.');
      return;
    }

    setCarregando(true);

    try {
      const token = await usuario.getIdToken();

      const resposta = await fetch(
        `${DATABASE_URL}/alunos.json?auth=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome: nome.trim() })
        }
      );

      if (!resposta.ok) throw new Error('Erro ao cadastrar');

      setNome('');
      await carregarAlunos(usuario);

    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível cadastrar o aluno.');
      console.log(erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let intervalo;

    async function iniciarAutenticacao() {
      try {
        const credencial = await signInAnonymously(auth);
        const usuario = credencial.user;

        setAutenticado(true);

        await carregarAlunos(usuario);

        intervalo = setInterval(() => {
          carregarAlunos(usuario);
        }, 5000);

      } catch (erro) {
        console.log('Erro na autenticação:', erro);
        Alert.alert(
          'Erro',
          'Não foi possível conectar ao Firebase.'
        );
      }
    }

    iniciarAutenticacao();

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Alunos</Text>

      <Text style={styles.descricao}>
        Lista de alunos da turma
      </Text>

      <Text style={styles.status}>
        {autenticado ? 'Conectado ao Firebase' : 'Conectando...'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome do aluno"
        value={nome}
        onChangeText={setNome}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={adicionarAluno}
        disabled={carregando || !autenticado}
      >
        <Text style={styles.textoBotao}>
          {carregando ? 'Salvando...' : 'Adicionar aluno'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>
        Alunos cadastrados: {alunos.length}
      </Text>

      <FlatList
        data={alunos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nomeAluno}>{item.nome}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum aluno cadastrado.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 25,
    paddingTop: 70
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8
  },
  descricao: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  status: {
    color: 'green',
    marginBottom: 15
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  botao: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold'
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8
  },
  nomeAluno: {
    fontSize: 16
  },
  vazio: {
    color: '#777'
  }
});