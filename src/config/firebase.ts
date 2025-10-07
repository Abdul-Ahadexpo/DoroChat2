import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDMB2n7SOPxaRNWE0X8agMLol2XpIstwAU",
  authDomain: "doro-chatbot.firebaseapp.com",
  projectId: "doro-chatbot",
  storageBucket: "doro-chatbot.firebasestorage.app",
  messagingSenderId: "390971187714",
  appId: "1:390971187714:web:a46ada3a60854b74287d1b",
  databaseURL: "https://doro-chatbot-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);