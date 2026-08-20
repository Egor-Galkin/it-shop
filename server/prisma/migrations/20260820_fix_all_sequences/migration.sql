-- Fix: Reset sequences for ALL tables with autoincrement IDs after seed
-- This prevents "Unique constraint failed on the fields: (id)" errors

-- User
SELECT setval('"user_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "user"), 1), false);

-- Basket
SELECT setval('"basket_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "basket"), 1), false);

-- BasketDevice
SELECT setval('"basket_device_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "basket_device"), 1), false);

-- Rating
SELECT setval('"rating_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "rating"), 1), false);

-- Type
SELECT setval('"type_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "type"), 1), false);

-- Brand
SELECT setval('"brand_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "brand"), 1), false);

-- Device
SELECT setval('"device_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "device"), 1), false);

-- DeviceInfo
SELECT setval('"device_info_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "device_info"), 1), false);

-- DeviceImage
SELECT setval('"device_image_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "device_image"), 1), false);

-- Discount
SELECT setval('"discount_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "discount"), 1), false);

-- DeliveryOption
SELECT setval('"delivery_option_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "delivery_option"), 1), false);