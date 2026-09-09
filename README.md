# Clinic Information System

Aplikasi Mini Clinic Information System, mencakup pengelolaan data pasien, pendaftaran kunjungan, pengelolaan antrean, hingga pencatatan hasil pemeriksaan dokter (SOAP), dibangun untuk Technical Assignment Programmer.

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React.js (Vite), MUI (tema Material 3) |
| Backend | Node.js + Express.js 5 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Authentication | JSON Web Token (JWT) |
| Validasi | Joi |
| Linter | Oxlint |

---

## Prasyarat

Pastikan sudah terinstall di komputer kamu:
- **Node.js** versi 20.19+ atau 22.12+
- **PostgreSQL** (sudah berjalan/running)
- **npm**
- **Git**

---

## Cara Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/AkmalD/Clinic-Information-System.git
   cd Clinic-Information-System
   ```

2. Install dependency backend:
   ```bash
   cd backend
   npm install
   ```

3. Install dependency frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Siapkan file environment variable (lihat bagian [Konfigurasi Environment Variables]).

5. Jalankan migrasi & seed database (lihat bagian [Migrasi Database]).

---

## Konfigurasi Environment Variables

Di dalam folder `backend/`, copy `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi setiap variabel sesuai environment lokal kamu:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server backend berjalan (default: 3000) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Kredensial koneksi PostgreSQL lokal |
| `DATABASE_URL` | Connection string lengkap yang dibaca Prisma, format: `postgresql://{user}:{password}@{host}:{port}/{db_name}`, pastikan nilainya konsisten dengan variabel di atas |
| `JWT_SECRET` | String rahasia untuk sign/verify JWT. **Wajib diganti**, jangan pakai nilai default. Generate dengan: `openssl rand -base64 32` (atau `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` kalau `openssl` tidak tersedia) |
| `JWT_EXPIRES_IN` | Masa berlaku token, contoh: `1h`, `1d`, `7d` |

---

## Migrasi Database

Pastikan database dengan nama sesuai `DB_NAME` di `.env` sudah dibuat di PostgreSQL, lalu dari folder `backend/`:

1. **Jalankan migrasi** (membuat seluruh tabel + constraint sesuai skema):
   ```bash
   npx prisma migrate dev
   ```
   Perintah ini akan menjalankan seluruh file migrasi di `backend/prisma/migrations/` secara berurutan, membuat 11 tabel: `users`, `poli`, `doctors`, `medicines`, `patients`, `registrations`, `queues`, `medical_records`, `medical_actions`, `prescriptions`, `prescription_items`.

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Jalankan seeder** (membuat akun default & master data awal):
   ```bash
   npx prisma db seed
   ```
   Lihat kredensial akun yang dihasilkan di bagian [Akun Login Default] di bawah.

---

## Cara Menjalankan Aplikasi

**Backend:**
```bash
cd backend
npm run dev
```
Server berjalan di `http://localhost:3000`. Cek kesehatan server via `GET /api/health`.

**Frontend:**
```bash
cd frontend
npm run dev
```
Aplikasi berjalan di `http://localhost:5173` (default port Vite).

---

## Akun Login Default

Hasil dari `npx prisma db seed`:

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Dokter | `dokter1` | `dokter123` |
| Petugas Pendaftaran | `petugas1` | `petugas123` |

---

## Struktur Project

```
Clinic-Information-System/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/     # auth, user, patient, doctor, poli, medicine,
│   │   │                    # registration, queue, medicalRecord, prescription, dashboard
│   │   ├── services/        # business logic per modul (nama sama dengan controller)
│   │   ├── routes/          # definisi endpoint + role per modul
│   │   ├── middlewares/     # authenticate, authorize, validate, errorHandler
│   │   ├── validations/     # skema Joi per modul
│   │   ├── utils/           # appError, response wrapper, tokenBlacklist
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # client Axios dan fungsi request per modul
│   │   ├── components/      # layout dan komponen bersama
│   │   ├── context/         # AuthContext untuk login/logout
│   │   ├── pages/           # auth, dashboard, pasien, pendaftaran, pemeriksaan
│   │   ├── routes/          # protected routes aplikasi
│   │   └── theme/           # konfigurasi tema Material UI
│   ├── public/
│   ├── .env.example
│   └── package.json
├── erd/
│   └── ERD.jpg
├── sql/
│   └── clinic-information-system.sql
├── postman/
│   └── ClinicInformationSystem_postman_collection.json
└── README.md
```

---

## Daftar API Endpoint

Base URL: `http://localhost:3000/api`. Semua endpoint (kecuali `/auth/login` dan `/health`) wajib header `Authorization: Bearer <token>`.

### Authentication
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, mengembalikan JWT token |
| POST | `/auth/logout` | Semua | Blacklist token yang sedang dipakai |
| GET | `/auth/me` | Semua | Info user yang sedang login |

### Users (manajemen akun)
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/users` | Admin | List akun (`?role=` filter) |
| GET | `/users/:id` | Admin | Detail akun |
| POST | `/users` | Admin | Buat akun baru |
| PUT | `/users/:id` | Admin | Update (termasuk reset password) |
| DELETE | `/users/:id` | Admin | Nonaktifkan akun (soft delete) |

### Patients
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/patients` | Semua | List, `?search=&page=&limit=` |
| GET | `/patients/:id` | Semua | Detail |
| POST | `/patients` | Admin, Petugas | Tambah (no. RM auto-generate) |
| PUT | `/patients/:id` | Admin, Petugas | Partial update |
| DELETE | `/patients/:id` | Admin, Petugas | Hapus |

### Doctors & Poli
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/doctors` | Semua | List, `?poliId=` filter |
| GET / POST / PUT / DELETE | `/doctors/:id` | Admin (GET: Semua) | CRUD, `userId` opsional untuk link akun |
| GET / POST / PUT / DELETE | `/poli/:id` | Admin (GET: Semua) | CRUD sederhana |

### Medicines
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/medicines` | Admin, Dokter | List obat, `?search=` (read-only, data dari seeder) |

### Registrations
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/registrations` | Semua | List, `?date=&status=` |
| GET | `/registrations/:id` | Semua | Detail |
| POST | `/registrations` | Petugas | Buat pendaftaran, status awal `MENUNGGU` |
| PUT | `/registrations/:id` | Petugas | Edit field / transisi status |

### Queue
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/queues` | Semua | List, `?tanggal=&poliId=&status=` (default: hari ini) |
| POST | `/queues` | Petugas | Generate nomor antrean untuk 1 `registrationId` |
| PUT | `/queues/:id/call` | Dokter | Panggil antrean; otomatis update status Registration jadi `PEMERIKSAAN` |
| PUT | `/queues/:id/status` | Petugas, Dokter | Hanya transisi `DIPANGGIL → SELESAI` |

### Medical Record (SOAP)
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/medical-records` | Dokter | Simpan SOAP + Tindakan Medis (nested) |
| GET | `/medical-records/:patientId` | Admin, Dokter | Riwayat pemeriksaan pasien |

### Prescription
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/prescriptions` | Dokter | Simpan resep (1 atau lebih item obat) |
| GET | `/prescriptions/:id` | Admin, Dokter | Detail resep |

### Dashboard
| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/dashboard/summary` | Semua | Ringkasan 5 metrik sesuai spesifikasi |

---

## Postman Collection

File collection ada di `postman/ClinicInformationSystem_postman_collection.json`, sudah termasuk contoh request untuk semua endpoint.

**Cara pakai**: buka folder **Auth**, jalankan salah satu dari 3 request "Login sebagai Admin/Dokter/Petugas" terlebih dahulu, script di tab Scripts otomatis menyimpan token ke collection variable (`admin_token`, `dokter_token`, `petugas_token`). Seluruh request lain di folder lain sudah otomatis memakai variable tersebut sesuai role yang dibutuhkan, tidak perlu copy-paste token manual.

Pengujian endpoint dilakukan secara manual menggunakan collection tersebut. Alur utama yang perlu diverifikasi adalah login per role, CRUD pasien, pendaftaran, generate antrean, check-in, panggil antrean, simpan SOAP, simpan resep, dan menyelesaikan kunjungan.

## ERD

File ERD ada di `erd/ERD.jpg`.

---

## Asumsi & Penyederhanaan

**Umum**
- **Logout** diimplementasikan dengan token blacklist in-memory. Cukup untuk kebutuhan demo (server tidak restart selama digunakan); untuk skenario production idealnya diganti Redis atau tabel database.

**Master Data**
- **No. Rekam Medis** menggunakan format `{tahun}-{6 digit id pasien}` (contoh: `2026-000001`), diambil dari `id` auto-increment pasien, bukan counter yang di-reset per tahun, supaya keunikan terjamin tanpa risiko race condition.
- **`PUT /patients/{id}`** diimplementasikan sebagai *partial update* (hanya field yang dikirim di body yang diperbarui), bukan full-replace ala REST murni, karena dokumen soal tidak mendefinisikan method `PATCH` terpisah dan ini lebih praktis untuk form edit di frontend.
- **`Doctor.userId`** bersifat nullable, data master dokter bisa ditambahkan admin terlebih dahulu, akun login untuk dokter tersebut bisa menyusul kemudian lewat modul Users. Jika role akun yang sudah tertaut diubah dari `DOKTER` ke role lain setelahnya, sistem tidak otomatis melepas kaitannya, edge case yang disadari, jarang terjadi di skenario demo.
- **User tidak pernah dihapus permanen** (`DELETE /users/:id` hanya menonaktifkan / soft delete), karena `id`-nya dipakai sebagai referensi historis di `Registration.createdBy` dan `Doctor.userId`.
- **Medicines** cuma disediakan endpoint `GET` (read-only), data master obat cukup diisi lewat seeder, CRUD penuh tidak diminta di spesifikasi minimum.

**Pendaftaran & Antrean**
- Poli yang dipilih saat pendaftaran **wajib sama** dengan poli tempat dokter yang dipilih berpraktik, divalidasi di backend.
- **Nomor antrean** direset per hari berdasarkan `tanggalKunjungan` (tanggal kunjungan yang dipilih), bukan tanggal server saat data dibuat, format `A001`, `A002`, dst, tidak dipisah per poli.
- Pembuatan nomor antrean (`POST /queues`) adalah **endpoint terpisah** dari pembuatan pendaftaran (`POST /registrations`), sesuai spesifikasi API, flow di frontend akan memanggil keduanya berurutan.
- Status kunjungan (`Menunggu → Check In → Pemeriksaan → Selesai`) dan status antrean (`Menunggu → Dipanggil → Selesai`) **hanya boleh maju satu langkah**, tidak bisa lompat atau mundur, divalidasi di backend.
- **`PUT /queues/:id/call`** memvalidasi pasien harus sudah berstatus `Check In` terlebih dahulu, dan otomatis mengubah status Registration menjadi `Pemeriksaan` dalam satu transaksi database.
- **`PUT /queues/:id/status`** sengaja dibatasi hanya untuk transisi `Dipanggil → Selesai`, transisi `Menunggu → Dipanggil` wajib lewat `/call` karena ada efek samping (cascade) ke status Registration yang tidak ingin dilewati.
- Registration **tidak bisa diubah menjadi `Selesai`** sebelum ada catatan pemeriksaan (SOAP) tersimpan untuk kunjungan tersebut; saat berhasil menjadi `Selesai`, status Antrean terkait otomatis ikut menjadi `Selesai`.

**Pemeriksaan (SOAP) & Resep**
- `patientId` dan `doctorId` pada Medical Record diambil otomatis dari data Registration terkait, bukan input ulang dari frontend, menghindari inkonsistensi data.
- Medical Record hanya bisa dibuat jika Registration berstatus `Pemeriksaan` (pasien sudah dipanggil), dan maksimal 1 Medical Record per Registration.
- Petugas Pendaftaran **tidak diberi akses** membaca data Medical Record maupun Resep (data klinis sensitif), hanya Admin dan Dokter.

**Dashboard**
- Seluruh metrik "hari ini" dihitung berdasarkan `tanggalKunjungan`/`tanggal` (tanggal kunjungan), bukan `createdAt`.
- "Total Pasien Hari Ini" dihitung dari jumlah **pendaftaran/kunjungan** hari ini, bukan jumlah pasien unik, 1 pasien datang 2x hari ini terhitung 2.
- Data dashboard sama untuk semua role, tidak dibedakan per role sebagai penyederhanaan.
