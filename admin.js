import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBahvtobUXJUkIYmqyFOKxsdAcEt7WbK0E",
    authDomain: "cbt-smaich.firebaseapp.com",
    projectId: "cbt-smaich",
    storageBucket: "cbt-smaich.firebasestorage.app",
    messagingSenderId: "549681496019",
    appId: "1:549681496019:web:9e557b569413cdca3ff926"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'guru') {
            alert("Akses Ditolak! Anda bukan Guru.");
            window.location.href = "login.html"; 
        }
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById('btnSimpan').addEventListener('click', async () => {
    const mapel = document.getElementById('mapel').value;
    const teksSoal = document.getElementById('teksSoal').value;
    const opsiA = document.getElementById('opsiA').value;
    const opsiB = document.getElementById('opsiB').value;
    const opsiC = document.getElementById('opsiC').value;
    const opsiD = document.getElementById('opsiD').value;
    const kunciJawaban = document.getElementById('kunciJawaban').value;

    if(!mapel || !teksSoal || !opsiA || !opsiB || !opsiC || !opsiD) {
        alert("Mohon lengkapi semua kolom!");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, mapel), {
            teks_soal: teksSoal,
            opsi: { A: opsiA, B: opsiB, C: opsiC, D: opsiD },
            jawaban_benar: kunciJawaban,
            timestamp: new Date() 
        });
        
        alert("Berhasil! Soal telah ditambahkan dengan ID: " + docRef.id);
        
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
