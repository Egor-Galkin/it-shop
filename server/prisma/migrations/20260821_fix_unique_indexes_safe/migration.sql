-- Fix: Idempotent migration for unique indexes (safe to retry)

-- 1. Delete duplicates from device_info (keep lowest id)
DELETE FROM "device_info"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "device_info"
  GROUP BY "deviceId", title
);

-- 2. Delete duplicates from device_image (keep lowest id)
DELETE FROM "device_image"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "device_image"
  GROUP BY "deviceId", img
);

-- 3. Drop existing indexes if they exist (idempotent)
DROP INDEX IF EXISTS "device_info_deviceId_title_key";
DROP INDEX IF EXISTS "device_image_deviceId_img_key";

-- 4. Create unique indexes (now safe)
CREATE UNIQUE INDEX IF NOT EXISTS "device_info_deviceId_title_key" 
ON "device_info" ("deviceId", title);

CREATE UNIQUE INDEX IF NOT EXISTS "device_image_deviceId_img_key" 
ON "device_image" ("deviceId", img);