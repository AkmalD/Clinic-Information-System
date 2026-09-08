/*
  Warnings:

  - A unique constraint covering the columns `[tanggal,nomor_antrean]` on the table `queues` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "queues_tanggal_nomor_antrean_key" ON "queues"("tanggal", "nomor_antrean");
