import { Handler } from '@netlify/functions'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const ZENDESK_CLIENT_ID = process.env.ZENDESK_CLIENT_ID
const ZENDESK_CLIENT_SECRET = process.env.ZENDESK_CLIENT_SECRET

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
}

if (!ZENDESK_CLIENT_ID || !ZENDESK_CLIENT_SECRET) {
    throw new Error('Missing Zendesk configuration')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        }
    }

    try {
        const { code, subdomain, redirect_uri, user_id } = JSON.parse(event.body || '{}')

        if (!code || !subdomain || !user_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Authorization code, subdomain, and user_id are required'
                })
            }
        }

        // Exchange the code for an access token
        const tokenResponse = await axios.post(
            `https://${subdomain}.zendesk.com/oauth/tokens`,
            {
                grant_type: 'authorization_code',
                code,
                client_id: ZENDESK_CLIENT_ID,
                client_secret: ZENDESK_CLIENT_SECRET,
                redirect_uri,
                scope: 'articles:write articles:read'
            },
            { headers: { 'Content-Type': 'application/json' } }
        )

        // Store the token in Supabase Vault
        const { data: vaultData, error: vaultError } = await supabase.rpc('store_zendesk_token', {
            p_user_id: user_id,
            p_token_data: {
                access_token: tokenResponse.data.access_token,
                refresh_token: tokenResponse.data.refresh_token,
                token_type: tokenResponse.data.token_type,
                expires_in: tokenResponse.data.expires_in,
                subdomain,
            }
        })

        if (vaultError) {
            throw new Error(`Failed to store token in vault: ${vaultError.message}`)
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Token stored successfully',
            })
        }
    } catch (error) {
        console.error('Error in Zendesk token exchange:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to exchange token',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
} 