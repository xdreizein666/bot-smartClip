# RekaClip

Halo, selamat datang di dokumentasi RekaClip. Tools ini dibuat untuk memudahkan proses pembuatan konten video pendek secara otomatis. Kalau kamu pusing harus edit manual video panjang dari YouTube atau TikTok buat jadi konten viral di Shorts, Reels, atau TikTok, tools ini solusinya.

RekaClip adalah CLI (Command Line Interface) tool berbasis Node.js yang bertugas mendownload video, menganalisa durasi, dan secara cerdas memotongnya menjadi beberapa klip pendek berdurasi 30 detik. Tidak cuma asal potong, tools ini juga otomatis mengubah format video landscape memanjang menjadi portrait (9:16) biar pas banget di layar HP.

## Mekanisme Kerja

Buat kamu yang penasaran gimana tools ini bekerja di belakang layar:

1.  **Input Link**: Kamu memasukkan link video (TikTok atau YouTube).
2.  **Analisa Metadata**:
    *   Untuk **TikTok**, tools ini menggunakan API khusus (ScrapeCreators) buat ambil data video tanpa watermark.
    *   Untuk **YouTube**, tools ini memanfaatkan mesin `yt-dlp` yang sudah teruji cepat dan aman buat tarik data video kualitas tinggi.
3.  **Downloading**: Video mentah di-download dulu ke folder sementara.
4.  **Smart Clipping Strategy**: Nah ini bagian pintarnya. Tools ini punya beberapa "Strategi" buat milih bagian video mana yang diambil:
    *   **Viral Reaction**: Mengambil potongan di fase akhir video (50% - 90% durasi), biasanya di sini letak klimaks atau reaksinya.
    *   **Educational**: Mengambil potongan di awal (10% - 40%), pas buat intro atau penjelasan konsep.
    *   **Funny/Entertaining**: Mengambil potongan acak di tengah-tengah.
5.  **Auto Reframe**: Kalau video aslinya landscape (lebar), FFmpeg akan dipanggil buat melakukan *Center Crop* otomatis. Jadi video kamu langsung jadi vertikal 9:16 tanpa perlu edit manual lagi.
6.  **Output**: Hasil klip matang bakal muncul di folder `results`.

## Persiapan (Requirements)

Sebelum mulai, pastikan PC/Laptop kamu sudah siap tempur dengan syarat berikut:

*   **Node.js**: Wajib install karena ini jalan di environment JavaScript.
*   **FFmpeg**: Ini mesin utamanya. Kamu HARUS install FFmpeg dan pastikan perintah `ffmpeg` bisa jalan di terminal (sudah masuk PATH system variables). Kalau belum ada ini, tools gak bakal bisa potong video.
*   **Koneksi Internet**: Jelas butuh, buat download videonya.

## Instalasi

Gampang banget, ikuti langkah ini:

1.  Download atau Clone repository ini ke folder komputer kamu.
2.  Buka terminal atau CMD di folder tersebut.
3.  Jalankan perintah ini buat install semua library yang dibutuhkan:
    ```bash
    npm install
    ```
4.  Tunggu sampai selesai.

## Konfigurasi

Khusus kalau kamu mau pakai fitur download TikTok:
1.  Buka file `configTiktokData.json`.
2.  Isi bagian `keyscrape` dengan API Key dari ScrapeCreators (kalau kamu punya). Kalau cuma pakai YouTube, ini bisa diabaikan dulu.

## Cara Pakai

1.  Jalankan tools dengan perintah:
    ```bash
    node smartClip.js
    ```
2.  Akan muncul tampilan menu di terminal.
3.  Paste link video yang mau kamu proses.
4.  Tekan Enter dan biarkan bot bekerja.
5.  Duduk santai sambil ngopi. Bot akan menganalisa dan memotong video buat kamu.
6.  Cek folder `results` buat lihat hasilnya.

## Catatan Penting

Tools ini menggunakan library pihak ketiga dan API. Gunakan dengan bijak. Kualitas hasil crop otomatis tergantung pada posisi objek di video asli. Karena ini center crop (potong tengah), pastikan objek utama video kamu ada di tengah frame biar gak kepotong.

Selamat berkarya
