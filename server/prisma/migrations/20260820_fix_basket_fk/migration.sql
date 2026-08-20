-- Fix: Change foreign key constraint on basket_device to use CASCADE instead of RESTRICT
-- This allows deleting a basket even if it has related basket_device records

-- 1. Drop the old constraint
ALTER TABLE "basket_device" 
DROP CONSTRAINT IF EXISTS "basket_device_basketId_fkey";

-- 2. Add new constraint with CASCADE
ALTER TABLE "basket_device" 
ADD CONSTRAINT "basket_device_basketId_fkey" 
FOREIGN KEY ("basketId") 
REFERENCES "basket"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;