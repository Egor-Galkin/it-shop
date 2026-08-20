-- Add logical unique indexes to prevent seed duplicates without needing explicit id

-- DeviceInfo: один и тот же заголовок характеристики для одного устройства — дубликат
CREATE UNIQUE INDEX IF NOT EXISTS "device_info_deviceId_title_key" 
ON "device_info" ("deviceId", title);

-- DeviceImage: одно и то же изображение для одного устройства — дубликат  
CREATE UNIQUE INDEX IF NOT EXISTS "device_image_deviceId_img_key" 
ON "device_image" ("deviceId", img);