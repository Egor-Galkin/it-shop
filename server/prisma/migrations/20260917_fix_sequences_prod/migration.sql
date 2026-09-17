-- Fix: Reset sequences for rating and basket tables on production
-- This prevents "Unique constraint failed on the fields: (id)" errors

-- Rating
SELECT setval('"rating_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "rating"), 1), false);

-- Basket
SELECT setval('"basket_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "basket"), 1), false);