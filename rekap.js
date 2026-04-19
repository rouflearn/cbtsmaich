import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// GABUNGAN FIRESTORE
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const tableBody = document.getElementById('tableBody');
const btnRefresh = document.getElementById('btnRefresh');

async function loadResults() {
    const mapel = document.getElementById('filterMapel').value;
    tableBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Memuat data nilai...</td></tr>";

    try {
        // 1. Ambil data dari koleksi 'results' berdasarkan mapel
        const q = query(collection(db, "results"), where("id_ujian", "==", mapel));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ""; // Bersihkan loading
        let no = 1;

        if (querySnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Belum ada data nilai masuk.</td></tr>";
            return;
        }

        // 2. Loop setiap hasil ujian
        for (const resDoc of querySnapshot.docs) {
            const resultData = resDoc.data();
            
            // Ambil nama siswa dari koleksi 'users' menggunakan uid_siswa
            const userSnap = await getDoc(doc(db, "users", resultData.uid_siswa));
            const namaSiswa = userSnap.exists() ? userSnap.data().nama : "Siswa Tidak Dikenal";
            
            // Format waktu
            const waktu = resultData.waktu_selesai.toDate().toLocaleString('id-ID');
            
            // Tentukan status lulus (Misal KKM 75)
            const statusClass = resultData.nilai >= 75 ? "lulus" : "remedial";
            const statusText = resultData.nilai >= 75 ? "Lulus" : "Remedial";

            const row = `
                <tr>
                    <td>${no++}</td>
                    <td>${namaSiswa}</td>
                    <td>${resultData.benar}</td>
                    <td>${resultData.salah}</td>
                    <td><strong>${resultData.nilai}</strong></td>
                    <td>${waktu}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }
    } catch (e) {
        console.error("Gagal memuat rekap: ", e);
        tableBody.innerHTML = "<tr><td colspan='7' style='text-align:center; color:red;'>Gagal mengambil data.</td></tr>";
    }
}

btnRefresh.addEventListener('click', loadResults);
loadResults(); // Panggil saat halaman pertama kali dibuka

// Tambahkan event listener untuk tombol ekspor di bagian bawah rekap.js
document.getElementById('btnExport').addEventListener('click', () => {
    exportToExcel();
});

function exportToExcel() {
    // 1. Ambil elemen tabel
    const table = document.querySelector("table");
    
    // 2. Gunakan SheetJS untuk mengonversi tabel HTML menjadi workbook
    const wb = XLSX.utils.table_to_book(table, { sheet: "Rekap Nilai" });
    
    // 3. Ambil nama mata pelajaran untuk nama file
    const mapel = document.getElementById('filterMapel').value;
    const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const fileName = `Nilai_CBT_${mapel}_${tanggal}.xlsx`;
    
    // 4. Perintah untuk mengunduh file
    XLSX.writeFile(wb, fileName);
    
    alert("File Excel sedang diunduh...");
}
