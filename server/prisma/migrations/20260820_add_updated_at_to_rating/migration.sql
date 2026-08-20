-- Add updatedAt column to rating table if it doesn't exist
ALTER TABLE "rating" 
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add @updatedAt behavior via trigger (optional, but good for consistency)
-- Prisma will handle updates automatically, so this is just for safety
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_rating_updated_at ON "rating";
CREATE TRIGGER update_rating_updated_at 
  BEFORE UPDATE ON "rating" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();