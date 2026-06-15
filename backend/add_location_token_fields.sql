-- Add location token fields to delivery_requests table
-- These fields support the receiver location sharing feature

ALTER TABLE delivery_requests 
ADD COLUMN IF NOT EXISTS locationtoken VARCHAR(255),
ADD COLUMN IF NOT EXISTS locationtokencreatedat TIMESTAMP,
ADD COLUMN IF NOT EXISTS locationsharedat TIMESTAMP;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_delivery_requests_location_token 
ON delivery_requests(locationtoken);

-- Display results
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'delivery_requests' 
    AND column_name IN ('locationtoken', 'locationtokencreatedat', 'locationsharedat')
ORDER BY column_name;
