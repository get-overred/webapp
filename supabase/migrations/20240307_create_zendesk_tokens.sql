-- Create zendesk_tokens table
CREATE TABLE IF NOT EXISTS zendesk_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT NOT NULL,
    expires_in INTEGER,
    subdomain TEXT NOT NULL,
    user_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_zendesk_tokens_user_id ON zendesk_tokens(user_id);

-- Enable Row Level Security
ALTER TABLE zendesk_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own tokens
CREATE POLICY "Users can only access their own tokens"
    ON zendesk_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_zendesk_tokens_updated_at
    BEFORE UPDATE ON zendesk_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 