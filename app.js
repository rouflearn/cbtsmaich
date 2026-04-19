import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// GABUNGAN FIRESTORE (Hanya 1 baris ini saja untuk firestore)
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Tambahkan import ini di bagian atas app.js
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Variabel Global
let durasiUjian = 60; // Misalnya 60 menit
let sisaWaktuDetik = durasiUjian * 60;
let timerInterval;

// Fungsi Menjalankan Timer
function startTimer() {
    const timeDisplay = document.getElementById('time');
    
    timerInterval = setInterval(() => {
        let menit = Math.floor(sisaWaktuDetik / 60);
        let detik = sisaWaktuDetik % 60;
        
        // Format MM:SS
        timeDisplay.textContent = 
            (menit < 10 ? "0" + menit : menit) + ":" + 
            (detik < 10 ? "0" + detik : detik);
            
        if (sisaWaktuDetik <= 0) {
            clearInterval(timerInterval);
            alert("Waktu habis! Jawaban Anda akan dikirim otomatis.");
            submitExam(); // Paksa submit jika waktu habis
        }
        sisaWaktuDetik--;
    }, 1000);
}

// Panggil startTimer() di dalam onAuthStateChanged saat user == 'siswa'
// ... (di dalam blok if(user) yang mengarah ke examSection)
// loadQuestions();
// startTimer(); 

// Fungsi Koreksi dan Submit
document.getElementById('btnSubmit').addEventListener('click', () => {
    if(confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) {
        clearInterval(timerInterval);
        submitExam();
    }
});

async function submitExam() {
    const uidSiswa = auth.currentUser.uid; // Ambil ID siswa yang sedang login
    let skor = 0;
    let totalSoal = 0;

    // Ambil data soal yang sudah disimpan sebelumnya (Anda perlu menyimpan array soal saat loadQuestions)
    // Asumsi kita punya array global bernama `examData` berisi soal dan kunci jawaban
    
    examData.forEach((soal, index) => {
        totalSoal++;
        const no = index + 1;
        // Cari radio button yang dipilih siswa untuk soal ini
        const jawabanSiswa = document.querySelector(`input[name="q${no}"]:checked`);
        
        if (jawabanSiswa && jawabanSiswa.value === soal.jawaban_benar) {
            skor += 1;
        }
    });

    // Hitung Nilai Skala 100
    const nilaiAkhir = Math.round((skor / totalSoal) * 100);

    try {
        // Simpan ke Firestore koleksi 'results'
        await addDoc(collection(db, "results"), {
            uid_siswa: uidSiswa,
            id_ujian: "soal_biologi_x", // Sesuaikan dengan mapel yang sedang dikerjakan
            nilai: nilaiAkhir,
            benar: skor,
            salah: totalSoal - skor,
            waktu_selesai: new Date()
        });

        alert(`Ujian selesai! Nilai Anda: ${nilaiAkhir}`);
        window.location.href = "login.html"; // Atau ke halaman dashboard siswa

    } catch (e) {
        console.error("Gagal menyimpan nilai: ", e);
        alert("Gagal menyimpan jawaban, silakan hubungi pengawas.");
    }
}

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


// DOM Elements
const loginSection = document.getElementById('login-section');
const examSection = document.getElementById('exam-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const questionsContainer = document.getElementById('questions-container');

// Fungsi Login
btnLogin.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Login berhasil!");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Pantau Status Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginSection.style.display = 'none';
        examSection.style.display = 'block';
        loadQuestions();
    } else {
        // User is signed out
        loginSection.style.display = 'block';
        examSection.style.display = 'none';
    }
});

// Fungsi Mengambil Soal dari Firestore
async function loadQuestions() {
    const mapelID = "soal_biologi_x"; // Ini bisa dibuat dinamis nanti
    
    try {
        // 1. Ambil Durasi dari Database
        const examSnap = await getDoc(doc(db, "exams", mapelID));
        if (examSnap.exists()) {
            const dataUjian = examSnap.data();
            let durasiDariGuru = dataUjian.durasi; // Ambil angka menit
            
            // Set sisa waktu global
            sisaWaktuDetik = durasiDariGuru * 60;
            startTimer(); // Jalankan timer setelah durasi didapat
        }

        // 2. Ambil Soal (seperti kode sebelumnya)
        // ... getDocs(collection(db, mapelID)) ...
        
    } catch (error) {
        console.error("Gagal memuat ujian:", error);
    }
}
