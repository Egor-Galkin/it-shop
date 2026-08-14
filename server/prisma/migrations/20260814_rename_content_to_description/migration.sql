-- Переименовываем колонку content в description в таблице device_info
ALTER TABLE "device_info" RENAME COLUMN "content" TO "description";