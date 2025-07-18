-- Create trash table for soft deletes
CREATE TABLE IF NOT EXISTS trash (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type VARCHAR(50) NOT NULL, -- 'process', 'contract', 'company', 'document'
  item_id VARCHAR(255) NOT NULL,
  item_data JSONB NOT NULL, -- Store the original data
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by UUID REFERENCES auth.users(id),
  original_table VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_trash_item_type ON trash(item_type);
CREATE INDEX idx_trash_deleted_at ON trash(deleted_at);
CREATE INDEX idx_trash_item_id ON trash(item_id);

-- Enable RLS
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;

-- Create policy for trash access
CREATE POLICY "Users can view their own trash items" ON trash
  FOR SELECT USING (auth.uid() = deleted_by);

CREATE POLICY "Users can insert trash items" ON trash
  FOR INSERT WITH CHECK (auth.uid() = deleted_by);

CREATE POLICY "Users can delete their own trash items" ON trash
  FOR DELETE USING (auth.uid() = deleted_by);

-- Function to automatically delete items older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_trash()
RETURNS void AS $$
BEGIN
  DELETE FROM trash 
  WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup daily (if pg_cron is available)
-- SELECT cron.schedule('cleanup-trash', '0 2 * * *', 'SELECT cleanup_old_trash();');