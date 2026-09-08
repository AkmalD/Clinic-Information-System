-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOKTER', 'PETUGAS');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "JenisPembayaran" AS ENUM ('UMUM', 'BPJS', 'ASURANSI');

-- CreateEnum
CREATE TYPE "StatusKunjungan" AS ENUM ('MENUNGGU', 'CHECK_IN', 'PEMERIKSAAN', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusAntrean" AS ENUM ('MENUNGGU', 'DIPANGGIL', 'SELESAI');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poli" (
    "id" SERIAL NOT NULL,
    "nama_poli" TEXT NOT NULL,

    CONSTRAINT "poli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "nama" TEXT NOT NULL,
    "poli_id" INTEGER NOT NULL,
    "no_sip" TEXT,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" SERIAL NOT NULL,
    "nama_obat" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "no_rm" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "no_telp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" SERIAL NOT NULL,
    "no_registrasi" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "poli_id" INTEGER NOT NULL,
    "tanggal_kunjungan" DATE NOT NULL,
    "jenis_pembayaran" "JenisPembayaran" NOT NULL,
    "keluhan_awal" TEXT,
    "status" "StatusKunjungan" NOT NULL DEFAULT 'MENUNGGU',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queues" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "nomor_antrean" TEXT NOT NULL,
    "poli_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "status" "StatusAntrean" NOT NULL DEFAULT 'MENUNGGU',
    "called_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "keluhan" TEXT NOT NULL,
    "tekanan_darah" TEXT NOT NULL,
    "suhu_tubuh" DOUBLE PRECISION NOT NULL,
    "berat_badan" DOUBLE PRECISION NOT NULL,
    "tinggi_badan" DOUBLE PRECISION NOT NULL,
    "diagnosa" TEXT NOT NULL,
    "rencana_terapi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_actions" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "nama_tindakan" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "medical_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" SERIAL NOT NULL,
    "prescription_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "dosis" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "aturan_pakai" TEXT NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_no_rm_key" ON "patients"("no_rm");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");

-- CreateIndex
CREATE INDEX "patients_nama_idx" ON "patients"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_no_registrasi_key" ON "registrations"("no_registrasi");

-- CreateIndex
CREATE INDEX "registrations_tanggal_kunjungan_idx" ON "registrations"("tanggal_kunjungan");

-- CreateIndex
CREATE UNIQUE INDEX "queues_registration_id_key" ON "queues"("registration_id");

-- CreateIndex
CREATE INDEX "queues_tanggal_poli_id_idx" ON "queues"("tanggal", "poli_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_registration_id_key" ON "medical_records"("registration_id");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_poli_id_fkey" FOREIGN KEY ("poli_id") REFERENCES "poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_poli_id_fkey" FOREIGN KEY ("poli_id") REFERENCES "poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_poli_id_fkey" FOREIGN KEY ("poli_id") REFERENCES "poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_actions" ADD CONSTRAINT "medical_actions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
