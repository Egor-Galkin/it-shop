-- Fix: Remove duplicates BEFORE creating unique indexes, then apply indexes

-- === 1. Delete duplicates from device_info (keep the one with lowest id) ===
DELETE FROM "device_info"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "device_info"
  GROUP BY "deviceId", title
);

-- === 2. Delete duplicates from device_image (keep the one with lowest id) ===
DELETE FROM "device_image"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "device_image"
  GROUP BY "deviceId", img
);

-- === 3. Now create unique indexes (will succeed because duplicates are gone) ===
CREATE UNIQUE INDEX IF NOT EXISTS "device_info_deviceId_title_key" 
ON "device_info" ("deviceId", title);

CREATE UNIQUE INDEX IF NOT EXISTS "device_image_deviceId_img_key" 
ON "device_image" ("deviceId", img);