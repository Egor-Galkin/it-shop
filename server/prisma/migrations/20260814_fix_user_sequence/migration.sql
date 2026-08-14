-- Fix: Reset the sequence for the "user" table to avoid ID conflicts after seed
-- This ensures new users get IDs that don't collide with seeded data

SELECT setval('"user_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "user"), 1), false);