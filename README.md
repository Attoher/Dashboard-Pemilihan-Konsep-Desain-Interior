# Dashboard Pemilihan Konsep Desain Interior

<img width="1919" height="992" alt="image" src="https://github.com/user-attachments/assets/993a80e7-cc0a-4ab6-888d-aa7a02b8ccad" />

Aplikasi web dashboard untuk evaluasi dan pemilihan konsep desain interior berdasarkan Diagram Rating Kinerja. Dashboard ini digunakan untuk menilai dan membandingkan konsep desain dari tiga kategori penilaian, mengumpulkan ide-ide penting, serta menghasilkan laporan hasil dalam format PDF.


## Deskripsi

Aplikasi ini merupakan tools bantu untuk proses pemilihan konsep desain interior yang terdiri dari tiga halaman utama:

1. **Dashboard Penilaian** - Halaman utama untuk mengisi skor penilaian pada tiga kategori: Kinerja Internal, Customer, dan Persaingan. Setiap kategori memiliki beberapa kriteria yang dinilai dengan skala tertentu.

2. **Halaman Ide Penting** - Halaman untuk mengumpulkan dan mengelola ide-ide penting dari setiap kategori, termasuk penugasan ruangan untuk setiap ide.

3. **Halaman Hasil** - Menampilkan ringkasan hasil penilaian lengkap dengan rata-rata skor per kategori, kategori pemenang, dan opsi ekspor ke PDF.


## Teknologi yang Digunakan

- **HTML5** - Struktur halaman web
- **CSS3** - Styling dan layout responsif (mendukung tampilan desktop dan mobile)
- **JavaScript (Vanilla)** - Logika aplikasi tanpa framework tambahan
- **html2pdf.js v0.10.1** - Library untuk mengekspor halaman ke format PDF (dimuat via CDN)
- **localStorage** - Penyimpanan data lokal di browser untuk menyimpan skor penilaian, data ide, dan identitas pengguna


## Struktur Folder

```
Dashboard-Pemilihan-Konsep-Desain-Interior/
  index.html              Halaman utama (Dashboard Penilaian)
  README.md
  assets/
    Interior.png           Gambar header halaman hasil
    Logo.png               Logo aplikasi
  css/
    style.css              Seluruh styling aplikasi
  js/
    script.js              Logika dashboard dan data kategori
    ideas.js               Logika halaman ide penting
  pages/
    ideas.html             Halaman pengumpulan ide penting
    result.html            Halaman hasil penilaian
```


## Fitur Utama

- Penilaian konsep desain dengan tiga kategori (Kinerja Internal, Customer, Persaingan)
- Input identitas mahasiswa dan judul tugas studio
- Visualisasi chart skor per kategori
- Penentuan kategori pemenang berdasarkan rata-rata skor tertinggi
- Pengumpulan ide penting per kategori dengan penugasan ruangan
- Ekspor data ide dan hasil penilaian ke format PDF
- Penyimpanan data otomatis menggunakan localStorage
- Tampilan responsif untuk desktop dan perangkat mobile


## Cara Penggunaan

1. Buka file index.html di browser.
2. Isi identitas (Nama Mahasiswa dan Judul Tugas Studio).
3. Masukkan skor penilaian untuk setiap kriteria di ketiga kategori.
4. Klik tombol "Proses Seleksi" untuk melihat hasil perbandingan.
5. Gunakan tombol "Lihat Detail" pada modal hasil untuk melihat rincian per kategori.
6. Navigasi ke halaman Ide Penting untuk mengelola ide dan penugasan ruangan.
7. Gunakan fitur ekspor PDF untuk mencetak atau menyimpan hasil.


## Deployment

Aplikasi ini di-deploy menggunakan Vercel dan source code tersedia di GitHub.

- Repository: https://github.com/Attoher/Dashboard-Pemilihan-Konsep-Desain-Interior.git
