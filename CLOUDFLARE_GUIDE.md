# Panduan Deploy Discord Autopost Bot ke Cloudflare Pages & Server

Aplikasi ini sudah dikonfigurasi agar siap di-upload dan di-deploy menggunakan **Cloudflare Pages** untuk tampilan Frontend (UI Dashboard) dan server Node.js untuk Autopost Bot Engine.

---

## 📁 File Konfigurasi yang Telah Disiapkan:

1. **`wrangler.toml`**: Konfigurasi otomatis untuk Cloudflare Pages / Workers CLI.
2. **`public/_redirects`**: Aturan routing SPA (Single Page Application) agar tidak error 404 saat direfresh di Cloudflare.
3. **`package.json`**: Script pendukung `build:pages` dan `deploy:cloudflare`.

---

## 🚀 Cara Deploy ke Cloudflare Pages (Dashboard Frontend)

### Metode 1: Menggunakan Cloudflare Dashboard (Paling Mudah)

1. **Export / Download Source Code**:
   - Download atau Push source code aplikasi ini ke repository **GitHub** Anda.
2. **Buka Cloudflare Dashboard**:
   - Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
   - Klik **Create Application** > Pilih tab **Pages** > **Connect to Git**.
3. **Atur Build Settings**:
   - **Framework Preset**: `Vite` (atau `None`)
   - **Build Command**: `npm run build:pages`
   - **Build Output Directory**: `dist`
4. **Klik Save and Deploy**:
   - Cloudflare akan memproses build secara otomatis dan memberikan URL domain gratis (contoh: `https://discord-autopost-bot.pages.dev`).

---

### Metode 2: Deploy Langsung via Terminal (CLI Wrangler)

1. **Build Aplikasi**:
   ```bash
   npm run build:pages
   ```
2. **Login ke Cloudflare**:
   ```bash
   npx wrangler login
   ```
3. **Upload / Deploy**:
   ```bash
   npm run deploy:cloudflare
   ```

---

## ⚙️ Menghubungkan Backend Autopost Engine 24/7

Bot Autopost ini menggunakan proses Node.js background (`setInterval`) untuk mengirim pesan otomatis secara konsisten.

### Opsi A: Backend di Cloud Run / Railway / VPS + Frontend di Cloudflare Pages
1. Deploy file `server.ts` (menggunakan `npm run build` & `npm start`) ke VPS, Railway, atau Cloud Run.
2. Buka file `public/_redirects`, lalu hapus komentar pada baris berikut untuk memproksikan API:
   ```text
   /api/*  https://domain-backend-anda.com/api/:splat  200
   ```
3. Re-deploy ke Cloudflare Pages.

### Opsi B: Jalankan Full-Stack di Server / Cloud Run / VPS
Aplikasi ini sudah memiliki bundling otomatis via `esbuild`. Anda bisa langsung menjalankan perintah `npm run build` dan `npm start` di server Node.js pilihan Anda.
