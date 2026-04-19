// Tambahkan ini di awal admin.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'guru') {
            alert("Akses Ditolak! Anda bukan Guru.");
            window.location.href = "login.html"; // Tendang balik ke login
        }
    } else {
        window.location.href = "login.html";
    }
});

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

document.getElementById('btnSimpan').addEventListener('click', async () => {
    const mapel = document.getElementById('mapel').value;
    const teksSoal = document.getElementById('teksSoal').value;
    const opsiA = document.getElementById('opsiA').value;
    const opsiB = document.getElementById('opsiB').value;
    const opsiC = document.getElementById('opsiC').value;
    const opsiD = document.getElementById('opsiD').value;
    const kunciJawaban = document.getElementById('kunciJawaban').value;

    // Validasi sederhana agar form tidak kosong
    if(!mapel || !teksSoal || !opsiA || !opsiB || !opsiC || !opsiD) {
        alert("Mohon lengkapi semua kolom!");
        return;
    }

    try {
        // Menyimpan data ke koleksi yang ditentukan oleh input Guru
        const docRef = await addDoc(collection(db, mapel), {
            teks_soal: teksSoal,
            opsi: {
                A: opsiA,
                B: opsiB,
                C: opsiC,
                D: opsiD
            },
            jawaban_benar: kunciJawaban,
            timestamp: new Date() // Menyimpan waktu soal dibuat
        });
        
        alert("Berhasil! Soal telah ditambahkan dengan ID: " + docRef.id);
        
        // Mengosongkan form kembali untuk soal berikutnya
        document.getElementById('teksSoal').value = '';
        document.getElementById('opsiA').value = '';
        document.getElementById('opsiB').value = '';
        document.getElementById('opsiC').value = '';
        document.getElementById('opsiD').value = '';
        
    } catch (e) {
        console.error("Gagal menambahkan soal: ", e);
        alert("Terjadi kesalahan. Cek console untuk detail.");
    }
});
