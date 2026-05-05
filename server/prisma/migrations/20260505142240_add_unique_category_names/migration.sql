/*
  Warnings:

  - A unique constraint covering the columns `[name_es]` on the table `service_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name_en]` on the table `service_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_es_key" ON "service_categories"("name_es");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_en_key" ON "service_categories"("name_en");
