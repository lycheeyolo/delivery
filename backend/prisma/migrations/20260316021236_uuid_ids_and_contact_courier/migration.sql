/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Courier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DeliveryNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DeliveryOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Household` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `courierId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DeliveryNote` DROP FOREIGN KEY `DeliveryNote_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `DeliveryOrder` DROP FOREIGN KEY `DeliveryOrder_courierId_fkey`;

-- DropForeignKey
ALTER TABLE `DeliveryOrder` DROP FOREIGN KEY `DeliveryOrder_householdId_fkey`;

-- DropForeignKey
ALTER TABLE `Household` DROP FOREIGN KEY `Household_contactId_fkey`;

-- AlterTable
ALTER TABLE `Contact` DROP PRIMARY KEY,
    ADD COLUMN `courierId` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Courier` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DeliveryNote` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `orderId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DeliveryOrder` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `courierId` VARCHAR(191) NOT NULL,
    MODIFY `householdId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Household` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `contactId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `Contact_courierId_idx` ON `Contact`(`courierId`);

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_courierId_fkey` FOREIGN KEY (`courierId`) REFERENCES `Courier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Household` ADD CONSTRAINT `Household_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryOrder` ADD CONSTRAINT `DeliveryOrder_courierId_fkey` FOREIGN KEY (`courierId`) REFERENCES `Courier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryOrder` ADD CONSTRAINT `DeliveryOrder_householdId_fkey` FOREIGN KEY (`householdId`) REFERENCES `Household`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNote` ADD CONSTRAINT `DeliveryNote_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `DeliveryOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `DeliveryOrder` RENAME INDEX `DeliveryOrder_courierId_fkey` TO `DeliveryOrder_courierId_idx`;
