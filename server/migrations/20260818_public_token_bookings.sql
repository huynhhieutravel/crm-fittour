-- Add public_token to op_tour_bookings for public receipt links
ALTER TABLE op_tour_bookings 
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();

-- Add a unique index to ensure fast lookups by token
CREATE UNIQUE INDEX IF NOT EXISTS idx_op_tour_bookings_public_token ON op_tour_bookings(public_token);
