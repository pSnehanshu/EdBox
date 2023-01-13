/*
  Warnings:

  - A unique constraint covering the columns `[class_id,school_id]` on the table `StudentsBatch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentsBatch_class_id_school_id_key" ON "StudentsBatch"("class_id", "school_id");
