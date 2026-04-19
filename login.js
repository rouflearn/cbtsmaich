// 1. IMPORT (Gunakan satu versi: 10.8.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. KONFIGURASI FIREBASE (Pastikan Key Asli)
const firebaseConfig = {
    apiKey: "AIzaSyBahvtobUXJUkIYmqyFOKxsdAcEt7WbK0E",
    authDomain: "cbt-smaich.firebaseapp.com",
    projectId: "cbt-smaich",
    storageBucket: "cbt-smaich.firebasestorage.app",
    messagingSenderId: "549681496019",
    appId: "1:549681496019:web:9e557b569413cdca3ff926",
    measurementId: "G-MPX858Y2QS"
};

// 3. INISIALISASI
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. LOGIKA PROGRAM
const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Proses Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Ambil Data Peran (Role) dari Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;

            // 3. Routing berdasarkan Role
            if (role === 'guru') {
                alert("Selamat datang, Guru!");
                window.location.href = "admin.html"; // Pindah ke halaman input soal
            } else if (role === 'siswa') {
                alert("Selamat mengerjakan ujian!");
                window.location.href = "index.html"; // Pindah ke halaman ujian
            } else {
                alert("Role tidak dikenali.");
            }
        } else {
            alert("Data pengguna tidak ditemukan di database.");
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Gagal Login: " + error.message);
    }
});
