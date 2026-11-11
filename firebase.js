import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAmfC0HOKp3zWdgjF6KOBmuW0UG05LKGr4",
  authDomain: "cadastroalunos-ec6b6.firebaseapp.com",
  databaseURL: "https://cadastroalunos-ec6b6-default-rtdb.firebaseio.com",
  projectId: "cadastroalunos-ec6b6",
  storageBucket: "cadastroalunos-ec6b6.firebasestorage.app",
  messagingSenderId: "830368198653",
  appId: "1:830368198653:web:a03d9a58b6bac44a017394"
};

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);