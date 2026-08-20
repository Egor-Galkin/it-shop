-- Fix: Reset the sequence for the "basket" table to avoid ID conflicts after seed
SELECT setval('"basket_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "basket"), 1), false);