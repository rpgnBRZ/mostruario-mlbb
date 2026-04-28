import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB18hRvdb-WJl5V9L7LOj_SfA1TkFZb5VA",
    authDomain: "mlbb-showcasezlc.firebaseapp.com",
    databaseURL: "https://mlbb-showcasezlc-default-rtdb.firebaseio.com",
    projectId: "mlbb-showcasezlc",
    storageBucket: "mlbb-showcasezlc.firebasestorage.app",
    messagingSenderId: "396583772958",
    appId: "1:396583772958:web:1870a5a654ce9013ab9f0f",
    measurementId: "G-KHHXSPH534"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue };