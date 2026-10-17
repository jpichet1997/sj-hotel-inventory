const firebaseConfig = {
    apiKey: "AIzaSyDfR21IgTvy5bdBvsGX4zmwxvDH8bjR_p4",
    authDomain: "sj-hotel-inventory.firebaseapp.com",
    projectId: "sj-hotel-inventory",
    storageBucket: "sj-hotel-inventory.firebasestorage.app",
    messagingSenderId: "262539366497",
    appId: "1:262539366497:web:0005ee7740832d17349a20"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();