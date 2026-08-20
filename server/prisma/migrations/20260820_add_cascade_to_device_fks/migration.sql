-- Fix: Add ON DELETE CASCADE to foreign keys referencing Device
-- This allows deleting a Device even if it has related records

-- DeviceInfo
ALTER TABLE "device_info" 
DROP CONSTRAINT IF EXISTS "device_info_deviceId_fkey";
ALTER TABLE "device_info" 
ADD CONSTRAINT "device_info_deviceId_fkey" 
FOREIGN KEY ("deviceId") REFERENCES "device"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- DeviceImage
ALTER TABLE "device_image" 
DROP CONSTRAINT IF EXISTS "device_image_deviceId_fkey";
ALTER TABLE "device_image" 
ADD CONSTRAINT "device_image_deviceId_fkey" 
FOREIGN KEY ("deviceId") REFERENCES "device"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Discount
ALTER TABLE "discount" 
DROP CONSTRAINT IF EXISTS "discount_deviceId_fkey";
ALTER TABLE "discount" 
ADD CONSTRAINT "discount_deviceId_fkey" 
FOREIGN KEY ("deviceId") REFERENCES "device"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Rating
ALTER TABLE "rating" 
DROP CONSTRAINT IF EXISTS "rating_deviceId_fkey";
ALTER TABLE "rating" 
ADD CONSTRAINT "rating_deviceId_fkey" 
FOREIGN KEY ("deviceId") REFERENCES "device"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- BasketDevice
ALTER TABLE "basket_device" 
DROP CONSTRAINT IF EXISTS "basket_device_deviceId_fkey";
ALTER TABLE "basket_device" 
ADD CONSTRAINT "basket_device_deviceId_fkey" 
FOREIGN KEY ("deviceId") REFERENCES "device"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;