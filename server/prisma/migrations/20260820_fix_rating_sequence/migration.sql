-- Fix: Reset the sequence for the "rating" table to avoid ID conflicts after seed
SELECT setval('"rating_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "rating"), 1), false);