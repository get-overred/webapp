-- Create the stored procedure for storing Zendesk tokens in the vault
CREATE OR REPLACE FUNCTION store_zendesk_token(
    p_user_id UUID,
    p_token_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_vault_key TEXT;
    v_result JSONB;
BEGIN
    -- Generate a unique vault key for this user
    v_vault_key := 'zendesk_token_' || p_user_id::text;

    -- Store the token data in the vault
    SELECT vault.store(v_vault_key, p_token_data) INTO v_result;

    -- Return the result
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION store_zendesk_token TO authenticated;

-- Create a function to retrieve the token
CREATE OR REPLACE FUNCTION get_zendesk_token(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_vault_key TEXT;
    v_result JSONB;
BEGIN
    -- Generate the vault key for this user
    v_vault_key := 'zendesk_token_' || p_user_id::text;

    -- Retrieve the token data from the vault
    SELECT vault.retrieve(v_vault_key) INTO v_result;

    -- Return the result
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_zendesk_token TO authenticated; 