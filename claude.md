# CLAUDE.md --- ARJUNA

Panduan Pengembangan Produk Digital. Dokumen ini menjadi pedoman utama saat membaca, merancang, mengubah, dan mengembangkan proyek ARJUNA.

## 1. Identitas dan Konteks Proyek
- **Nama produk**: ARJUNA
- **Nama lengkap**: ARJUNA: Platform Pembelajaran Wayang Kulit Interaktif Berbasis Hand Tracking
- **Kategori**: Inovasi Digital
- **Subtema**: Pembelajaran dan Edukasi Digital Berbasis Budaya
- **Kompetisi**: BUDAYA GO! 2026
- **Tim**: Pengen Terbang
- **Institusi**: Politeknik Negeri Lhokseumawe, Aceh

ARJUNA adalah platform pembelajaran budaya berbasis web yang membantu pengguna belajar wayang kulit secara aktif. Pengguna mengenal tokoh dan cerita wayang, lalu menggerakkan objek wayang digital menggunakan gerakan tangan yang ditangkap kamera perangkat.

### Visi Produk
Mengubah pembelajaran wayang kulit dari pengalaman menonton pasif menjadi pengalaman belajar interaktif yang menggabungkan:
1. Pengenalan tokoh, karakter, dan nilai filosofis wayang.
2. Praktik gerakan dasar pedalangan melalui *hand tracking*.
3. Pembelajaran cerita berbasis rangkaian adegan (*story-based learning*).
4. Dialog dan karakter vokal tokoh (*antawacana*).
5. Visi jangka panjang berupa pengalaman pertunjukan wayang virtual berbasis Virtual Reality (VR).

> Teknologi harus menjadi sarana pendukung dokumentasi dan pembelajaran budaya, bukan pengganti dalang, sanggar, atau praktik pertunjukan langsung.

## 2. Status Produk: Jangan Mengarang Fitur
Bedakan dengan tegas antara fitur yang sudah berjalan dan rencana pengembangan. Jangan menampilkan fitur rencana seolah-olah sudah selesai.

### Sudah berfungsi pada versi awal (Frontend Client-Side)
- Platform pembelajaran berbasis web (React 18 + TypeScript + Vite + Tailwind CSS).
- Akses melalui browser desktop dengan webcam (`getUserMedia`).
- Izin dan akses kamera pengguna yang diproses 100% di sisi klien/browser (tanpa mengunggah video ke backend).
- *Hand tracking* secara *real-time* dan *markerless* menggunakan `@mediapipe/tasks-vision` (Hand Landmarker 21 titik per tangan, hingga 2 tangan / 42 titik).
- Pemetaan koordinat/gerakan tangan (`coordinateMapping`, `gestureRecognition`, `landmarkSmoothing`) menjadi kendali objek wayang digital pada Canvas 2D (`PuppetController`, `PuppetMovement`, `PuppetAnimation`).
- Pengenalan 4 tokoh wayang (Arjuna, Gatotkaca, Srikandi, Semar), Tutorial Gerakan, Studio 1 & 2 Wayang, 5 Level tantangan dasar (disimpan di `localStorage`), dan Mode Adu Sabetan (latihan gerak 2 tangan / vs AI).

### Rencana tahap menengah (Belum Aktif / Dalam Pengembangan)
- Backend / API / Database belum diterapkan pada versi awal (tetap frontend-only).
- Level dikembangkan menjadi rangkaian *scene* cerita pewayangan utuh.
- Narasi dan audio dialog karakter (*antawacana*) sesuai skenario *scene* sambil tangan pengguna tetap memegang kendali gerak wayang.
- Penyempurnaan variasi gestur agar lebih sesuai dengan kaidah gerak pedalangan (*sabetan*).
- Validasi cerita, dialog, dan gerakan bersama dalang atau sanggar.
- Pengujian terukur pada pengguna dan lembaga pendidikan.

### Visi jangka panjang
- ARJUNA VR Experience & simulasi ruang pertunjukan virtual.
- Simulasi memegang dan memainkan wayang menggunakan perangkat/controller VR.
- Ekspansi ke ragam wayang Nusantara lainnya.
- Antarmuka multibahasa Indonesia–Inggris.

## 3. Landasan Budaya dan Terminologi
Gunakan istilah budaya secara konsisten dan sesuai konteks:
- **Wayang kulit**: seni pertunjukan tradisional yang memadukan rupa/tatahan, sastra tutur, iringan, cerita, dan keterampilan dalang.
- **Dalang**: pelaku utama yang menghidupkan dan memainkan tokoh wayang.
- **Sabetan**: kaidah atau keterampilan gerak dalam memainkan wayang.
- **Antawacana**: karakter vokal/dialog tokoh dalam pertunjukan wayang.
- **Punakawan, Pandawa, dan tokoh lain**: tampilkan dengan nama, karakter, dan konteks yang benar.
- **Scene**: satu adegan atau bagian cerita yang memiliki konteks, tokoh, dialog, dan tujuan pembelajaran.
- **Markerless hand tracking**: pelacakan tangan menggunakan kamera tanpa kartu/marker fisik.

Materi cerita, karakter, simbol, dialog, dan gerakan harus menghormati tradisi pewayangan. Jika materi budaya belum memiliki rujukan atau validasi dari dalang/sanggar terkait, tandai secara jujur sebagai draf edukasi yang perlu divalidasi.

## 4. Prinsip Pengalaman Pengguna
- Mudah dipahami oleh pengguna pemula (pelajar, mahasiswa, masyarakat umum).
- Mengutamakan pengalaman belajar, bukan sekadar efek visual berlebihan.
- Instruksi yang jelas sebelum kamera diaktifkan (jangan memaksa kamera menyala otomatis sebelum pengguna membaca tujuan & panduan penempatan tangan).
- Umpan balik visual saat tangan terdeteksi maupun petunjuk saat tangan belum terdeteksi (`camera_idle`, `camera_requesting`, `camera_denied`, `camera_unavailable`, `hand_not_detected`, `hand_detected`, `error`).
- Ramah untuk penggunaan di desktop/laptop berkamera tanpa perangkat khusus pada versi awal.

## 5. Pedoman Hand Tracking, Privasi, dan Keamanan
- Pemrosesan citra kamera dilakukan secara lokal di memori browser (*on-device/in-browser processing*). Sistem tidak merekam, mengunggah, atau menyimpan aliran video ke server.
- Hentikan *stream* kamera otomatis saat pengguna mematikan kamera atau berpindah/keluar halaman.
- Berikan panduan perbaikan kondisi (pencahayaan terlalu gelap, latar ramai, jarak 40–60 cm, tangan terpotong tepi kamera, gerakan terlalu cepat).
- Jangan pernah mengklaim akurasi AI 100%.

## 6. Arsitektur dan Teknologi Aktual
Sesuai aturan bagian 9 dokumen panduan (*jika proposal dan implementasi aktual berbeda, prioritaskan kondisi kode untuk pekerjaan teknis dan laporkan perbedaannya*):
- **Implementasi aktual repository saat ini**: React `18.3.1` + TypeScript `~5.6.2` + Vite `^5.4` + Tailwind CSS `^3.4` + `@mediapipe/tasks-vision` `^0.10.20` + Vitest `^2.1.8` (Frontend-only SPA, seluruh aset WASM & model `hand_landmarker.task` tersedia lokal di `public/`).
- **Catatan**: Dokumen proposal awal sempat menyebut Laravel untuk web versi awal dan rencana backend/scene cerita lanjutan; saat ini proyek berjalan penuh di sisi klien browser tanpa backend terlebih dahulu sesuai arahan tim (*frontend-only first*).

### Pemisahan Modul Saat Ini
- Akses kamera & stream: `src/hooks/useCamera.ts`, `src/components/camera/WebcamFeed.tsx`
- MediaPipe & smoothing & gesture: `src/computer-vision/`
- Kontrol & rendering wayang Canvas 2D: `src/puppet-engine/`, `src/components/puppet/`
- Logika level, skor, dan lencana lokal: `src/game/`
- Halaman antarmuka pengguna: `src/pages/`

## 7. Pengujian dan Validasi
- Jalankan `npm run test` dan `npm run build` setiap melakukan perubahan kode.
- Jangan mengarang hasil uji, mitra validasi budaya, harga komersial tetap, atau URL demo/hosting yang belum dikonfirmasi tim.

### Informasi yang Masih Berupa Placeholder / Belum Dikonfirmasi Tim
- URL demo resmi ARJUNA & URL repository kode sumber.
- Penyedia hosting deployment aktual.
- Struktur backend/database jika nanti ditambahkan pada tahap lanjutan.
- Daftar tokoh, naskah scene cerita, dialog *antawacana*, serta validator dalang/sanggar yang telah bekerja sama resmi.
- Hasil uji pengguna formal pada sekolah/sanggar.
