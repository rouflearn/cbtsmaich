// ==========================================
// 1. IMPORT SEMUA MODUL FIREBASE (VERSI 10.8.1)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 2. KONFIGURASI & INISIALISASI FIREBASE
// ==========================================
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

// ==========================================
// 3. VARIABEL GLOBAL & DOM ELEMENTS
// ==========================================
let sisaWaktuDetik = 0;
let timerInterval;

const loginSection = document.getElementById('login-section');
const examSection = document.getElementById('exam-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const questionsContainer = document.getElementById('questions-container');

// (Asumsi data soal disimpan di sini nanti saat diload)
let examData = []; 

// ==========================================
// 4. LOGIKA LOGIN & PANTAU STATUS
// ==========================================
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika sudah login, tampilkan halaman ujian
        loginSection.style.display = 'none';
        examSection.style.display = 'block';
        loadQuestions();
    } else {
        // Jika belum login, tampilkan form login
        loginSection.style.display = 'block';
        examSection.style.display = 'none';
    }
});

// ==========================================
// 5. LOGIKA UJIAN (AMBIL SOAL & TIMER)
// ==========================================
async function loadQuestions() {
    const mapelID = "soal_biologi_x"; // ID Ujian
    
    try {
        // Ambil Durasi dari Database
        const examSnap = await getDoc(doc(db, "exams", mapelID));
        if (examSnap.exists()) {
            const dataUjian = examSnap.data();
            let durasiDariGuru = dataUjian.durasi; 
            
            sisaWaktuDetik = durasiDariGuru * 60;
            startTimer(); 
        }

        // NOTE: Logika pengambilan getDocs(collection(db, mapelID)) untuk merender soal 
        // ke HTML ditambahkan di sini nantinya.

    } catch (error) {
        console.error("Gagal memuat ujian:", error);
    }
}

function startTimer() {
    const timeDisplay = document.getElementById('time');
    
    timerInterval = setInterval(() => {
        let menit = Math.floor(sisaWaktuDetik / 60);
        let detik = sisaWaktuDetik % 60;
        
        timeDisplay.textContent = 
            (menit < 10 ? "0" + menit : menit) + ":" + 
            (detik < 10 ? "0" + detik : detik);
            
        if (sisaWaktuDetik <= 0) {
            clearInterval(timerInterval);
            alert("Waktu habis! Jawaban Anda akan dikirim otomatis.");
            submitExam(); 
        }
        sisaWaktuDetik--;
    }, 1000);
}

// ==========================================
// 6. LOGIKA SUBMIT JAWABAN
// ==========================================
document.getElementById('btnSubmit').addEventListener('click', () => {
    if(confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) {
        clearInterval(timerInterval);
        submitExam();
    }
});

async function submitExam() {
    const uidSiswa = auth.currentUser.uid; 
    let skor = 0;
    let totalSoal = 0;

    examData.forEach((soal, index) => {
        totalSoal++;
        const no = index + 1;
        const jawabanSiswa = document.querySelector(`input[name="q${no}"]:checked`);
        
        if (jawabanSiswa && jawabanSiswa.value === soal.jawaban_benar) {
            skor += 1;
        }
    });

    const nilaiAkhir = totalSoal > 0 ? Math.round((skor / totalSoal) * 100) : 0;

    try {
        await addDoc(collection(db, "results"), {
            uid_siswa: uidSiswa,
            id_ujian: "soal_biologi_x", 
            nilai: nilaiAkhir,
            benar: skor,
            salah: totalSoal - skor,
            waktu_selesai: new Date()
        });

        alert(`Ujian selesai! Nilai Anda: ${nilaiAkhir}`);
        window.location.href = "login.html"; 

    } catch (e) {
        console.error("Gagal menyimpan nilai: ", e);
        alert("Gagal menyimpan jawaban, silakan hubungi pengawas.");
    }
}
