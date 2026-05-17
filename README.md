# OpenJob API

RESTful API untuk aplikasi rekrutmen internal berbasis Express.js dan PostgreSQL.

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL (via `pg`)
- **Migration**: `node-pg-migrate`
- **Validation**: Joi
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **File Upload**: Multer
- **Dev**: nodemon

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Buat Database PostgreSQL

```sql
CREATE DATABASE openjob_db;
```

### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env` lalu isi sesuai konfigurasi lokal:

```bash
cp .env.example .env
```

Isi variabel berikut di `.env`:

```
HOST=localhost
PORT=5000

PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=openjob_db
PGHOST=localhost
PGPORT=5432

ACCESS_TOKEN_KEY=your_super_secret_access_token_key
REFRESH_TOKEN_KEY=your_super_secret_refresh_token_key
```

### 4. Jalankan Migrasi

```bash
npm run migrate
```

### 5. Jalankan Server

```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:5000`

---

## Struktur Proyek

```
openjob-api/
├── server.js                      # Entry point
├── src/
│   ├── app.js                     # Express app setup
│   ├── config/
│   │   └── database.js            # PostgreSQL pool
│   ├── migrations/                # node-pg-migrate migration files
│   │   ├── 1769591657551_create-table-users.js
│   │   ├── 1769591657552_create-table-companies.js
│   │   ├── 1769591657553_create-table-categories.js
│   │   ├── 1769591657554_create-table-jobs.js
│   │   ├── 1769591657555_create-table-applications.js
│   │   ├── 1769591657556_create-table-bookmarks.js
│   │   ├── 1769591657557_create-table-authentications.js
│   │   └── 1769591657558_create-table-documents.js
│   ├── handlers/                  # Route handlers
│   │   ├── usersHandler.js
│   │   ├── authenticationsHandler.js
│   │   ├── companiesHandler.js
│   │   ├── categoriesHandler.js
│   │   ├── jobsHandler.js
│   │   ├── applicationsHandler.js
│   │   ├── bookmarksHandler.js
│   │   ├── allBookmarksHandler.js
│   │   ├── documentsHandler.js
│   │   └── profileHandler.js
│   ├── services/                  # Business logic & DB queries
│   │   ├── usersService.js
│   │   ├── authService.js
│   │   ├── companiesService.js
│   │   ├── categoriesService.js
│   │   ├── jobsService.js
│   │   ├── applicationsService.js
│   │   ├── bookmarksService.js
│   │   └── documentsService.js
│   ├── middleware/
│   │   ├── auth.js                # JWT authenticate middleware
│   │   ├── validate.js            # Joi validation middleware
│   │   └── errorHandler.js        # Global error handler
│   ├── validators/
│   │   └── index.js               # Joi schemas
│   └── utils/
│       └── errors.js              # Custom error classes
├── uploads/                       # Uploaded documents (auto-created)
├── ERD-OpenJob-versi-1.png        # ERD diagram
├── .env                           # (jangan di-commit)
├── .env.example
├── .gitignore
└── package.json
```

---

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/users` | Register user baru |
| GET | `/users/:id` | Get profil user |
| GET | `/companies` | List semua perusahaan |
| GET | `/companies/:id` | Detail perusahaan |
| GET | `/categories` | List semua kategori |
| GET | `/categories/:id` | Detail kategori |
| GET | `/jobs` | List semua lowongan (+ query `?title=&company-name=`) |
| GET | `/jobs/:id` | Detail lowongan |
| GET | `/jobs/company/:companyId` | Lowongan by perusahaan |
| GET | `/jobs/category/:categoryId` | Lowongan by kategori |
| POST | `/authentications` | Login |
| PUT | `/authentications` | Refresh access token |
| GET | `/documents` | List semua dokumen |
| GET | `/documents/:id` | Detail dokumen |

### Protected Endpoints (Bearer Token Required)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/profile` | Profil user yang login |
| GET | `/profile/applications` | Lamaran milik user yang login |
| GET | `/profile/bookmarks` | Bookmark milik user yang login |
| POST | `/companies` | Buat perusahaan |
| PUT | `/companies/:id` | Update perusahaan |
| DELETE | `/companies/:id` | Hapus perusahaan |
| POST | `/categories` | Buat kategori |
| PUT | `/categories/:id` | Update kategori |
| DELETE | `/categories/:id` | Hapus kategori |
| POST | `/jobs` | Buat lowongan |
| PUT | `/jobs/:id` | Update lowongan |
| DELETE | `/jobs/:id` | Hapus lowongan |
| POST | `/applications` | Lamar pekerjaan |
| GET | `/applications` | List semua lamaran |
| GET | `/applications/:id` | Detail lamaran |
| GET | `/applications/user/:userId` | Lamaran by user |
| GET | `/applications/job/:jobId` | Lamaran by lowongan |
| PUT | `/applications/:id` | Update status lamaran |
| DELETE | `/applications/:id` | Hapus lamaran |
| POST | `/jobs/:jobId/bookmark` | Bookmark lowongan |
| GET | `/jobs/:jobId/bookmark/:id` | Detail bookmark |
| DELETE | `/jobs/:jobId/bookmark` | Hapus bookmark |
| GET | `/bookmarks` | Semua bookmark |
| POST | `/documents` | Upload dokumen (multipart/form-data, field: `document`) |
| DELETE | `/documents/:id` | Hapus dokumen |
| DELETE | `/authentications` | Logout |

---

## Fitur Keamanan

- Password di-hash dengan **bcrypt** (salt rounds: 10)
- **Access Token** JWT berlaku **3 jam** (`ACCESS_TOKEN_KEY`)
- **Refresh Token** JWT tersimpan di database (`REFRESH_TOKEN_KEY`)
- Semua kredensial menggunakan **environment variable** (tidak hardcoded)
- Authorization berbasis **kepemilikan resource**

## Database Relations

- `users` → `companies` (1:N, user bisa punya banyak perusahaan)
- `users` → `applications` (1:N)
- `users` → `bookmarks` (1:N)
- `users` → `documents` (1:N)
- `companies` → `jobs` (1:N)
- `categories` → `jobs` (1:N)
- `jobs` → `applications` (1:N)
- `jobs` → `bookmarks` (1:N)

### Unique Constraints
- `users.email` — email harus unik
- `categories.name` — nama kategori harus unik
- `bookmarks(user_id, job_id)` — satu user hanya bisa bookmark satu job sekali
