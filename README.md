# ARJUNA

Platform pembelajaran wayang kulit interaktif berbasis React, TypeScript, Vite,
Tailwind CSS, dan MediaPipe untuk pelacakan tangan melalui webcam.

## Persiapan lokal

- Pasang Node.js dan npm.
- Gunakan browser desktop dengan webcam untuk mencoba fitur pelacakan tangan.
- Jalankan perintah berikut dari direktori proyek:

```sh
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite di terminal, biasanya
`http://localhost:5173`. Hentikan server dengan `Ctrl+C`.

Proyek saat ini berjalan sepenuhnya di browser. Tidak diperlukan backend,
database, API key, atau file `.env`. Progres belajar disimpan di `localStorage`
browser.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm ci` | Memasang versi dependensi sesuai `package-lock.json`. |
| `npm run dev` | Menjalankan server pengembangan. |
| `npm test` | Menjalankan pengujian dengan Vitest. |
| `npm run build` | Memeriksa TypeScript dan menghasilkan build di `dist/`. |
| `npm run preview` | Menyajikan hasil build lokal setelah `npm run build`. |

## Kamera dan aset hand tracking

Buka aplikasi melalui `localhost` saat pengembangan atau HTTPS saat dihosting,
lalu izinkan akses kamera ketika menggunakan fitur yang memerlukannya.

Model dan runtime MediaPipe sudah tersedia di repository:

- `public/models/hand_landmarker.task`
- `public/mediapipe/wasm/`

Aplikasi mencoba aset lokal terlebih dahulu, lalu menggunakan CDN jika aset
lokal tidak tersedia. Font Google dan fallback CDN memerlukan koneksi internet.

Pedoman produk dan pengembangan tersedia di [claude.md](claude.md).

## Paket aset visual

Katalog aset ARJUNA tersedia di
[public/assets/arjuna-kit/index.html](public/assets/arjuna-kit/index.html).
Saat server pengembangan berjalan, buka `/assets/arjuna-kit/index.html`.
Katalog juga dapat dibuka langsung secara offline.

Paket mencakup latar, ilustrasi tokoh, ikon, badge, pola, identitas merek,
template promosi, dan overlay video. Lihat
[panduan aset](public/assets/arjuna-kit/README.md) untuk format, sumber, dan
cara penggunaan. Aset belum dipasang menggantikan tampilan aplikasi.
