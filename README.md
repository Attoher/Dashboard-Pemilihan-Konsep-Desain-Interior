# Dashboard Pemilihan Konsep Desain Interior

<img width="1919" height="993" alt="image" src="https://github.com/user-attachments/assets/2a84401b-4c38-4d34-860c-b4a9deeb269e" />

Aplikasi web dashboard untuk evaluasi dan pemilihan konsep desain interior berdasarkan Diagram Rating Kinerja. Dashboard ini digunakan untuk menilai dan membandingkan konsep desain dari tiga kategori penilaian, mengumpulkan ide-ide penting, serta menghasilkan laporan hasil dalam format PDF.


## Deskripsi

Aplikasi ini merupakan tools bantu untuk proses pemilihan konsep desain interior yang terdiri dari tiga halaman utama:

1. **Dashboard Penilaian** - Halaman utama untuk mengisi skor penilaian pada tiga kategori: Kinerja Internal, Customer, dan Persaingan. Setiap kategori memiliki beberapa kriteria yang dinilai dengan skala tertentu.

2. **Halaman Ide Penting** - Halaman untuk mengumpulkan dan mengelola ide-ide penting dari setiap kategori, termasuk penugasan ruangan/tempat diletaknya ide. Dilengkapi gambar panduan arah konsep sesuai kategori.

3. **Halaman Hasil** - Menampilkan ringkasan hasil penilaian lengkap dengan prioritas & deskripsi, rata-rata skor & catatan per kategori, diagram perbandingan, preview idea & ruangan, serta opsi ekspor ke PDF.


## Teknologi yang Digunakan

- **HTML5** - Struktur halaman web
- **CSS3** - Styling dan layout responsif (mendukung tampilan desktop dan mobile)
- **JavaScript (Vanilla)** - Logika aplikasi tanpa framework tambahan
- **html2pdf.js v0.10.1** - Library untuk mengekspor halaman ke format PDF (dimuat via CDN)
- **Firebase Cloud Firestore (SDK compat v10.12.2)** - Database online untuk menyimpan skor penilaian, catatan, data ide, sumber pustaka, dan identitas pengguna (satu dokumen per NRP)


## Struktur Folder

```
Dashboard-Pemilihan-Konsep-Desain-Interior/
  index.html              Halaman utama (Dashboard Penilaian)
  README.md
  firestore.rules         Security rules Cloud Firestore
  assets/
    Interior.png           Gambar header halaman hasil
    Logo.png               Logo aplikasi
    Kinerja Internal - Arah Konsep.png   Gambar arah konsep Kinerja Internal
    Customer - Arah Konsep.png           Gambar arah konsep Customer
    Competition - Arah Konsep.png        Gambar arah konsep Persaingan
  css/
    style.css              Seluruh styling aplikasi
  js/
    firebase-config.js     Konfigurasi Firebase project
    db.js                  Helper baca/tulis Firestore
    custom-alert.js        Modal alert & konfirmasi
    script.js              Logika dashboard dan data kategori
    ideas.js               Logika halaman ide penting
  back-office/
    index.html             Rekap semua mahasiswa (/back-office)
  pages/
    ideas.html             Halaman pengumpulan ide penting
    result.html            Halaman hasil penilaian
```


## Fitur Utama

- Penilaian konsep desain dengan tiga kategori (Kinerja Internal, Customer, Persaingan)
- Input identitas mahasiswa dan judul tugas studio
- Visualisasi diagram perbandingan skor per kategori (HTML-based bar chart)
- Penentuan kategori pemenang berdasarkan rata-rata skor tertinggi
- Pengumpulan ide penting per kategori dengan penugasan ruangan/tempat diletaknya ide
- Gambar panduan arah konsep otomatis sesuai kategori terpilih
- Ekspor data ide dan hasil penilaian ke format PDF (mencakup prioritas, catatan, diagram, dan preview idea)
- Input sumber pustaka/web (minimal 5, maksimal 10 sumber) yang ditampilkan di halaman hasil dan PDF
- Penyimpanan data otomatis secara online di Firebase Firestore berdasarkan NRP, sehingga bisa dilanjutkan dari perangkat mana pun
- Tampilan responsif untuk desktop dan perangkat mobile


## Cara Penggunaan

1. Buka file index.html di browser.
2. Isi NRP lalu klik "Muat Data" (data lama dengan NRP yang sama akan dimuat dari server).
3. Isi identitas (Nama Mahasiswa dan Judul Tugas Studio).
4. Isi minimal 5 sumber pustaka/web yang digunakan sebagai referensi analisa.
5. Masukkan skor penilaian untuk setiap kriteria di ketiga kategori.
6. Klik tombol "Proses Seleksi" untuk melihat hasil perbandingan.
7. Gunakan tombol "Lihat Detail" pada modal hasil untuk melihat rincian per kategori.
8. Navigasi ke halaman Ide Penting untuk mengelola ide dan penugasan ruangan.
9. Gunakan fitur ekspor PDF untuk mencetak atau menyimpan hasil (termasuk sumber pustaka).


## Back Office

Rekap semua mahasiswa tersedia di **`/back-office`**. Tidak ada tautan ke halaman ini dari halaman mahasiswa, jadi alamatnya diketik langsung. Isinya:

- **Ringkasan:** jumlah mahasiswa, yang ide-idenya sudah lengkap, sebaran kategori pemenang, dan rata-rata skor.
- **Tabel mahasiswa:** pencarian, filter kategori, urutan, dan pembaruan realtime.
- **Detail per mahasiswa:** skor dan catatan, sumber pustaka, ide dan ruangan, serta tautan ke dashboard dan halaman hasil mahasiswa tersebut.
- **Export CSV** (bisa dibuka di Excel).
- **Hapus data** mahasiswa, dari ikon tempat sampah di tabel atau tombol di jendela detail, dengan konfirmasi. Penghapusan permanen.

Halaman ini **tidak memakai login**. Siapa pun yang tahu alamatnya bisa melihat rekap, dan `firestore.rules` mengizinkan daftar dan penghapusan dokumen `mahasiswa` untuk keperluan ini.

## Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com/), lalu aktifkan **Firestore Database**.
2. Tambahkan Web app di Project settings, salin objek konfigurasinya ke `js/firebase-config.js`.
3. Salin isi `firestore.rules` ke tab **Rules** di Firestore, lalu klik Publish.

Data disimpan di koleksi `mahasiswa`, dengan ID dokumen = NRP. Karena tanpa login, siapa pun yang mengetahui NRP dapat membuka dan mengubah data tersebut.


## Deployment

Aplikasi ini di-deploy menggunakan Vercel dan source code tersedia di GitHub.

- Repository: https://github.com/Attoher/Dashboard-Pemilihan-Konsep-Desain-Interior.git
