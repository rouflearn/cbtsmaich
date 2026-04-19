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

// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API_KEY_ANDA",
  authDomain: "cbt-cikalharapan.firebaseapp.com",
  projectId: "cbt-cikalharapan",
  storageBucket: "cbt-cikalharapan.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
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
