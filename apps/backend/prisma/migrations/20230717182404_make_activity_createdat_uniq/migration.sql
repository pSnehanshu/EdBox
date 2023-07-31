/*
  Warnings:

  - A unique constraint covering the columns `[created_at]` on the table `GroupActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupActivity_created_at_key" ON "GroupActivity"("created_at");
