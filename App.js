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

const DATABASE_URL = 'https://cadastroalunos-ec6b6-default-rtdb.firebaseio.com';

export default function App() {
  const [nome, setNome] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarAlunos() {
    try {
      const resposta = await fetch(`${DATABASE_URL}/alunos.json`);
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

    setCarregando(true);

    try {
      const resposta = await fetch(`${DATABASE_URL}/alunos.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: nome.trim() })
      });

      if (!resposta.ok) throw new Error('Erro ao cadastrar');

      setNome('');
      await carregarAlunos();

    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível cadastrar o aluno.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
    const intervalo = setInterval(carregarAlunos, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Alunos</Text>

      <Text style={styles.descricao}>
        Lista de alunos da turma
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
        disabled={carregando}
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
    marginBottom: 25
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